<?php

namespace App\Http\Controllers\Alumni;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\JobApplication;
use App\Models\JobPosting;
use App\Notifications\SystemNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class JobPortalController extends Controller
{
    public function index()
    {
        $jobs = JobPosting::with('company')
            ->whereHas('company', function ($query) {
                $query->where('verification_status', 'verified');
            })
            ->where('is_active', true)
            ->latest()
            ->get();

        $user = Auth::user();
        $alumniProfile = $user->alumniProfile;
        $appliedJobIds = $alumniProfile
            ? JobApplication::where('alumni_id', $alumniProfile->id)->pluck('job_posting_id')->toArray()
            : [];

        // Ambil conversation IDs untuk lowongan yang sudah dilamar (untuk tombol "Lanjutkan Obrolan")
        $appliedConversationIds = $alumniProfile
            ? Conversation::whereIn('job_posting_id', $appliedJobIds)
                ->whereHas('participants', fn ($q) => $q->where('user_id', $user->id))
                ->pluck('id', 'job_posting_id')
                ->toArray()
            : [];

        return Inertia::render('Alumni/Loker/Index', [
            'jobs' => $jobs,
            'appliedJobIds' => $appliedJobIds,
            'appliedConversationIds' => $appliedConversationIds,
            'alumniProfile' => $alumniProfile?->only(['id', 'nim', 'major', 'cv_path', 'jenjang_pendidikan']),
        ]);
    }

    public function apply(Request $request, JobPosting $job)
    {
        $job->load('company.user');
        $user = Auth::user();
        $alumniProfile = $user->alumniProfile;

        if (! $alumniProfile) {
            return back()->with('error', 'Silakan lengkapi Profil Alumni Anda terlebih dahulu sebelum melamar.');
        }

        $exists = JobApplication::where('job_posting_id', $job->id)
            ->where('alumni_id', $alumniProfile->id)
            ->exists();

        if ($exists) {
            return back()->with('error', 'Anda sudah pernah melamar ke lowongan ini.');
        }

        $company = $job->company;
        if (! $company || ! $company->user) {
            return back()->with('error', 'Data perusahaan tidak ditemukan.');
        }

        $companyUser = $company->user;

        // Validasi opsi CV
        $validated = $request->validate([
            'cv_option' => 'required|in:profile,upload',
            'cv_file' => 'required_if:cv_option,upload|file|mimes:pdf|max:5120',
        ]);

        // Tentukan path CV
        if ($validated['cv_option'] === 'upload') {
            $cvPath = $request->file('cv_file')->storeAs('cv_documents', preg_replace('/[^a-zA-Z0-9._-]/', '_', $request->file('cv_file')->getClientOriginalName()), 'local');
        } else {
            if (! $alumniProfile->cv_path) {
                return back()->with('error', 'Anda belum memiliki CV di profil. Silakan upload CV terlebih dahulu.');
            }
            $cvPath = $alumniProfile->cv_path;
        }

        // Cari percakapan yang sudah ada untuk lowongan ini (anti double-apply)
        $conversation = Conversation::where('job_posting_id', $job->id)
            ->whereHas('participants', fn ($q) => $q->where('user_id', $user->id))
            ->first();

        if (! $conversation) {
            // Cari percakapan company yang sudah ada dengan perusahaan ini
            $conversation = $user->conversations()
                ->where('type', 'company')
                ->whereHas('participants', fn ($q) => $q->where('user_id', $companyUser->id))
                ->first();
        }

        if (! $conversation) {
            $conversation = Conversation::create([
                'type' => 'company',
                'job_posting_id' => $job->id,
            ]);
            $conversation->users()->attach([$user->id, $companyUser->id]);
        } elseif (! $conversation->job_posting_id) {
            $conversation->update(['job_posting_id' => $job->id]);
        }

        // Buat record lamaran
        JobApplication::create([
            'job_posting_id' => $job->id,
            'alumni_id' => $alumniProfile->id,
            'cv_path' => $cvPath,
            'status' => 'pending',
        ]);

        // Notifikasi perusahaan (tanpa auto-kirim pesan)
        $companyUser->notify(new SystemNotification(
            'Lamaran Baru Masuk!',
            "{$user->name} melamar untuk posisi {$job->title} — buka chat untuk mengirim pesan lamaran.",
            route('messages.index', ['conversation' => $conversation->id]),
            'job_application'
        ));

        // Siapkan draf teks lamaran
        $draftBody = "Halo, saya {$user->name}".($alumniProfile->major ? " dari program studi {$alumniProfile->major}" : '')
            .".\n\nSaya ingin melamar untuk posisi *{$job->title}* di {$company->name}.\n\n"
            ."CV saya terlampir pada pesan ini.\n\n"
            ."Mohon dapat dipertimbangkan.\n\nTerima kasih.";

        return redirect()->route('messages.index', ['conversation' => $conversation->id])
            ->with('draft_body', $draftBody)
            ->with('draft_cv_path', $cvPath)
            ->with('draft_cv_name', 'CV Lamaran - '.$job->title.'.pdf');
    }

    public function updateCv(Request $request, JobPosting $job)
    {
        $alumniProfile = Auth::user()->alumniProfile;

        if (! $alumniProfile) {
            return back()->with('error', 'Profil alumni tidak ditemukan.');
        }

        $request->validate([
            'cv_option' => 'required|in:profile,upload',
            'cv_file' => 'required_if:cv_option,upload|file|mimes:pdf|max:5120',
        ]);

        $application = JobApplication::where('job_posting_id', $job->id)
            ->where('alumni_id', $alumniProfile->id)
            ->first();

        if (! $application) {
            return back()->with('error', 'Anda belum melamar untuk lowongan ini.');
        }

        $path = $application->cv_path;

        if ($request->cv_option === 'upload') {
            if ($application->cv_path && Storage::disk('local')->exists($application->cv_path)) {
                Storage::disk('local')->delete($application->cv_path);
            }
            $path = $request->file('cv_file')->storeAs('cv_documents', preg_replace('/[^a-zA-Z0-9._-]/', '_', $request->file('cv_file')->getClientOriginalName()), 'local');
        } else {
            if (! $alumniProfile->cv_path) {
                return back()->with('error', 'Anda belum memiliki CV di profil.');
            }
            $path = $alumniProfile->cv_path;
        }

        $application->update([
            'cv_path' => $path,
            'status' => 'pending',
        ]);

        return back()->with('message', 'Lamaran berhasil diperbarui!');
    }

    // Fitur 5: Melihat Status Lamaran
    public function applications()
    {
        $alumniProfile = Auth::user()->alumniProfile;

        if (! $alumniProfile) {
            return redirect()->route('alumni.profile.edit')
                ->with('message', 'Silakan lengkapi profil terlebih dahulu.');
        }

        $applications = JobApplication::with(['jobPosting.company'])
            ->where('alumni_id', $alumniProfile->id)
            ->latest()
            ->get();

        return Inertia::render('Alumni/Lamaran/Index', [
            'applications' => $applications,
        ]);
    }
}
