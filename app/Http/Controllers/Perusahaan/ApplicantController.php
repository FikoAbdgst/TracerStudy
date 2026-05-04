<?php

namespace App\Http\Controllers\Perusahaan;

use App\Http\Controllers\Controller;
use App\Models\JobApplication;
use App\Notifications\SystemNotification;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class ApplicantController extends Controller
{
    public function index()
    {
        $company = Auth::user()->company;

        if (!$company) {
            return redirect()->route('perusahaan.profile.edit')->with('error', 'Silakan lengkapi profil terlebih dahulu.');
        }

        // Menarik data pelamar beserta relasinya (Lowongan, Profil Alumni, dan Akun User Alumni)
        $applications = JobApplication::with(['jobPosting', 'alumni.user'])
            ->whereHas('jobPosting', function ($query) use ($company) {
                // Kunci keamanan: Hanya ambil pelamar pada lowongan milik perusahaan ini
                $query->where('company_id', $company->id);
            })
            ->latest() // Urutkan dari yang paling baru melamar
            ->get();

        return Inertia::render('Perusahaan/Pelamar/Index', [
            'applications' => $applications,
        ]);
    }
    public function updateStatus(Request $request, JobApplication $lamaran)
    {
        // Validasi keamanan: Pastikan lamaran ini benar melamar ke perusahaan yang sedang login
        $company = Auth::user()->company;
        if ($lamaran->jobPosting->company_id !== $company->id) {
            abort(403, 'Anda tidak memiliki akses ke lamaran ini.');
        }

        $validated = $request->validate([
            'status' => 'required|in:pending,direview,wawancara,diterima,ditolak',
            'notes' => 'nullable|string|max:1000',
        ]);

        $lamaran->update($validated);

        // Jika statusnya Diterima atau Ditolak, biasanya ERP akan mengirim notifikasi/email ke pelamar.
        // Untuk sekarang, kita cukup update statusnya.
        $alumniUser = $lamaran->alumni->user;
        $alumniUser->notify(new SystemNotification(
            'Status Lamaran Diperbarui!',
            'Status lamaran Anda di ' . $lamaran->jobPosting->company->name . ' berubah menjadi: ' . $validated['status'],
            route('alumni.lamaran')
        ));

        return back()->with('message', 'Status pelamar berhasil diperbarui menjadi: ' . strtoupper($validated['status']));
    }
}
