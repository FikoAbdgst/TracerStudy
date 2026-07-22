<?php

namespace App\Http\Controllers\AdminKampus;

use App\Http\Controllers\Controller;
use App\Models\AlumniProfile;
use App\Models\Company;
use App\Models\MouDocument;
use App\Models\TracerStudyResponse;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $totalAlumni = AlumniProfile::count();
        $responseRate = $totalAlumni > 0
            ? round(TracerStudyResponse::distinct('alumni_id')->count('alumni_id') / $totalAlumni * 100)
            : 0;

        return Inertia::render('AdminKampus/Dashboard', [
            'stats' => [
                'totalAlumni' => $totalAlumni,
                'totalCompanies' => Company::count(),
                'activeMoU' => MouDocument::where('status', 'active')->count(),
                'responseRate' => $responseRate,
            ],
        ]);
    }
}
