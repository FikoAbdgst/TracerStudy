<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\ProfileController;
// Import Dashboard Controllers
use App\Http\Controllers\SuperAdmin\MasterDataController;
use App\Http\Controllers\SuperAdmin\DashboardController as SuperAdminDashboard;
use App\Http\Controllers\SuperAdmin\UserController;
use App\Http\Controllers\AdminKampus\DashboardController as AdminKampusDashboard;
use App\Http\Controllers\AdminKampus\AlumniController;
use App\Http\Controllers\AdminKampus\MouController;
use App\Http\Controllers\AdminKampus\ReviewJobController;
use App\Http\Controllers\AdminKampus\TracerStudyController;
use App\Http\Controllers\AdminKampus\VerifyCompanyController;
use App\Http\Controllers\Alumni\AlumniProfileController;
use App\Http\Controllers\Alumni\TracerStudyController as AlumniTracerController;
use App\Http\Controllers\Alumni\DashboardController as AlumniDashboard;
use App\Http\Controllers\Alumni\ForumController;
use App\Http\Controllers\Alumni\JobPortalController;
use App\Http\Controllers\Perusahaan\ApplicantController;
use App\Http\Controllers\Perusahaan\CompanyProfileController;
use App\Http\Controllers\Perusahaan\DashboardController as AdminPTDashboard;
use App\Http\Controllers\Perusahaan\JobPostingController;

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
    Route::middleware(['auth', 'role:Admin Kampus'])->prefix('admin-kampus')->name('adminkampus.')->group(function () {
        Route::get('/dashboard', [AdminKampusDashboard::class, 'index'])->name('dashboard');

        // Rute Mengelola Data Alumni
        Route::get('/alumni', [AlumniController::class, 'index'])->name('alumni.index');

        Route::get('/tracer-study', [TracerStudyController::class, 'index'])->name('tracer');
        Route::post('/tracer-study', [TracerStudyController::class, 'store'])->name('tracer.store');
        Route::put('/tracer-study/{tracer}', [TracerStudyController::class, 'update'])->name('tracer.update');
        Route::delete('/tracer-study/{tracer}', [TracerStudyController::class, 'destroy'])->name('tracer.destroy');
        Route::patch('/tracer-study/{tracer}/toggle', [TracerStudyController::class, 'toggleActive'])->name('tracer.toggle');

        Route::get('/verifikasi-pt', [VerifyCompanyController::class, 'index'])->name('verify-pt');
        Route::patch('/verifikasi-pt/{company}/status', [VerifyCompanyController::class, 'updateStatus'])->name('verify-pt.status');

        Route::get('/tinjau-lowongan', [ReviewJobController::class, 'index'])->name('tinjau-lowongan');
        Route::patch('/tinjau-lowongan/{job}/force-close', [ReviewJobController::class, 'forceClose'])->name('tinjau-lowongan.force-close');

        Route::get('/mou', [MouController::class, 'index'])->name('mou.index');
        Route::post('/mou', [MouController::class, 'store'])->name('mou.store');
        Route::patch('/mou/{mou}/terminate', [MouController::class, 'terminate'])->name('mou.terminate');
    });

    // --- GRUP ADMIN PT (Perusahaan) ---
    Route::middleware(['auth', 'role:Admin PT'])->prefix('perusahaan')->name('perusahaan.')->group(function () {
        // Dashboard & Profil ...
        Route::get('/dashboard', [AdminPTDashboard::class, 'index'])->name('dashboard');
        Route::get('/profil', [CompanyProfileController::class, 'edit'])->name('profile.edit');
        Route::post('/profil', [CompanyProfileController::class, 'update'])->name('profile.update');

        // --- HAPUS ROUTE DUMMY LAMA, GANTI DENGAN INI ---
        Route::get('/lowongan', [JobPostingController::class, 'index'])->name('lowongan');
        Route::post('/lowongan', [JobPostingController::class, 'store'])->name('lowongan.store');
        Route::put('/lowongan/{lowongan}', [JobPostingController::class, 'update'])->name('lowongan.update');
        Route::delete('/lowongan/{lowongan}', [JobPostingController::class, 'destroy'])->name('lowongan.destroy');
        // Rute Toggle Switch
        Route::patch('/lowongan/{lowongan}/toggle', [JobPostingController::class, 'toggleStatus'])->name('lowongan.toggle');

        Route::get('/pelamar', [ApplicantController::class, 'index'])->name('pelamar');

        // Rute untuk mengubah status lamaran
        Route::patch('/pelamar/{lamaran}/status', [ApplicantController::class, 'updateStatus'])->name('pelamar.status');
    });

    // --- GRUP ALUMNI ---
    Route::middleware(['auth', 'role:Alumni'])->prefix('alumni')->name('alumni.')->group(function () {
        // 1. Dashboard
        Route::get('/dashboard', [AlumniDashboard::class, 'index'])->name('dashboard');

        // 2. Profil Alumni
        Route::get('/profil', [AlumniProfileController::class, 'edit'])->name('profile.edit');
        Route::post('/profil', [AlumniProfileController::class, 'update'])->name('profile.update');

        // 3. Kuesioner Tracer Study
        Route::get('/kuesioner', [AlumniTracerController::class, 'index'])->name('kuesioner');
        Route::get('/kuesioner/{kuesioner}', [AlumniTracerController::class, 'show'])->name('kuesioner.show');
        Route::post('/kuesioner/{kuesioner}', [AlumniTracerController::class, 'store'])->name('kuesioner.store');

        // 4. Bursa Kerja (Loker) & Lamaran
        Route::get('/loker', [JobPortalController::class, 'index'])->name('loker');
        Route::post('/loker/{job}/apply', [JobPortalController::class, 'apply'])->name('loker.apply');
        Route::get('/lamaran', [JobPortalController::class, 'applications'])->name('lamaran');

        // 5. Forum Diskusi
        Route::get('/forum', [ForumController::class, 'index'])->name('forum.index');
        Route::post('/forum', [ForumController::class, 'store'])->name('forum.store');
        Route::get('/forum/{forum}', [ForumController::class, 'show'])->name('forum.show');
        Route::post('/forum/{forum}/reply', [ForumController::class, 'reply'])->name('forum.reply');
    });
});

require __DIR__ . '/auth.php';
