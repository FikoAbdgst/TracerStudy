<?php

namespace App\Http\Controllers\Perusahaan;

use App\Http\Controllers\Controller;
use App\Models\AlumniProfile;
use App\Models\JobApplication;
use App\Models\JobPosting;
use App\Notifications\SystemNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class InviteCandidateController extends Controller
{
    public function __invoke(Request $request)
    {
        $company = Auth::user()->company;

        if (! $company) {
            return back()->with('error', 'Profil perusahaan tidak ditemukan.');
        }

        $validated = $request->validate([
            'alumni_id' => 'required',
            'job_id' => 'required|exists:job_postings,id',
        ]);

        $alumni = AlumniProfile::where('user_id', $validated['alumni_id'])->first();

        if (! $alumni) {
            return back()->with('error', 'Profil alumni tidak ditemukan.');
        }

        $job = JobPosting::where('id', $validated['job_id'])
            ->where('company_id', $company->id)
            ->firstOrFail();

        $exists = JobApplication::where('job_posting_id', $job->id)
            ->where('alumni_id', $alumni->id)
            ->exists();

        if ($exists) {
            return back()->with('error', 'Alumni ini sudah memiliki lamaran untuk lowongan tersebut.');
        }

        JobApplication::create([
            'job_posting_id' => $job->id,
            'alumni_id' => $alumni->id,
            'cv_path' => $alumni->cv_path,
            'status' => 'menunggu',
            'source_type' => 'invitation',
            'invitation_status' => 'pending',
        ]);

        $alumniUser = $alumni->user;

        if ($alumniUser) {
            $alumniUser->notify(new SystemNotification(
                'Undangan Melamar dari '.$company->name,
                "Anda diundang untuk melamar posisi {$job->title} oleh {$company->name}. Buka halaman lamaran untuk merespons.",
                route('alumni.lamaran'),
                'invitation'
            ));
        }

        return back()->with('message', 'Undangan berhasil dikirim kepada '.$alumniUser->name.' untuk posisi '.$job->title.'.');
    }
}
