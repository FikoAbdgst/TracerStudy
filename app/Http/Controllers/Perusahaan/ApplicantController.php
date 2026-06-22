<?php

namespace App\Http\Controllers\Perusahaan;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\JobApplication;
use App\Models\Message;
use App\Notifications\SystemNotification;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ApplicantController extends Controller
{
    public function index()
    {
        $company = Auth::user()->company;

        if (! $company) {
            return redirect()->route('perusahaan.profile.edit')->with('error', 'Silakan lengkapi profil terlebih dahulu.');
        }

        $applications = JobApplication::with(['jobPosting', 'alumni.user'])
            ->whereHas('jobPosting', function ($query) use ($company) {
                $query->where('company_id', $company->id);
            })
            ->get();

        $applicationsWithScore = $applications->map(function ($app) {
            $job = $app->jobPosting;
            $alumni = $app->alumni;

            $jobSkills = is_array($job->requirements) ? $job->requirements : [];
            $alumniSkills = is_array($alumni->skills) ? $alumni->skills : [];

            $skillScore = 1.0;
            if (count($jobSkills) > 0) {
                $lowerJobSkills = array_map('strtolower', $jobSkills);
                $lowerAlumniSkills = array_map('strtolower', $alumniSkills);
                $matchedSkills = array_intersect($lowerJobSkills, $lowerAlumniSkills);
                $skillScore = count($matchedSkills) / count($jobSkills);
            }

            $eduScore = 1.0;
            if ($job->min_education) {
                $eduMap = ['SMA/SMK' => 1, 'D3' => 2, 'D4/S1' => 3, 'S1' => 3, 'S2' => 4, 'S3' => 5];
                $jobEdu = $eduMap[$job->min_education] ?? 0;
                $alumniEdu = $eduMap[$alumni->jenjang_pendidikan] ?? 0;
                $eduScore = $alumniEdu >= $jobEdu ? 1.0 : 0.3;
            }

            $expScore = 1.0;
            if ($job->min_experience !== null) {
                $alumniExp = (int) $alumni->experience;
                $expScore = $alumniExp >= $job->min_experience ? 1.0 : ($job->min_experience > 0 ? ($alumniExp / $job->min_experience) : 1.0);
            }

            $ageScore = 1.0;
            if ($job->max_age !== null && $alumni->tanggal_lahir) {
                $alumniAge = Carbon::parse($alumni->tanggal_lahir)->age;
                if ($alumniAge <= $job->max_age) {
                    $ageScore = 1.0;
                } else {
                    $ageDiff = $alumniAge - $job->max_age;
                    $ageScore = max(0, 1.0 - ($ageDiff * 0.2));
                }
            }

            $wSkill = ($job->weight_skill ?? 40) / 100;
            $wEdu = ($job->weight_education ?? 25) / 100;
            $wExp = ($job->weight_experience ?? 20) / 100;
            $wAge = ($job->weight_age ?? 15) / 100;

            $finalScore = ($skillScore * $wSkill) + ($eduScore * $wEdu) + ($expScore * $wExp) + ($ageScore * $wAge);

            $app->match_score = round($finalScore * 100);
            $app->score_details = [
                'skill_match' => round($skillScore * 100),
                'education' => round($eduScore * 100),
                'experience' => round($expScore * 100),
                'age' => round($ageScore * 100),
            ];

            return $app;
        });

        $sortedApps = $applicationsWithScore->sortByDesc('match_score')->values();

        return Inertia::render('Perusahaan/Pelamar/Index', [
            'applications' => $sortedApps,
            'company' => $company->only(['id', 'name', 'address', 'province', 'city', 'latitude', 'longitude']),
        ]);
    }

    public function updateStatus(Request $request, JobApplication $lamaran)
    {
        $lamaran->load(['jobPosting', 'alumni.user']);
        $company = Auth::user()->company;

        if ($lamaran->jobPosting->company_id !== $company->id) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'status' => 'required|in:menunggu,wawancara,diterima,ditolak',
            'notes' => 'nullable|string',
            'hr_notes' => 'nullable|string',
            'interview_details' => 'nullable|array',
            'interview_details.scheduled_at' => 'nullable|date',
            'interview_details.location' => 'nullable|string|max:255',
            'interview_details.latitude' => 'nullable|numeric',
            'interview_details.longitude' => 'nullable|numeric',
            'interview_details.duration' => 'nullable|string|max:10',
            'interview_details.notes' => 'nullable|string',
            'interview_details.interview_mode' => 'nullable|in:online,offline',
        ]);

        // Prevent changing status if already diterima or ditolak (final)
        if (in_array($lamaran->status, ['diterima', 'ditolak'])) {
            return back()->with('error', 'Status lamaran sudah final ("' . $lamaran->status . '"). Tidak dapat diubah lagi.');
        }

        // Prevent re-setting the same non-menunggu status
        if (in_array($validated['status'], ['wawancara', 'diterima', 'ditolak'])
            && $lamaran->status === $validated['status']) {
            return back()->with('error', 'Status lamaran ini sudah ditetapkan sebagai "' . $validated['status'] . '". Tidak dapat memperbarui ke status yang sama.');
        }

        $lamaran->update($validated);

        // Jika status bukan 'menunggu', buat percakapan dan kirim pesan otomatis
        if (in_array($validated['status'], ['wawancara', 'diterima', 'ditolak'])) {
            $hrUser = Auth::user();
            $alumniUser = $lamaran->alumni?->user;

            if ($alumniUser) {
                // Cari atau buat conversation terikat job_application_id
                $conversation = Conversation::where('job_application_id', $lamaran->id)->first();

                if (! $conversation) {
                    $conversation = Conversation::create([
                        'type' => 'company',
                        'job_application_id' => $lamaran->id,
                        'job_posting_id' => $lamaran->job_posting_id,
                        'hr_replied' => true,
                        'rejected_reply_count' => 0,
                    ]);
                    $conversation->users()->attach([$hrUser->id, $alumniUser->id]);
                }

                // Siapkan body pesan dari notes
                $messageBody = $validated['notes'] ?? '';

                if ($validated['status'] === 'ditolak' && empty($messageBody)) {
                    $messageBody = "Terima kasih telah melamar untuk posisi {$lamaran->jobPosting->title}.\n\n"
                        ."Setelah melalui proses seleksi, dengan berat hati kami informasikan bahwa Anda belum lolos kualifikasi pada tahap ini.\n\n"
                        ."Kami berharap Anda dapat mencoba kembali di kesempatan lain.\n\n"
                        ."Salam hangat,\nTim Rekrutmen {$company->name}";
                    $lamaran->update(['notes' => $messageBody]);
                } elseif ($validated['status'] === 'diterima' && empty($messageBody)) {
                    $messageBody = "Selamat! Anda telah diterima untuk posisi {$lamaran->jobPosting->title}.\n\n"
                        ."Kami akan menghubungi Anda untuk informasi lebih lanjut mengenai proses onboarding.\n\n"
                        ."Terima kasih telah melamar di perusahaan kami.\n\n"
                        ."Salam hangat,\nTim Rekrutmen {$company->name}";
                    $lamaran->update(['notes' => $messageBody]);
                } elseif ($validated['status'] === 'wawancara' && empty($messageBody)) {
                    $details = $validated['interview_details'] ?? [];
                    $messageBody = "Selamat! Anda lolos ke tahap wawancara untuk posisi {$lamaran->jobPosting->title}.";
                    if (! empty($details['scheduled_at'])) {
                        $messageBody .= "\n\nJadwal: ".Carbon::parse($details['scheduled_at'])->translatedFormat('l, d F Y H:i');
                    }
                    if (! empty($details['location'])) {
                        $messageBody .= "\nLokasi/Link: ".$details['location'];
                    }
                    if (! empty($details['notes'])) {
                        $messageBody .= "\nCatatan: ".$details['notes'];
                    }
                    $messageBody .= "\n\nSilakan persiapkan diri Anda dengan baik.\n\nSalam hangat,\nTim Rekrutmen {$company->name}";
                    $lamaran->update(['notes' => $messageBody]);
                }

                // Kirim pesan sebagai HR
                Message::create([
                    'conversation_id' => $conversation->id,
                    'sender_id' => $hrUser->id,
                    'body' => $messageBody,
                ]);

                $conversation->touch();

                // Jika ditolak, reset reply counter
                if ($validated['status'] === 'ditolak') {
                    $conversation->update(['rejected_reply_count' => 0]);
                }
            }
        }

        // Kirim notifikasi ke alumni
        if ($lamaran->alumni && $lamaran->alumni->user) {
            $alumniUser = $lamaran->alumni->user;

            $statusLabel = [
                'menunggu' => 'MENUNGGU',
                'wawancara' => 'WAWANCARA',
                'diterima' => 'DITERIMA',
                'ditolak' => 'DITOLAK',
            ][$validated['status']] ?? strtoupper($validated['status']);

            $message = 'Status lamaran Anda untuk posisi '.$lamaran->jobPosting->title.' berubah menjadi: '.$statusLabel;

            if (! empty($validated['notes'])) {
                $message .= "\n\nPesan dari HRD:\n".$validated['notes'];
            }

            $alumniUser->notify(new SystemNotification(
                'Status Lamaran Diperbarui!',
                $message,
                route('alumni.lamaran'),
                'application_status'
            ));
        }

        if (in_array($validated['status'], ['wawancara', 'diterima', 'ditolak']) && isset($conversation)) {
            return redirect()->route('messages.index', ['conversation' => $conversation->id]);
        }

        return back()->with('message', 'Status pelamar berhasil diperbarui.');
    }
}
