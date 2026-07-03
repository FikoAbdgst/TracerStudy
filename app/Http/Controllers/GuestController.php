<?php

namespace App\Http\Controllers;

use App\Models\AlumniProfile;
use App\Models\Company;
use App\Models\JobPosting;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class GuestController extends Controller
{
    public function index()
    {
        $latestJobs = collect();
        $topSkills = collect();

        if (Schema::hasTable('job_postings')) {
            try {
                $latestJobs = JobPosting::with('company')
                    ->where('is_active', true)
                    ->latest()
                    ->take(5)
                    ->get()
                    ->map(fn ($job) => [
                        'title' => $job->title,
                        'company' => $job->company->name,
                        'location' => $job->location,
                    ]);
            } catch (\Exception) {
                $latestJobs = collect();
            }
        }

        $totalAlumni = 0;
        if (Schema::hasTable('alumni_profiles')) {
            try {
                $totalAlumni = AlumniProfile::count();
            } catch (\Exception) {
                $totalAlumni = 0;
            }
        }

        $partnerCompanies = collect();
        if (Schema::hasTable('companies') && Schema::hasTable('mou_documents')) {
            try {
                $partnerCompanies = Company::where('verification_status', 'verified')
                    ->whereHas('mouDocuments', fn ($q) => $q->where('status', 'active'))
                    ->take(10)
                    ->get(['id', 'name', 'industry']);
            } catch (\Exception) {
                $partnerCompanies = collect();
            }
        }

        $featuredAlumni = collect();
        if (Schema::hasTable('alumni_profiles')) {
            try {
                $featuredAlumni = AlumniProfile::where('is_open_to_work', true)
                    ->whereHas('user')
                    ->with('user')
                    ->inRandomOrder()
                    ->take(6)
                    ->get()
                    ->map(fn ($alumni) => [
                        'name' => $alumni->user->name,
                        'major' => $alumni->major,
                        'skills' => collect($alumni->skills ?? [])->take(4)->values(),
                        'photo' => $alumni->photo_path ? Storage::url($alumni->photo_path) : null,
                    ]);
            } catch (\Exception) {
                $featuredAlumni = collect();
            }
        }

        return Inertia::render('Welcome', [
            'latestJobs' => $latestJobs,
            'totalAlumni' => $totalAlumni,
            'partnerCompanies' => $partnerCompanies,
            'featuredAlumni' => $featuredAlumni,
        ]);
    }
}
