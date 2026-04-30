<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\ProfileController;
// Import Dashboard Controllers
use App\Http\Controllers\SuperAdmin\MasterDataController;
use App\Http\Controllers\SuperAdmin\DashboardController as SuperAdminDashboard;
use App\Http\Controllers\SuperAdmin\UserController;
use App\Http\Controllers\AdminKampus\DashboardController as AdminKampusDashboard;
use App\Http\Controllers\AdminPT\DashboardController as AdminPTDashboard;
use App\Http\Controllers\Alumni\DashboardController as AlumniDashboard;

Route::get('/', function () {
    return Inertia::render('Welcome');
});

Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard Utama (Logic Redirect ada di AuthenticatedSessionController)
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');

    // Profile Settings (Common for all)
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // --- GRUP SUPER ADMIN ---
    // routes/web.php

    Route::middleware(['role:Super Admin'])->prefix('super-admin')->name('superadmin.')->group(function () {
        // 1. Rute Dashboard (Tujuan setelah login)
        Route::get('/dashboard', [SuperAdminDashboard::class, 'index'])->name('dashboard');

        Route::post('/master-data/prodi', [MasterDataController::class, 'storeProdi'])->name('master-data.prodi.store');
        Route::post('/master-data/industry', [MasterDataController::class, 'storeIndustry'])->name('master-data.industry.store');
        Route::delete('/master-data/prodi/{prodi}', [MasterDataController::class, 'destroyProdi'])->name('master-data.prodi.destroy');
        Route::delete('/master-data/industry/{industry}', [MasterDataController::class, 'destroyIndustry'])->name('master-data.industry.destroy');
        Route::get('/master-data', [MasterDataController::class, 'index'])->name('master-data');

        // 3. Rute Mengelola Hak Akses (User Management) yang baru kita buat
        Route::resource('users', UserController::class)->except(['create', 'show', 'edit']);
    });

    // --- GRUP ADMIN KAMPUS ---
    Route::middleware(['role:Admin Kampus'])->prefix('admin-kampus')->name('adminkampus.')->group(function () {
        Route::get('/dashboard', [AdminKampusDashboard::class, 'index'])->name('dashboard');
        Route::get('/tracer-study', [AdminKampusDashboard::class, 'tracerStudy'])->name('tracer');
        Route::get('/verifikasi-pt', [AdminKampusDashboard::class, 'verifyCompany'])->name('verify-pt');
    });

    // --- GRUP ADMIN PT (Perusahaan) ---
    Route::middleware(['role:Admin PT'])->prefix('perusahaan')->name('perusahaan.')->group(function () {
        Route::get('/dashboard', [AdminPTDashboard::class, 'index'])->name('dashboard');
        Route::get('/lowongan', [AdminPTDashboard::class, 'vacancies'])->name('lowongan');
        Route::get('/pelamar', [AdminPTDashboard::class, 'applicants'])->name('pelamar');
    });

    // --- GRUP ALUMNI ---
    Route::middleware(['role:Alumni'])->prefix('alumni')->name('alumni.')->group(function () {
        Route::get('/dashboard', [AlumniDashboard::class, 'index'])->name('dashboard');
        Route::get('/kuesioner', [AlumniDashboard::class, 'questionnaire'])->name('kuesioner');
        Route::get('/loker', [AlumniDashboard::class, 'jobPortal'])->name('loker');
    });
});

require __DIR__ . '/auth.php';
