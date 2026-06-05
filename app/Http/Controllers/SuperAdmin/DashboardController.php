<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        return Inertia::render('SuperAdmin/Dashboard', [
            // Kirim data statistik atau metrik global ke frontend nanti di sini
        ]);
    }
}
