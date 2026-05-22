<?php

namespace App\Http\Controllers\Alumni;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Models\MasterCategory; // Pastikan import MasterCategory
use Illuminate\Support\Facades\Storage;

class AlumniProfileController extends Controller
{
    public function edit()
    {
        $user = Auth::user();
        $alumni = $user->alumniProfile;

        // Ambil Master Data untuk Program Studi dan Keahlian
        $prodiCategory = MasterCategory::with('items')->where('slug', 'program-studi')->first();
        $skillCategory = MasterCategory::with('items')->where('slug', 'keahlian')->first();

        return Inertia::render('Alumni/Profile/Edit', [
            'profile' => $alumni,
            'programStudis' => $prodiCategory ? $prodiCategory->items : [],
            'keahlianMaster' => $skillCategory ? $skillCategory->items : [],
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'nim' => 'required|string|max:50',
            'major' => 'nullable|string|max:255',
            'graduation_year' => 'nullable|integer|min:1900|max:' . (date('Y') + 5),
            'jenjang_pendidikan' => 'nullable|string|in:D3,S1,S2,S3',

            // UBAH DUA BARIS INI MENJADI REQUIRED:
            'tanggal_lahir' => 'required|date',
            'experience' => 'required|integer|min:0',

            'phone_number' => 'nullable|string|max:20',
            'address' => 'required|string',
            'skills' => 'nullable|array',
            'cv_file' => 'nullable|file|mimes:pdf|max:5120',
        ]);

        $user = Auth::user();
        $alumni = $user->alumniProfile;

        // Proses File CV
        if ($request->hasFile('cv_file')) {
            if ($alumni && $alumni->cv_path) {
                Storage::disk('public')->delete($alumni->cv_path);
            }
            $validated['cv_path'] = $request->file('cv_file')->store('cv_documents', 'public');
        }

        // Hapus cv_file dari array validated agar tidak masuk ke query DB
        unset($validated['cv_file']);

        // Simpan Data
        if ($alumni) {
            $alumni->update($validated);
        } else {
            // Berjaga-jaga jika profil belum ada (meski harusnya sudah terbuat dari excel/register)
            $validated['user_id'] = $user->id;
            \App\Models\AlumniProfile::create($validated);
        }

        return back()->with('message', 'Profil profesional berhasil diperbarui!');
    }
}
