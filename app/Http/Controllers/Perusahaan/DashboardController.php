<?php

// app/Http/Controllers/Perusahaan/DashboardController.php
namespace App\Http\Controllers\AdminPT;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $company = Auth::user()->company;
        return Inertia::render('Perusahaan/Dashboard', [
            'company' => $company,
            'activeJobs' => $company->jobPostings()->where('is_active', true)->count(),
            'totalApplicants' => $company->jobPostings()->withCount('applications')->get()->sum('applications_count'),
        ]);
    }
}
