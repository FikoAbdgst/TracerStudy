<?php

namespace App\Http\Controllers\AdminKampus;

use App\Http\Controllers\Controller;
use App\Models\AlumniProfile;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AlumniController extends Controller
{
    public function index()
    {
        // Menarik data profil alumni beserta relasi akun (user) dan Program Studi jika ada
        $alumni = AlumniProfile::with(['user', 'programStudi'])
            ->latest()
            ->get();

        return Inertia::render('AdminKampus/Alumni/Index', [
            'alumni' => $alumni,
        ]);
    }

    // Fitur detail atau verifikasi (jika dibutuhkan) bisa ditambahkan di sini nantinya
}
