<?php

namespace App\Http\Controllers\Perusahaan;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        // Ambil data profil perusahaan milik user yang sedang login
        // Sesuaikan 'company' dengan nama relasi di Model User Anda
        $company = $request->user()->company;

        // Data dummy sementara agar dashboard tidak error saat di-render
        $stats = [
            'activeJobs' => 0,
            'totalApplicants' => 0,
            'pendingApplicants' => 0,
            'acceptedApplicants' => 0,
        ];

        return Inertia::render('Perusahaan/Dashboard', [
            'company' => $company,
            'stats' => $stats,
            'recentApplicants' => [], // Nanti diisi dengan data pelamar dari database
        ]);
    }
}
