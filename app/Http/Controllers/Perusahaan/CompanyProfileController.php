<?php

namespace App\Http\Controllers\Perusahaan;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\MasterCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class CompanyProfileController extends Controller
{
    public function getAddress()
    {
        $company = Auth::user()->company;

        if (! $company) {
            return response()->json(null, 404);
        }

        return response()->json(
            $company->only(['address', 'province', 'city', 'latitude', 'longitude'])
        );
    }

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
            'province' => 'required|string|max:255',
            'city' => 'required|string|max:255',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'description' => 'required|string',
            'website' => 'nullable|string|max:255',

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
            $validated['logo_url'] = $request->file('logo_file')->storeAs('company_logos', preg_replace('/[^a-zA-Z0-9._-]/', '_', $request->file('logo_file')->getClientOriginalName()), 'public');
        }

        // Buang logo_file dari array divalidasi agar tidak error saat disimpan ke DB
        unset($validated['logo_file']);
        // --------------------------

        if ($company) {
            $company->update($validated);
        } else {
            $validated['user_id'] = $request->user()->id;
            Company::create($validated);
        }

        return back()->with('message', 'Profil perusahaan dan logo berhasil diperbarui!');
    }
}
