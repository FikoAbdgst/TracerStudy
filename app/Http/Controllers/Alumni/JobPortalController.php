<?php

namespace App\Http\Controllers\Alumni;

use App\Http\Controllers\Controller;
use App\Models\JobPosting;
use App\Models\JobApplication;
use App\Notifications\SystemNotification;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class JobPortalController extends Controller
{
    // Fitur 3: Melihat Lowongan (Bursa Kerja)
    public function index()
    {
        // REVISI TERBARU: 
        // Pastikan job posting TIDAK AKAN AKTIF/TAMPIL jika status perusahaan bukan 'verified'.
        // Walaupun dari data perusahaannya loker tersebut statusnya dibuka (is_active = true).
        $jobs = JobPosting::with('company')
            ->whereHas('company', function ($query) {
                $query->where('verification_status', 'verified');
            })
            ->where('is_active', true)
            ->latest()
            ->get();

        // Cek lowongan mana saja yang sudah dilamar oleh alumni ini
        $alumniProfile = Auth::user()->alumniProfile;
        $appliedJobIds = $alumniProfile
            ? JobApplication::where('alumni_id', $alumniProfile->id)->pluck('job_posting_id')->toArray()
            : [];

        return Inertia::render('Alumni/Loker/Index', [
            'jobs' => $jobs,
            'appliedJobIds' => $appliedJobIds,
        ]);
    }

    public function apply(Request $request, JobPosting $job)
    {
        $alumniProfile = Auth::user()->alumniProfile;

        if (!$alumniProfile) {
            return back()->with('error', 'Silakan lengkapi Profil Alumni Anda terlebih dahulu sebelum melamar.');
        }

        $request->validate([
            'cv_file' => 'required|file|mimes:pdf|max:5120',
        ]);

        $exists = JobApplication::where('job_posting_id', $job->id)
            ->where('alumni_id', $alumniProfile->id)
            ->exists();

        if ($exists) {
            return back()->with('error', 'Anda sudah pernah melamar ke lowongan ini.');
        }

        $path = $request->file('cv_file')->store('cv_documents', 'public');

        JobApplication::create([
            'job_posting_id' => $job->id,
            'alumni_id' => $alumniProfile->id,
            'cv_path' => $path,
            'status' => 'pending',
        ]);

        // Kirim Notifikasi
        if ($job->company && $job->company->user) {
            $hrdUser = $job->company->user;
            $hrdUser->notify(new SystemNotification(
                'Lamaran Baru Masuk!',
                $alumniProfile->user->name . ' telah melamar untuk posisi ' . $job->title,
                route('perusahaan.pelamar')
            ));
        }

        return back()->with('message', 'Lamaran dan CV Anda berhasil dikirim!');
    }

    public function updateCv(Request $request, JobPosting $job)
    {
        $alumniProfile = Auth::user()->alumniProfile;

        if (!$alumniProfile) {
            return back()->with('error', 'Profil alumni tidak ditemukan.');
        }

        $request->validate([
            'cv_file' => 'required|file|mimes:pdf|max:5120',
        ]);

        // Cari lamaran yang sudah ada
        $application = JobApplication::where('job_posting_id', $job->id)
            ->where('alumni_id', $alumniProfile->id)
            ->first();

        if (!$application) {
            return back()->with('error', 'Anda belum melamar untuk lowongan ini.');
        }

        // Hapus file CV lama dari storage (agar penyimpanan tidak penuh)
        if ($application->cv_path && Storage::disk('public')->exists($application->cv_path)) {
            Storage::disk('public')->delete($application->cv_path);
        }

        // Simpan file CV baru
        $path = $request->file('cv_file')->store('cv_documents', 'public');

        // Update database (Opsional: status diubah lagi ke 'pending' jika Anda ingin HRD tahu ada update)
        $application->update([
            'cv_path' => $path,
            'status' => 'pending',
        ]);

        return back()->with('message', 'File CV Anda berhasil diperbarui!');
    }

    // Fitur 5: Melihat Status Lamaran
    public function applications()
    {
        $alumniProfile = Auth::user()->alumniProfile;

        if (!$alumniProfile) {
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