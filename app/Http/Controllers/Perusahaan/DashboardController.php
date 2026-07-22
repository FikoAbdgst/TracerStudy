<?php

namespace App\Http\Controllers\Perusahaan;

use App\Http\Controllers\Controller;
use App\Models\JobApplication;
use App\Models\JobPosting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $company = $request->user()->company;

        if (! $company) {
            return Inertia::render('Perusahaan/Dashboard', [
                'company' => null,
                'stats' => [
                    'activeJobs' => 0,
                    'totalApplicants' => 0,
                    'pendingApplicants' => 0,
                    'acceptedApplicants' => 0,
                ],
                'recentApplicants' => [],
            ]);
        }

        $activeJobs = JobPosting::where('company_id', $company->id)->where('is_active', true)->count();

        $jobIds = JobPosting::where('company_id', $company->id)->pluck('id');

        $totalApplicants = JobApplication::whereIn('job_posting_id', $jobIds)->count();
        $pendingApplicants = JobApplication::whereIn('job_posting_id', $jobIds)->where('status', 'menunggu')->count();
        $acceptedApplicants = JobApplication::whereIn('job_posting_id', $jobIds)->where('status', 'diterima')->count();

        $recentApplicants = JobApplication::with(['alumni.user', 'jobPosting'])
            ->whereIn('job_posting_id', $jobIds)
            ->latest()
            ->take(5)
            ->get()
            ->map(fn ($app) => [
                'id' => $app->id,
                'status' => $app->status,
                'alumni' => [
                    'user' => [
                        'name' => $app->alumni?->user?->name ?? 'Alumni',
                    ],
                ],
                'job_posting' => [
                    'title' => $app->jobPosting?->title ?? '-',
                ],
            ]);

        return Inertia::render('Perusahaan/Dashboard', [
            'company' => $company,
            'stats' => [
                'activeJobs' => $activeJobs,
                'totalApplicants' => $totalApplicants,
                'pendingApplicants' => $pendingApplicants,
                'acceptedApplicants' => $acceptedApplicants,
            ],
            'recentApplicants' => $recentApplicants,
        ]);
    }
}
