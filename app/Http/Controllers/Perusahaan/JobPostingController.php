<?php

namespace App\Http\Controllers\Perusahaan;

use App\Http\Controllers\Controller;
use App\Models\JobPosting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class JobPostingController extends Controller
{
    public function index()
    {
        $company = Auth::user()->company;

        // Cek jika profil perusahaan belum dibuat, suruh mereka lengkapi dulu
        if (!$company) {
            return redirect()->route('perusahaan.profile.edit')->with('error', 'Silakan lengkapi profil perusahaan terlebih dahulu sebelum memposting lowongan.');
        }

        // Tarik data lowongan milik perusahaan ini
        $jobs = $company->jobPostings()->latest()->get();

        return Inertia::render('Perusahaan/Lowongan/Index', [
            'jobs' => $jobs,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'location' => 'nullable|string|max:255',
            'salary_range' => 'nullable|string|max:255',
            'description' => 'required|string',
            'requirements' => 'nullable|string',
        ]);

        $validated['is_active'] = true; // Default aktif saat pertama kali dibuat

        Auth::user()->company->jobPostings()->create($validated);

        return back()->with('message', 'Lowongan berhasil ditambahkan.');
    }

    public function update(Request $request, JobPosting $lowongan)
    {
        // Validasi keamanan: Pastikan lowongan ini benar milik perusahaan yang sedang login
        if ($lowongan->company_id !== Auth::user()->company->id) abort(403);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'location' => 'nullable|string|max:255',
            'salary_range' => 'nullable|string|max:255',
            'description' => 'required|string',
            'requirements' => 'nullable|string',
        ]);

        $lowongan->update($validated);

        return back()->with('message', 'Data lowongan berhasil diperbarui.');
    }

    public function destroy(JobPosting $lowongan)
    {
        if ($lowongan->company_id !== Auth::user()->company->id) abort(403);
        $lowongan->delete();
        return back()->with('message', 'Lowongan berhasil dihapus.');
    }

    // Fungsi khusus untuk Switch <<extends>> Buka/Tutup Lowongan
    public function toggleStatus(JobPosting $lowongan)
    {
        if ($lowongan->company_id !== Auth::user()->company->id) abort(403);

        $lowongan->update(['is_active' => !$lowongan->is_active]);

        $status = $lowongan->is_active ? 'dibuka' : 'ditutup';
        return back()->with('message', "Lowongan pekerjaan berhasil $status.");
    }
}
