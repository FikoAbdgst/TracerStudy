<?php

namespace App\Http\Controllers\AdminKampus;

use App\Http\Controllers\Controller;
use App\Models\JobPosting;
use Inertia\Inertia;

class ReviewJobController extends Controller
{
    public function index()
    {
        // Tarik semua lowongan aktif beserta data perusahaannya
        $jobs = JobPosting::with('company')
            ->where('is_active', true)
            ->latest()
            ->get();

        return Inertia::render('AdminKampus/TinjauLowongan/Index', [
            'jobs' => $jobs
        ]);
    }

    // Aksi Tutup Paksa
    public function forceClose(JobPosting $job)
    {
        $job->update(['is_active' => false]);
        return back()->with('message', 'Lowongan kerja berhasil ditutup paksa.');
    }
}
