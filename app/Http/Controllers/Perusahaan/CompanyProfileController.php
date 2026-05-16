<?php

namespace App\Http\Controllers\Perusahaan;

use App\Http\Controllers\Controller;
use App\Models\IndustrySektor;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class CompanyProfileController extends Controller
{
    public function edit()
    {
        $company = Auth::user()->company;

        $industries = IndustrySektor::all();

        return Inertia::render('Perusahaan/Profile/Edit', [
            'company' => $company,
            'industries' => $industries,
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
