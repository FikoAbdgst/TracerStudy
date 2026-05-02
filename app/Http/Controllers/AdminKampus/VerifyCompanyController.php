<?php

namespace App\Http\Controllers\AdminKampus;

use App\Http\Controllers\Controller;
use App\Models\Company;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VerifyCompanyController extends Controller
{
    public function index()
    {
        // Tarik semua data perusahaan, urutkan dari yang pending (belum diverifikasi)
        $companies = Company::with('user')
            ->orderByRaw("CASE WHEN verification_status = 'pending' THEN 1 ELSE 2 END")
            ->latest()
            ->get();

        return Inertia::render('AdminKampus/VerifyPT/Index', [
            'companies' => $companies
        ]);
    }

    public function updateStatus(Request $request, Company $company)
    {
        $validated = $request->validate([
            'verification_status' => 'required|in:pending,verified,rejected',
        ]);

        // Jika diverifikasi, catat tanggalnya
        if ($validated['verification_status'] === 'verified' && $company->verification_status !== 'verified') {
            $validated['verified_at'] = now();
        }

        $company->update($validated);

        return back()->with('message', 'Status verifikasi perusahaan berhasil diubah.');
    }
}
