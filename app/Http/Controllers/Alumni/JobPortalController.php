<?php

namespace App\Http\Controllers\Alumni;

use App\Http\Controllers\Controller;
use App\Models\JobPosting;
use App\Models\JobApplication;
use App\Notifications\SystemNotification;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class JobPortalController extends Controller
{
    // Fitur 3: Melihat Lowongan (Bursa Kerja)
    public function index()
    {
        // 1. Tarik lowongan yang aktif DAN perusahaannya sudah diverifikasi kampus
        $jobs = JobPosting::with('company')
            ->where('is_active', true)
            ->whereHas('company', function ($query) {
                $query->where('verification_status', 'verified');
            })
            ->latest()
            ->get();

        // 2. Cek lowongan mana saja yang sudah dilamar oleh alumni ini
        $alumniProfile = Auth::user()->alumniProfile;
        $appliedJobIds = $alumniProfile
            ? JobApplication::where('alumni_id', $alumniProfile->id)->pluck('job_posting_id')->toArray()
            : [];

        return Inertia::render('Alumni/Loker/Index', [
            'jobs' => $jobs,
            'appliedJobIds' => $appliedJobIds,
        ]);
    }

    // Fitur 4: Melamar Pekerjaan (Upload CV)
    public function apply(Request $request, JobPosting $job)
    {
        $alumniProfile = Auth::user()->alumniProfile;

        // Cegah alumni melamar jika profilnya belum diisi
        if (!$alumniProfile) {
            return back()->with('error', 'Silakan lengkapi Profil Alumni Anda terlebih dahulu sebelum melamar.');
        }

        $request->validate([
            'cv_file' => 'required|file|mimes:pdf|max:5120', // Wajib PDF, maks 5MB
        ]);

        // Cegah melamar lowongan yang sama 2 kali
        $exists = JobApplication::where('job_posting_id', $job->id)
            ->where('alumni_id', $alumniProfile->id)
            ->exists();

        if ($exists) {
            return back()->with('error', 'Anda sudah pernah melamar ke lowongan ini.');
        }

        // Upload CV
        $path = $request->file('cv_file')->store('cv_documents', 'public');

        // Simpan data lamaran
        JobApplication::create([
            'job_posting_id' => $job->id,
            'alumni_id' => $alumniProfile->id,
            'cv_path' => $path,
            'status' => 'pending',
        ]);
        $hrd = $job->company->user; // Asumsi tabel company punya user_id
        $hrd->notify(new SystemNotification(
            'Lamaran Baru Masuk!',
            $alumniProfile->user->name . ' telah melamar untuk posisi ' . $job->title,
            route('perusahaan.pelamar') // URL tujuan jika di klik
        ));

        return back()->with('message', 'Lamaran dan CV Anda berhasil dikirim!');
    }

    // Fitur 5: Melihat Status Lamaran
    public function applications()
    {
        $alumniProfile = Auth::user()->alumniProfile;

        if (!$alumniProfile) {
            return redirect()->route('alumni.profile.edit')
                ->with('message', 'Silakan lengkapi profil terlebih dahulu.');
        }

        // Tarik riwayat lamaran alumni beserta data lowongan dan perusahaannya
        $applications = JobApplication::with(['jobPosting.company'])
            ->where('alumni_id', $alumniProfile->id)
            ->latest()
            ->get();

        return Inertia::render('Alumni/Lamaran/Index', [
            'applications' => $applications,
        ]);
    }
}
