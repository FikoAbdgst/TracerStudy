<?php

namespace App\Http\Controllers\AdminKampus;

use App\Http\Controllers\Controller;
use App\Models\JobPosting;
use Inertia\Inertia;

class ReviewJobController extends Controller
{
    public function index()
    {
        $jobs = JobPosting::with('company', 'applications')
            ->latest()
            ->get();

        return Inertia::render('AdminKampus/TinjauLowongan/Index', [
            'jobs' => $jobs,
        ]);
    }

    public function show(JobPosting $job)
    {
        $job->load([
            'company',
            'applications.alumni.user',
        ]);

        return Inertia::render('AdminKampus/TinjauLowongan/Show', [
            'job' => $job,
        ]);
    }

    public function forceClose(JobPosting $job)
    {
        $job->update(['is_active' => false]);

        return back()->with('message', 'Lowongan kerja berhasil ditutup paksa.');
    }
}
