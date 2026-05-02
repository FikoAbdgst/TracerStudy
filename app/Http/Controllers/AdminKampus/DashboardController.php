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

                // --- BAGIAN YANG DIPERBAIKI ---
                // Ubah dari 'is_verified', false menjadi 'verification_status', 'pending'
                'pendingCompanies' => Company::where('verification_status', 'pending')->count(),

                'responseRate' => 75, // Contoh kalkulasi sementara
            ]
        ]);
    }
}
