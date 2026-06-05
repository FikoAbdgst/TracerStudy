<?php

namespace App\Http\Controllers\Alumni;

use App\Http\Controllers\Controller;
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

        return Inertia::render('Alumni/Loker/Index', [
            'jobs' => $jobs,
            'appliedJobIds' => $appliedJobIds,
            'alumniProfile' => $alumniProfile?->only(['id', 'nim', 'major', 'cv_path', 'jenjang_pendidikan']),
        ]);
    }

    public function apply(Request $request, JobPosting $job)
    {
        $alumniProfile = Auth::user()->alumniProfile;

        if (! $alumniProfile) {
            return back()->with('error', 'Silakan lengkapi Profil Alumni Anda terlebih dahulu sebelum melamar.');
        }

        $request->validate([
            'cv_option' => 'required|in:profile,upload',
            'cv_file' => 'required_if:cv_option,upload|file|mimes:pdf|max:5120',
        ]);

        $exists = JobApplication::where('job_posting_id', $job->id)
            ->where('alumni_id', $alumniProfile->id)
            ->exists();

        if ($exists) {
            return back()->with('error', 'Anda sudah pernah melamar ke lowongan ini.');
        }

        if ($request->cv_option === 'upload') {
            $path = $request->file('cv_file')->store('cv_documents', 'public');
        } else {
            if (! $alumniProfile->cv_path) {
                return back()->with('error', 'Anda belum memiliki CV di profil. Silakan upload CV terlebih dahulu.');
            }
            $path = $alumniProfile->cv_path;
        }

        JobApplication::create([
            'job_posting_id' => $job->id,
            'alumni_id' => $alumniProfile->id,
            'cv_path' => $path,
            'status' => 'pending',
        ]);

        if ($job->company && $job->company->user) {
            $hrdUser = $job->company->user;
            $hrdUser->notify(new SystemNotification(
                'Lamaran Baru Masuk!',
                $alumniProfile->user->name.' telah melamar untuk posisi '.$job->title,
                route('perusahaan.pelamar'),
                'job_application'
            ));
        }

        return back()->with('message', 'Lamaran dan CV Anda berhasil dikirim!');
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
            if ($application->cv_path && Storage::disk('public')->exists($application->cv_path)) {
                Storage::disk('public')->delete($application->cv_path);
            }
            $path = $request->file('cv_file')->store('cv_documents', 'public');
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
