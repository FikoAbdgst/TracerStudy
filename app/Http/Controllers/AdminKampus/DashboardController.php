<?php

namespace App\Http\Controllers\AdminKampus;

use App\Http\Controllers\Controller;
use App\Models\AlumniProfile;
use App\Models\Company;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        return Inertia::render('AdminKampus/Dashboard', [
            'stats' => [
                'totalAlumni' => AlumniProfile::count(),
                'pendingCompanies' => Company::where('is_verified', false)->count(),
                'responseRate' => 75, // Contoh kalkulasi % kuesioner
            ]
        ]);
    }
}
