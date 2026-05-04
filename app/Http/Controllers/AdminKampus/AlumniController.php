<?php

namespace App\Http\Controllers\AdminKampus;

use App\Http\Controllers\Controller;
use App\Models\AlumniProfile;
use Inertia\Inertia;

class AlumniController extends Controller
{
    public function index()
    {
        // Cukup panggil relasi 'user' saja, karena prodi (major) sudah ada di dalam tabel AlumniProfile
        $alumni = AlumniProfile::with(['user'])
            ->latest()
            ->get();

        return Inertia::render('AdminKampus/Alumni/Index', [
            'alumni' => $alumni,
        ]);
    }

    // Fitur detail atau verifikasi (jika dibutuhkan) bisa ditambahkan di sini nantinya
}
