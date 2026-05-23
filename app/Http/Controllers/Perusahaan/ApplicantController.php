<?php

namespace App\Http\Controllers\Perusahaan;

use App\Http\Controllers\Controller;
use App\Models\JobApplication;
use App\Notifications\SystemNotification;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class ApplicantController extends Controller
{
    public function index()
    {
        $company = Auth::user()->company;

        if (!$company) {
            return redirect()->route('perusahaan.profile.edit')->with('error', 'Silakan lengkapi profil terlebih dahulu.');
        }

        // 1. Tarik semua data pelamar untuk perusahaan ini
        $applications = JobApplication::with(['jobPosting', 'alumni.user'])
            ->whereHas('jobPosting', function ($query) use ($company) {
                $query->where('company_id', $company->id);
            })
            ->get();

        // 2. Kalkulasi Skor Kecocokan (Weighted ATS Scoring)
        $applicationsWithScore = $applications->map(function ($app) {
            $job = $app->jobPosting;
            $alumni = $app->alumni;

            // --- A. SKOR KEAHLIAN (PURE SKILL MATCH) : BOBOT 40% ---
            $jobSkills = is_array($job->requirements) ? $job->requirements : [];
            $alumniSkills = is_array($alumni->skills) ? $alumni->skills : [];

            $skillScore = 1.0; // Beri poin penuh jika perusahaan tidak menetapkan syarat skill

            if (count($jobSkills) > 0) {
                // Ubah semua skill ke huruf kecil agar pencocokan tidak sensitif (huruf besar/kecil)
                $lowerJobSkills = array_map('strtolower', $jobSkills);
                $lowerAlumniSkills = array_map('strtolower', $alumniSkills);

                // Cari irisan array (Skill pelamar yang sama persis dengan syarat lowongan)
                $matchedSkills = array_intersect($lowerJobSkills, $lowerAlumniSkills);

                // Rumus: (Jumlah Skill Pelamar yang Cocok) dibagi (Jumlah Skill yang Diminta HRD)
                $skillScore = count($matchedSkills) / count($jobSkills);
            }

            // --- B. SKOR PENDIDIKAN : BOBOT 25% ---
            $eduScore = 1.0; // Default 100% jika perusahaan tidak mensyaratkan
            if ($job->min_education) {
                // Mapping hierarki pendidikan menjadi angka
                $eduMap = ['SMA/SMK' => 1, 'D3' => 2, 'D4/S1' => 3, 'S1' => 3, 'S2' => 4, 'S3' => 5];
                $jobEdu = $eduMap[$job->min_education] ?? 0;
                $alumniEdu = $eduMap[$alumni->jenjang_pendidikan] ?? 0;

                if ($alumniEdu >= $jobEdu) {
                    $eduScore = 1.0; // Memenuhi atau melebihi standar
                } else {
                    $eduScore = 0.3; // Penalti berat jika di bawah standar pendidikan
                }
            }

            // --- C. SKOR PENGALAMAN : BOBOT 20% ---
            $expScore = 1.0;
            if ($job->min_experience !== null) {
                $alumniExp = (int) $alumni->experience;
                if ($alumniExp >= $job->min_experience) {
                    $expScore = 1.0;
                } else {
                    // Proporsional (Contoh: Butuh 2 thn, pelamar 1 thn = Skor 0.5)
                    $expScore = $job->min_experience > 0 ? ($alumniExp / $job->min_experience) : 1.0;
                }
            }

            // --- D. SKOR USIA : BOBOT 15% ---
            $ageScore = 1.0;
            if ($job->max_age !== null && $alumni->tanggal_lahir) {
                $alumniAge = Carbon::parse($alumni->tanggal_lahir)->age;

                if ($alumniAge <= $job->max_age) {
                    $ageScore = 1.0;
                } else {
                    // Penalti bertahap: Kurangi skor 20% untuk setiap 1 tahun kelebihan usia
                    $ageDiff = $alumniAge - $job->max_age;
                    $ageScore = max(0, 1.0 - ($ageDiff * 0.2));
                }
            }

            $wSkill = ($job->weight_skill ?? 40) / 100;
            $wEdu   = ($job->weight_education ?? 25) / 100;
            $wExp   = ($job->weight_experience ?? 20) / 100;
            $wAge   = ($job->weight_age ?? 15) / 100;

            $finalScore = ($skillScore * $wSkill) + ($eduScore * $wEdu) + ($expScore * $wExp) + ($ageScore * $wAge);

            // Ubah menjadi persentase bulat
            $app->match_score = round($finalScore * 100);

            // Simpan rincian skor TANPA label tulisan persen (agar UI React yang urus)
            $app->score_details = [
                'skill_match' => round($skillScore * 100),
                'education' => round($eduScore * 100),
                'experience' => round($expScore * 100),
                'age' => round($ageScore * 100)
            ];
            return $app;
        });

        // 3. Urutkan dari skor tertinggi sebagai default
        $sortedApps = $applicationsWithScore->sortByDesc('match_score')->values();

        return Inertia::render('Perusahaan/Pelamar/Index', [
            'applications' => $sortedApps,
        ]);
    }

    public function updateStatus(Request $request, JobApplication $lamaran)
    {
        $company = Auth::user()->company;
        if ($lamaran->jobPosting->company_id !== $company->id) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'status' => 'required|in:pending,direview,wawancara,diterima,ditolak',
            'notes' => 'nullable|string'
        ]);

        $lamaran->update($validated);

        if ($lamaran->alumni && $lamaran->alumni->user) {
            $alumniUser = $lamaran->alumni->user;
            $alumniUser->notify(new SystemNotification(
                'Status Lamaran Diperbarui!',
                'Status lamaran Anda untuk posisi ' . $lamaran->jobPosting->title . ' berubah menjadi: ' . strtoupper($validated['status']),
                route('alumni.lamaran')
            ));
        }

        return back()->with('message', 'Status pelamar berhasil diperbarui.');
    }
}
