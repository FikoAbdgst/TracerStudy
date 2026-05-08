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
            return redirect()->route('perusahaan.profile.edit')
                ->with('message', 'Silakan lengkapi profil perusahaan Anda terlebih dahulu.');
        }

        $jobs = JobPosting::where('company_id', $company->id)->latest()->get();

        return Inertia::render('Perusahaan/Lowongan/Index', [
            'jobs' => $jobs,
            // Kirim status verifikasi ke React agar bisa di-block di Frontend
            'isVerified' => $company->verification_status === 'verified',
            'verificationStatus' => $company->verification_status,
        ]);
    }

    public function store(Request $request)
    {
        $company = $request->user()->company;

        // REVISI: Cek status verifikasi sebelum mengizinkan posting
        if ($company->verification_status !== 'verified') {
            return back()->with('error', 'Perusahaan Anda belum terverifikasi. Tidak dapat memposting lowongan.');
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'location' => 'nullable|string|max:255',
            'salary_range' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        $validated['company_id'] = $company->id;
        JobPosting::create($validated);

        return back()->with('message', 'Lowongan berhasil dipublikasikan.');
    }

    public function update(Request $request, JobPosting $job)
    {
        $company = $request->user()->company;

        if ($job->company_id !== $company->id) abort(403);

        // REVISI: Cegah perusahaan mengaktifkan loker jika izin dicabut
        if ($company->verification_status !== 'verified') {
            return back()->with('error', 'Izin posting dicabut. Anda tidak dapat mengubah status lowongan saat ini.');
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'location' => 'nullable|string|max:255',
            'salary_range' => 'nullable|string|max:255',
            'is_active' => 'boolean',
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

    // ─── TAMBAHKAN METODE INI UNTUK MENGATASI ERROR TOGGLE ───
    public function toggleStatus(Request $request, JobPosting $job)
    {
        $company = $request->user()->company;

        // Pastikan hanya pemilik lowongan yang bisa mengubahnya
        if ($job->company_id !== $company->id) abort(403);

        // Validasi: Jika status perusahaan bukan 'verified', tidak bisa toggle
        if ($company->verification_status !== 'verified') {
            return back()->with('error', 'Izin posting dicabut. Anda tidak dapat mengubah status lowongan saat ini.');
        }

        // Toggle status is_active (jika true jadi false, jika false jadi true)
        $job->update([
            'is_active' => !$job->is_active
        ]);

        $statusMsg = $job->is_active ? 'dibuka' : 'ditutup';
        return back()->with('message', "Status lowongan berhasil {$statusMsg}.");
    }
}
