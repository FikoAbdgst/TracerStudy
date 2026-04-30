<?php

namespace App\Http\Controllers\Perusahaan;

use App\Http\Controllers\Controller;
use App\Models\IndustrySektor;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class CompanyProfileController extends Controller
{
    // Menampilkan form edit profil
    public function edit()
    {
        $user = Auth::user();
        // Load relasi company jika sudah ada
        $user->load('company');

        return Inertia::render('Perusahaan/Profile/Edit', [
            'company' => $user->company,
            'industries' => IndustrySektor::all(), // Tarik data master industri
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

        // Gunakan updateOrCreate:
        // Jika company belum ada, buat baru. Jika sudah ada, update.
        $user->company()->updateOrCreate(
            ['user_id' => $user->id],
            $validated
        );

        return back()->with('message', 'Profil Perusahaan berhasil diperbarui.');
    }
}
