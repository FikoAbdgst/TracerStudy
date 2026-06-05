<?php

namespace App\Http\Controllers\Alumni;

use App\Http\Controllers\Controller;
use App\Models\AlumniProfile;
use App\Models\MasterCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth; // Pastikan import MasterCategory
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

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
        $maxDate = now()->subYears(18)->format('Y-m-d');

        $validated = $request->validate([
            'nim' => 'required|string|max:50',
            'major' => 'nullable|string|max:255',
            'graduation_year' => 'nullable|integer|min:1900|max:'.(date('Y') + 5),
            'jenjang_pendidikan' => 'nullable|string|in:D3,S1,S2,S3',

            'tanggal_lahir' => 'required|date|before_or_equal:'.$maxDate,

            'phone_number' => 'nullable|string|max:20',
            'address' => 'required|string',
            'detail_address' => 'nullable|string',
            'experience' => 'required|integer|min:0',
            'skills' => 'nullable|array',
            'cv_file' => 'nullable|file|mimes:pdf|max:5120',
            'photo_file' => 'nullable|file|mimes:png,jpg,jpeg|max:2048',
        ], [
            'tanggal_lahir.before_or_equal' => 'Maaf, usia Anda harus minimal 18 tahun untuk menggunakan sistem ini.',
            'tanggal_lahir.required' => 'Tanggal lahir wajib diisi.',
            'experience.required' => 'Pengalaman wajib diisi.',
            'address.required' => 'Domisili wajib diisi.',
        ]);

        $user = Auth::user();
        $alumni = $request->user()->alumniProfile;

        if ($request->hasFile('photo_file')) {
            if ($alumni && $alumni->photo_path) {
                Storage::disk('public')->delete($alumni->photo_path);
            }
            $validated['photo_path'] = $request->file('photo_file')->store('alumni_photos', 'public');
        }
        unset($validated['photo_file']);

        if ($request->hasFile('cv_file')) {
            if ($alumni && $alumni->cv_path) {
                Storage::disk('local')->delete($alumni->cv_path);
            }
            $validated['cv_path'] = $request->file('cv_file')->store('alumni_cvs', 'local');
        }
        unset($validated['cv_file']);

        if ($alumni) {
            $alumni->update($validated);
        } else {
            // Berjaga-jaga jika profil belum ada (meski harusnya sudah terbuat dari excel/register)
            $validated['user_id'] = $user->id;
            AlumniProfile::create($validated);
        }

        return back()->with('message', 'Profil profesional berhasil diperbarui!');
    }
}
