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
        // Ensure the application belongs to a job posted by the current company
        $company = Auth::user()->company;
        if ($lamaran->jobPosting->company_id !== $company->id) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'status' => 'required|in:pending,direview,wawancara,diterima,ditolak',
            'notes' => 'nullable|string'
        ]);

        $lamaran->update($validated);

        // --- NEW: SEND NOTIFICATION TO ALUMNI ---
        if ($lamaran->alumni && $lamaran->alumni->user) {
            $alumniUser = $lamaran->alumni->user;
            $alumniUser->notify(new SystemNotification(
                'Status Lamaran Diperbarui!',
                'Status lamaran Anda untuk posisi ' . $lamaran->jobPosting->title . ' berubah menjadi: ' . strtoupper($validated['status']),
                route('alumni.lamaran')
            ));
        }

        return back()->with('message', 'Status pelamar berhasil diperbarui.');
    }
}
