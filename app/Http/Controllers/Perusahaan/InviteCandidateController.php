<?php

namespace App\Http\Controllers\Perusahaan;

use App\Http\Controllers\Controller;
use App\Models\AlumniProfile;
use App\Models\Conversation;
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
            return response()->json(['error' => 'Profil perusahaan tidak ditemukan.'], 404);
        }

        $validated = $request->validate([
            'alumni_id' => 'required|exists:alumni_profiles,id',
            'job_posting_id' => 'required|exists:job_postings,id',
        ]);

        $job = JobPosting::where('id', $validated['job_posting_id'])
            ->where('company_id', $company->id)
            ->firstOrFail();

        $alumni = AlumniProfile::with('user')->findOrFail($validated['alumni_id']);
        $companyUser = Auth::user();
        $alumniUser = $alumni->user;

        $existing = $companyUser->conversations()
            ->whereHas('participants', function ($q) use ($alumniUser) {
                $q->where('user_id', $alumniUser->id);
            })
            ->first();

        if ($existing) {
            $conversation = $existing;
        } else {
            $conversation = Conversation::create(['type' => 'direct']);
            $conversation->users()->attach([$companyUser->id, $alumniUser->id]);
        }

        $messageText = "Halo {$alumniUser->name},\n\n"
            ."Kami dari *{$company->name}* mengundang Anda untuk melamar posisi *{$job->title}*.\n\n"
            ."Silakan balas pesan ini jika Anda tertarik atau ingin mengetahui informasi lebih lanjut.\n\n"
            .'Detail lowongan: '.route('alumni.loker')."\n\n"
            ."Terima kasih.\n"
            ."Tim Rekrutmen {$company->name}";

        $conversation->messages()->create([
            'sender_id' => $companyUser->id,
            'message' => $messageText,
        ]);

        $conversation->touch();

        $alumniUser->notify(new SystemNotification(
            'Undangan Melamar dari '.$company->name,
            "Anda diundang untuk melamar posisi {$job->title}",
            route('chat.show', $conversation->id),
            'chat'
        ));

        return response()->json([
            'success' => true,
            'conversation_id' => $conversation->id,
            'redirect' => route('chat.show', $conversation->id),
        ]);
    }
}
