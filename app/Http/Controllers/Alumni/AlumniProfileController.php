<?php

namespace App\Http\Controllers\Alumni;

use App\Http\Controllers\Controller;
use App\Models\ProgramStudi;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class AlumniProfileController extends Controller
{
    public function edit(Request $request)
    {
        $profile = $request->user()->alumniProfile;

        // Ambil Data Master Program Studi
        $programStudiCat = \App\Models\MasterCategory::with('items')->where('slug', 'program-studi')->first();
        $programStudis = $programStudiCat ? $programStudiCat->items : [];

        // Ambil Data Master Keahlian
        $keahlianCat = \App\Models\MasterCategory::with('items')->where('slug', 'keahlian')->first();
        $keahlianMaster = $keahlianCat ? $keahlianCat->items : [];

        return Inertia::render('Alumni/Profile/Edit', [
            'profile' => $profile,
            'programStudis' => $programStudis,
            'keahlianMaster' => $keahlianMaster,
        ]);
    }
    public function update(Request $request)
    {
        $validated = $request->validate([
            'nim' => 'required|string|max:50',
            'major' => 'required|string|max:255',
            'graduation_year' => 'required|integer',
            'skills' => 'nullable|array', // UBAH JADI ARRAY
            'phone_number' => 'nullable|string|max:20',
            'address' => 'nullable|string',
        ]);

        $user = Auth::user();

        // Gunakan updateOrCreate untuk insert atau update berdasarkan user_id
        $user->alumniProfile()->updateOrCreate(
            ['user_id' => $user->id],
            $validated
        );

        return back()->with('message', 'Profil Alumni berhasil diperbarui.');
    }
}
