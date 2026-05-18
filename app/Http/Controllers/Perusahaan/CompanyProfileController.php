<?php

namespace App\Http\Controllers\Perusahaan;

use App\Http\Controllers\Controller;
use App\Models\MasterCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

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

    // Menyimpan atau memperbarui profil
    public function update(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'industry' => 'required|string|max:255',
            'description' => 'nullable|string',
            'address' => 'nullable|string',
            'website' => 'nullable|url|max:255',
        ]);

        $user = Auth::user();

        $user->company()->updateOrCreate(
            ['user_id' => $user->id],
            $validated
        );

        return back()->with('message', 'Profil Perusahaan berhasil diperbarui.');
    }
}
