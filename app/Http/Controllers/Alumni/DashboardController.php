<?php

namespace App\Http\Controllers\Alumni;

use App\Http\Controllers\Controller;
use App\Models\TracerStudyResponse;
use App\Models\JobApplication;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $alumniProfile = $user->alumniProfile;

        // Siapkan nilai default (jika alumni belum mengisi profil sama sekali)
        $hasFilledTracer = false;
        $applicationStatus = [];

        // Jika profil alumni sudah ada, baru kita tarik datanya
        if ($alumniProfile) {
            // Cek apakah alumni ini sudah pernah mengisi kuesioner apapun
            $hasFilledTracer = TracerStudyResponse::where('alumni_id', $alumniProfile->id)->exists();

            // Tarik 5 data lamaran terbaru beserta info loker dan perusahaannya
            $applicationStatus = JobApplication::with('jobPosting.company')
                ->where('alumni_id', $alumniProfile->id)
                ->latest()
                ->take(5)
                ->get();
        }

        return Inertia::render('Alumni/Dashboard', [
            'hasProfile' => $alumniProfile !== null, // Berguna untuk ngasih peringatan di frontend jika profil kosong
            'hasFilledTracer' => $hasFilledTracer,
            'applicationStatus' => $applicationStatus,
        ]);
    }
}
