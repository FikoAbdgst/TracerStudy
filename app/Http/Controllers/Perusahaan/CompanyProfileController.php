<?php

namespace App\Http\Controllers\Perusahaan;

use App\Http\Controllers\Controller;
use App\Models\MasterCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class CompanyProfileController extends Controller
{
    public function edit()
    {
        $company = Auth::user()->company;

        // Cari kategori di Master Data yang slug-nya mengandung kata 'industri'
        // (Berlaku untuk nama "Industri", "Sektor Industri", dll)
        $category = MasterCategory::with('items')
            ->where('slug', 'like', '%industri%')
            ->first();

        // Jika kategori ditemukan, ambil item di dalamnya. Jika tidak, kirim array kosong.
        $industries = $category ? $category->items : [];

        return Inertia::render('Perusahaan/Profile/Edit', [
            'company' => $company,
            'industries' => $industries, // Data item sekarang berhasil dikirim!
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'industry' => 'required|string|max:255',
            'address' => 'required|string',
            'description' => 'required|string',
            'website' => 'nullable|string|max:255',

            // Tambahkan validasi file gambar
            'logo_file' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        $company = $request->user()->company;

        // --- PROSES UPLOAD LOGO ---
        if ($request->hasFile('logo_file')) {
            // Hapus logo lama dari storage jika sebelumnya sudah ada
            if ($company && $company->logo_url) {
                Storage::disk('public')->delete($company->logo_url);
            }

            // Simpan gambar baru ke folder storage/app/public/company_logos
            $validated['logo_url'] = $request->file('logo_file')->store('company_logos', 'public');
        }

        // Buang logo_file dari array divalidasi agar tidak error saat disimpan ke DB
        unset($validated['logo_file']);
        // --------------------------

        if ($company) {
            $company->update($validated);
        } else {
            $validated['user_id'] = $request->user()->id;
            \App\Models\Company::create($validated);
        }

        return back()->with('message', 'Profil perusahaan dan logo berhasil diperbarui!');
    }
}
