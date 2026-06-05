<?php

namespace App\Http\Controllers\AdminKampus;

use App\Http\Controllers\Controller;
use App\Models\AlumniProfile;
use App\Models\Company;
use App\Models\MouDocument;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        return Inertia::render('AdminKampus/Dashboard', [
            'stats' => [
                'totalAlumni' => AlumniProfile::count(),
                'totalCompanies' => Company::count(),
                'activeMoU' => MouDocument::where('status', 'active')->count(),
                'responseRate' => 75,
            ],
        ]);
    }
}
