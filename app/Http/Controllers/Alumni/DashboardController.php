<?php

namespace App\Http\Controllers\Alumni;

use App\Http\Controllers\Controller;
use App\Models\JobApplication;
use App\Models\TracerStudyResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $alumniProfile = $user->alumniProfile;

        $hasFilledTracer = false;
        $applicationStatus = [];

        if ($alumniProfile) {
            $hasFilledTracer = TracerStudyResponse::where('alumni_id', $alumniProfile->id)->exists();

            $applicationStatus = JobApplication::with('jobPosting.company')
                ->where('alumni_id', $alumniProfile->id)
                ->latest()
                ->take(5)
                ->get();
        }

        return Inertia::render('Alumni/Dashboard', [
            'hasProfile' => $alumniProfile !== null,
            'hasFilledTracer' => $hasFilledTracer,
            'applicationStatus' => $applicationStatus,
            'employmentStatus' => $alumniProfile?->employment_status ?? 'Tidak Terdeteksi',
        ]);
    }
}
