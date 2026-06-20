<?php

namespace App\Http\Controllers;

use App\Models\AlumniProfile;
use App\Models\Company;
use App\Models\JobPosting;
use Illuminate\Support\Facades\Schema;
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

        if (Schema::hasTable('alumni_profiles')) {
            try {
                $allSkills = AlumniProfile::whereNotNull('skills')
                    ->pluck('skills')
                    ->flatten()
                    ->filter()
                    ->countBy()
                    ->sortDesc()
                    ->take(10);

                $topSkills = $allSkills->map(fn ($count, $skill) => [
                    'skill' => $skill,
                    'count' => $count,
                ])->values();
            } catch (\Exception) {
                $topSkills = collect();
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

        return Inertia::render('Welcome', [
            'latestJobs' => $latestJobs,
            'topSkills' => $topSkills,
            'totalAlumni' => $totalAlumni,
            'partnerCompanies' => $partnerCompanies,
        ]);
    }
}
