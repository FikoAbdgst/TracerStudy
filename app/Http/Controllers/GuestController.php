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
                        'id' => $job->id,
                        'title' => $job->title,
                        'company' => $job->company->name,
                        'company_id' => $job->company_id,
                        'description' => $job->description,
                        'requirements' => $job->requirements,
                        'location' => $job->location,
                        'salary_range' => $job->salary_range,
                        'work_model' => $job->work_model,
                        'min_education' => $job->min_education,
                        'min_experience' => $job->min_experience,
                        'max_age' => $job->max_age,
                        'job_type' => $job->job_type,
                        'deadline' => $job->deadline,
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
                    ->with(['jobPostings' => fn ($q) => $q->where('is_active', true)])
                    ->take(10)
                    ->get()
                    ->map(fn ($company) => [
                        'id' => $company->id,
                        'name' => $company->name,
                        'industry' => $company->industry,
                        'description' => $company->description,
                        'address' => $company->address,
                        'website' => $company->website,
                        'latitude' => $company->latitude,
                        'longitude' => $company->longitude,
                        'jobPostings' => $company->jobPostings->map(fn ($job) => [
                            'id' => $job->id,
                            'title' => $job->title,
                            'description' => $job->description,
                            'location' => $job->location,
                            'salary_range' => $job->salary_range,
                            'work_model' => $job->work_model,
                            'min_education' => $job->min_education,
                            'min_experience' => $job->min_experience,
                        ]),
                    ]);
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
                        'judul_skripsi' => $alumni->judul_skripsi,
                        'portofolio_proyek' => collect($alumni->portofolio_proyek ?? [])->map(fn ($p) => [
                            'nama_proyek' => $p['nama_proyek'] ?? null,
                            'deskripsi_singkat' => $p['deskripsi_singkat'] ?? null,
                            'tautan' => $p['tautan'] ?? null,
                        ]),
                        'employment_status' => $alumni->employment_status,
                        'company_name' => $alumni->company_name,
                        'graduation_year' => $alumni->graduation_year,
                        'jenjang_pendidikan' => $alumni->jenjang_pendidikan,
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

    public function showCompany(Company $company)
    {
        $company->load(['jobPostings' => fn ($q) => $q->where('is_active', true)]);

        return Inertia::render('Guest/CompanyDetail', [
            'company' => $company,
        ]);
    }
}
