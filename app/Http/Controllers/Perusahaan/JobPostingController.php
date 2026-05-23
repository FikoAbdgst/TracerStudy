<?php

namespace App\Http\Controllers\Perusahaan;

use App\Http\Controllers\Controller;
use App\Models\JobPosting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class JobPostingController extends Controller
{
    public function index(Request $request)
    {
        $company = $request->user()->company;
        if (!$company) {
            return redirect()->route('perusahaan.profile.edit')->with('message', 'Silakan lengkapi profil perusahaan Anda terlebih dahulu.');
        }

        $jobs = JobPosting::where('company_id', $company->id)->latest()->get();

        // 1. Ambil Master Data Keahlian
        $keahlianCat = \App\Models\MasterCategory::with('items')->where('slug', 'keahlian')->first();
        $keahlianMaster = $keahlianCat ? $keahlianCat->items : [];

        return Inertia::render('Perusahaan/Lowongan/Index', [
            'jobs' => $jobs,
            'isVerified' => $company->verification_status === 'verified',
            'verificationStatus' => $company->verification_status,
            'keahlianMaster' => $keahlianMaster, // 2. Kirim ke React
        ]);
    }

    public function store(Request $request)
    {
        $company = $request->user()->company;

        if ($company->verification_status !== 'verified') {
            return back()->with('error', 'Perusahaan Anda belum terverifikasi. Tidak dapat memposting lowongan.');
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'requirements' => 'nullable|array',
            'location' => 'nullable|string|max:255',
            'salary_range' => 'nullable|string|max:255',
            'is_active' => 'boolean',
            'min_education' => 'nullable|string|max:255',
            'min_experience' => 'nullable|integer|min:0',
            'max_age' => 'nullable|integer|min:0',
            'work_model' => 'nullable|string|in:WFO,WFH,Hybrid,WFA',
        ]);

        $validated['company_id'] = $company->id;
        JobPosting::create($validated);

        return back()->with('message', 'Lowongan berhasil dipublikasikan.');
    }

    public function update(Request $request, JobPosting $job)
    {
        $company = $request->user()->company;

        if ($job->company_id !== $company->id) abort(403);

        if ($company->verification_status !== 'verified') {
            return back()->with('error', 'Izin posting dicabut. Anda tidak dapat mengubah status lowongan saat ini.');
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'requirements' => 'nullable|array',
            'location' => 'nullable|string|max:255',
            'salary_range' => 'nullable|string|max:255',
            'is_active' => 'boolean',
            'min_education' => 'nullable|string|max:255',
            'min_experience' => 'nullable|integer|min:0',
            'max_age' => 'nullable|integer|min:0',
            'work_model' => 'nullable|string|in:WFO,WFH,Hybrid,WFA',

            // Validasi Bobot Dinamis
            'weight_skill' => 'required|integer|min:0|max:100',
            'weight_education' => 'required|integer|min:0|max:100',
            'weight_experience' => 'required|integer|min:0|max:100',
            'weight_age' => 'required|integer|min:0|max:100',

        ]);
        $job->update($validated);
        return back()->with('message', 'Lowongan berhasil diperbarui.');
    }

    public function destroy(JobPosting $job, Request $request)
    {
        if ($job->company_id !== $request->user()->company->id) abort(403);

        $job->delete();

        return back()->with('message', 'Lowongan berhasil dihapus.');
    }

    public function toggleStatus(Request $request, JobPosting $job)
    {
        $company = $request->user()->company;

        if ($job->company_id !== $company->id) abort(403);

        if ($company->verification_status !== 'verified') {
            return back()->with('error', 'Izin posting dicabut. Anda tidak dapat mengubah status lowongan saat ini.');
        }

        $job->update([
            'is_active' => !$job->is_active
        ]);

        $statusMsg = $job->is_active ? 'dibuka' : 'ditutup';
        return back()->with('message', "Status lowongan berhasil {$statusMsg}.");
    }
}
