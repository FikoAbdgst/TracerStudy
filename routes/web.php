<?php

use App\Http\Controllers\AdminKampus\AlumniController;
use App\Http\Controllers\AdminKampus\DashboardController as AdminKampusDashboard;
use App\Http\Controllers\AdminKampus\MitraController;
// Import Dashboard Controllers
use App\Http\Controllers\AdminKampus\ReviewJobController;
use App\Http\Controllers\AdminKampus\TracerStudyController;
use App\Http\Controllers\Alumni\AlumniProfileController;
use App\Http\Controllers\Alumni\DashboardController as AlumniDashboard;
use App\Http\Controllers\Alumni\ForumController;
use App\Http\Controllers\Alumni\JobPortalController;
use App\Http\Controllers\Alumni\TracerStudyController as AlumniTracerController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\GuestController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\Perusahaan\ApplicantController;
use App\Http\Controllers\Perusahaan\CompanyProfileController;
use App\Http\Controllers\Perusahaan\DashboardController as AdminPTDashboard;
use App\Http\Controllers\Perusahaan\JobPostingController;
use App\Http\Controllers\Perusahaan\TalentPoolController;
use App\Http\Controllers\PrivateFileController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SuperAdmin\DashboardController as SuperAdminDashboard;
use App\Http\Controllers\SuperAdmin\MasterDataController;
use App\Http\Controllers\SuperAdmin\UserController;
use Illuminate\Support\Facades\Route;

Route::get('/', [GuestController::class, 'index']);

Route::middleware('auth')->group(function () {
    Route::get('/storage/private/{path}', PrivateFileController::class)
        ->where('path', '.*')
        ->name('private-file');

    Route::post('/notifications/{id}/read', function ($id) {
        $notification = auth()->user()->notifications()->find($id);
        if ($notification) {
            $notification->markAsRead();
            $url = $notification->data['url_redirect'] ?? route('dashboard');

            return redirect($url);
        }

        return back();
    })->name('notifications.read');

    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/read-all', [NotificationController::class, 'readAll'])->name('notifications.read-all');
});

// Rute Global untuk Menambah Master Data Item (Keahlian) secara dinamis
Route::post('/api/master-data/keahlian/quick-add', [MasterDataController::class, 'quickAddKeahlian'])->name('master-data.keahlian.quick-add');

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
        Route::put('/master-data/prodi/{prodi}', [MasterDataController::class, 'updateProdi'])->name('master-data.prodi.update');
        Route::put('/master-data/industry/{industry}', [MasterDataController::class, 'updateIndustry'])->name('master-data.industry.update');
        Route::get('/master-data', [MasterDataController::class, 'index'])->name('master-data');

        // Rute Kategori (Tabs)
        Route::post('/master-data/category', [MasterDataController::class, 'storeCategory'])->name('master-data.category.store');
        Route::delete('/master-data/category/{category}', [MasterDataController::class, 'destroyCategory'])->name('master-data.category.destroy');

        // Rute Item (Isi Tabel)
        Route::post('/master-data/item', [MasterDataController::class, 'storeItem'])->name('master-data.item.store');
        Route::put('/master-data/item/{item}', [MasterDataController::class, 'updateItem'])->name('master-data.item.update');
        Route::delete('/master-data/item/{item}', [MasterDataController::class, 'destroyItem'])->name('master-data.item.destroy');

        // 3. Rute Mengelola Hak Akses (User Management) yang baru kita buat
        Route::resource('users', UserController::class)->except(['create', 'show', 'edit']);
    });

    // --- GRUP ADMIN KAMPUS ---
    Route::middleware(['auth', 'role:Admin Kampus'])->prefix('admin-kampus')->name('adminkampus.')->group(function () {
        Route::get('/dashboard', [AdminKampusDashboard::class, 'index'])->name('dashboard');

        Route::get('/alumni', [AlumniController::class, 'index'])->name('alumni.index');
        Route::get('/alumni/template', [AlumniController::class, 'downloadTemplate'])->name('alumni.template'); // <-- TAMBAHKAN INI
        Route::post('/alumni/import', [AlumniController::class, 'import'])->name('alumni.import');

        Route::get('/tracer-study', [TracerStudyController::class, 'index'])->name('tracer');
        Route::post('/tracer-study', [TracerStudyController::class, 'store'])->name('tracer.store');
        Route::put('/tracer-study/{tracer}', [TracerStudyController::class, 'update'])->name('tracer.update');
        Route::delete('/tracer-study/{tracer}', [TracerStudyController::class, 'destroy'])->name('tracer.destroy');
        Route::patch('/tracer-study/{tracer}/toggle', [TracerStudyController::class, 'toggleActive'])->name('tracer.toggle');
        Route::get('/tracer-study/{tracer}/responses', [TracerStudyController::class, 'responses'])->name('tracer.responses');

        Route::get('/tinjau-lowongan', [ReviewJobController::class, 'index'])->name('tinjau-lowongan');
        Route::patch('/tinjau-lowongan/{job}/force-close', [ReviewJobController::class, 'forceClose'])->name('tinjau-lowongan.force-close');

        Route::get('/mitra', [MitraController::class, 'index'])->name('mitra.index');
        Route::post('/mitra', [MitraController::class, 'store'])->name('mitra.store');
        Route::put('/mitra/{company}', [MitraController::class, 'update'])->name('mitra.update');
        Route::delete('/mitra/{company}', [MitraController::class, 'destroy'])->name('mitra.destroy');
        Route::patch('/mitra/{mou}/terminate', [MitraController::class, 'terminate'])->name('mitra.terminate');
    });

    // --- GRUP ADMIN PT (Perusahaan) ---
    Route::middleware(['auth', 'role:Admin PT'])->prefix('perusahaan')->name('perusahaan.')->group(function () {
        // Dashboard & Profil ...
        Route::get('/dashboard', [AdminPTDashboard::class, 'index'])->name('dashboard');
        Route::get('/profil', [CompanyProfileController::class, 'edit'])->name('profile.edit');
        Route::post('/profil', [CompanyProfileController::class, 'update'])->name('profile.update');
        Route::get('/profil/alamat-kantor', [CompanyProfileController::class, 'getAddress'])->name('profile.company-address');

        // --- HAPUS ROUTE DUMMY LAMA, GANTI DENGAN INI ---
        Route::get('/lowongan', [JobPostingController::class, 'index'])->name('lowongan');
        Route::post('/lowongan', [JobPostingController::class, 'store'])->name('lowongan.store');
        Route::put('/lowongan/{job}', [JobPostingController::class, 'update'])->name('lowongan.update');
        Route::delete('/lowongan/{job}', [JobPostingController::class, 'destroy'])->name('lowongan.destroy');
        // Rute Toggle Switch
        Route::patch('/lowongan/{job}/toggle', [JobPostingController::class, 'toggleStatus'])->name('lowongan.toggle');

        Route::get('/pelamar', [ApplicantController::class, 'index'])->name('pelamar');

        // Rute untuk mengubah status lamaran
        Route::patch('/pelamar/{lamaran}/status', [ApplicantController::class, 'updateStatus'])->name('pelamar.status');

        Route::get('/talent-pool', [TalentPoolController::class, 'index'])->name('talent-pool');
        Route::get('/talent-pool/saved', [TalentPoolController::class, 'savedCandidates'])->name('talent-pool.saved');
        Route::post('/talent-pool/{alumni}/bookmark', [TalentPoolController::class, 'toggleBookmark'])->name('talent-pool.bookmark');
        Route::get('/talent-pool/{alumni}', [TalentPoolController::class, 'show'])->name('talent-pool.show');
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
        Route::post('/kuesioner/{kuesioner}', [AlumniTracerController::class, 'store'])->name('kuesioner.store');
        Route::delete('/kuesioner/{kuesioner}/response', [AlumniTracerController::class, 'destroyResponse'])->name('kuesioner.destroy-response');

        // 4. Bursa Kerja (Loker) & Lamaran
        Route::get('/loker', [JobPortalController::class, 'index'])->name('loker');
        Route::post('/loker/{job}/apply', [JobPortalController::class, 'apply'])->name('loker.apply');
        Route::post('/loker/{job}/update-cv', [JobPortalController::class, 'updateCv'])->name('loker.update-cv');

        Route::get('/lamaran', [JobPortalController::class, 'applications'])->name('lamaran');
    });

    // --- FORUM DISKUSI (Alumni + Super Admin + Admin Kampus) ---
    Route::middleware(['auth', 'verified', 'role:Alumni|Super Admin|Admin Kampus'])->prefix('alumni')->name('alumni.')->group(function () {
        Route::get('/forum', [ForumController::class, 'index'])->name('forum.index');
        Route::post('/forum', [ForumController::class, 'store'])->name('forum.store')->middleware('throttle:3,10');
        Route::get('/forum/{forum}', [ForumController::class, 'show'])->name('forum.show');
        Route::put('/forum/{forum}', [ForumController::class, 'update'])->name('forum.update');
        Route::delete('/forum/{forum}', [ForumController::class, 'destroy'])->name('forum.destroy');
        Route::post('/forum/{forum}/reply', [ForumController::class, 'reply'])->name('forum.reply')->middleware('throttle:5,10');
        Route::put('/forum/{forum}/reply/{reply}', [ForumController::class, 'updateReply'])->name('forum.reply.update');
        Route::delete('/forum/{forum}/reply/{reply}', [ForumController::class, 'destroyReply'])->name('forum.reply.destroy');
    });
});

// --- MESSAGING (All roles except Super Admin) ---
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/messages', [ChatController::class, 'index'])->name('messages.index');
    Route::post('/messages/{conversation}/send', [ChatController::class, 'send'])->name('messages.send');
    Route::post('/messages/{conversation}/read', [ChatController::class, 'markRead'])->name('messages.read');
    Route::get('/messages/{conversation}/poll', [ChatController::class, 'poll'])->name('messages.poll');
    Route::get('/api/messages/search-alumni', [ChatController::class, 'searchAlumni'])->name('messages.search-alumni');
    Route::post('/messages/start-alumni', [ChatController::class, 'startAlumni'])->name('messages.start-alumni');
    Route::post('/messages/start-admin', [ChatController::class, 'startAdmin'])->name('messages.start-admin');
    Route::post('/messages/start-from-forum', [ChatController::class, 'startFromForum'])->name('messages.start-from-forum');
    Route::post('/messages/start-company', [ChatController::class, 'startCompanyConversation'])->name('messages.start-company');
    Route::post('/messages/invite-candidate', [ChatController::class, 'startCompanyConversation'])->name('messages.invite-candidate');
    Route::post('/messages/open-company-conversation', [ChatController::class, 'openCompanyConversation'])->name('messages.open-company-conversation');
    Route::post('/messages/block', [ChatController::class, 'blockUser'])->name('messages.block');
    Route::post('/messages/unblock', [ChatController::class, 'unblockUser'])->name('messages.unblock');
    Route::delete('/messages/{message}', [ChatController::class, 'deleteMessage'])->name('messages.delete');
    Route::delete('/conversations/{conversation}/clear', [ChatController::class, 'clearConversation'])->name('messages.clear');
    Route::delete('/conversations/{conversation}', [ChatController::class, 'destroy'])->name('messages.destroy');
});

require __DIR__.'/auth.php';
