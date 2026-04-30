<?php

namespace App\Http\Controllers\Perusahaan;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        // Nanti kita akan isi dengan statistik jumlah pelamar dan lowongan aktif
        return Inertia::render('Perusahaan/Dashboard');
    }
}
