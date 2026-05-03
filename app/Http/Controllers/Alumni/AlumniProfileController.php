<?php

namespace App\Http\Controllers\Alumni;

use App\Http\Controllers\Controller;
use App\Models\ProgramStudi;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class AlumniProfileController extends Controller
{
    public function edit()
    {
        $user = Auth::user();
        // Load relasi alumniProfile jika user sudah pernah mengisinya
        $user->load('alumniProfile');

        return Inertia::render('Alumni/Profile/Edit', [
            'profile' => $user->alumniProfile,
            'programStudis' => ProgramStudi::all(), // Tarik Master Data Prodi
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'nim' => 'required|string|max:20',
            'major' => 'required|string|max:255', // Ini akan menyimpan nama prodi
            'graduation_year' => 'required|integer|min:2000|max:' . (date('Y') + 1),
            'skills' => 'nullable|string',
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
