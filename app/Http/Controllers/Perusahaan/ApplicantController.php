<?php

namespace App\Http\Controllers\Perusahaan;

use App\Http\Controllers\Controller;
use App\Models\JobApplication;
use App\Notifications\SystemNotification;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Helpers\TextSimilarity; // <-- MENGGUNAKAN HELPER TF-IDF

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

        // 2. Kalkulasi Skor Kecocokan (TF-IDF & Cosine Similarity)
        $applicationsWithScore = $applications->map(function ($app) {
            // Siapkan teks lowongan (gabungan deskripsi dan syarat)
            $requirements = is_array($app->jobPosting->requirements)
                ? implode(' ', $app->jobPosting->requirements)
                : ($app->jobPosting->requirements ?? '');

            $teksLowongan = $app->jobPosting->description . ' ' . $requirements;

            // Siapkan teks kandidat (gabungan jurusan dan skill)
            $skills = is_array($app->alumni->skills)
                ? implode(' ', $app->alumni->skills)
                : ($app->alumni->skills ?? '');

            $teksKandidat = ($app->alumni->major ?? '') . ' ' . $skills;

            // Panggil Helper Algoritma
            $skor = TextSimilarity::calculate($teksLowongan, $teksKandidat);

            // Ubah float (0.0 - 1.0) menjadi persentase bulat (0 - 100)
            $app->match_score = round($skor * 100);

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
