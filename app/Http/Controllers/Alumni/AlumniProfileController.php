<?php

namespace App\Http\Controllers\Alumni;

use App\Http\Controllers\Controller;
use App\Models\AlumniProfile;
use App\Models\MasterCategory;
use App\Models\TracerStudyForm;
use App\Models\TracerStudyResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class AlumniProfileController extends Controller
{
    public function edit()
    {
        $user = Auth::user();
        $alumni = $user->alumniProfile;

        $prodiCategory = MasterCategory::with('items')->where('slug', 'program-studi')->first();
        $skillCategory = MasterCategory::with('items')->where('slug', 'keahlian')->first();

        return Inertia::render('Alumni/Profile/Edit', [
            'profile' => $alumni,
            'programStudis' => $prodiCategory ? $prodiCategory->items : [],
            'keahlianMaster' => $skillCategory ? $skillCategory->items : [],
        ]);
    }

    public function update(Request $request)
    {
        $maxDate = now()->subYears(18)->format('Y-m-d');

        $validated = $request->validate([
            'nim' => 'required|string|max:50',
            'major' => 'nullable|string|max:255',
            'graduation_year' => 'nullable|integer|min:1900|max:'.(date('Y') + 5),
            'jenjang_pendidikan' => 'nullable|string|in:D3,S1,S2,S3',

            'tanggal_lahir' => 'required|date|before_or_equal:'.$maxDate,

            'phone_number' => 'nullable|string|max:20',
            'address' => 'required|string',
            'detail_address' => 'nullable|string',
            'experience' => 'required|integer|min:0',
            'skills' => 'nullable|array',
            'cv_file' => 'nullable|file|mimes:pdf|max:5120',
            'photo_file' => 'nullable|file|mimes:png,jpg,jpeg|max:2048',
            'judul_skripsi' => 'nullable|string|max:255',
            'portofolio_proyek' => 'nullable|array',
            'portofolio_proyek.*.nama_proyek' => 'required_with:portofolio_proyek|string|max:255',
            'portofolio_proyek.*.deskripsi_singkat' => 'nullable|string|max:1000',
            'portofolio_proyek.*.tautan' => 'nullable|string|url|max:500',
            'employment_status' => 'required|string|in:Bekerja,Mencari Kerja,Wiraswasta,Lanjutkan Pendidikan',
            'company_name' => 'required_if:employment_status,Bekerja,Wiraswasta|nullable|string|max:255',
            'position' => 'nullable|string|max:255',
            'job_sector' => 'nullable|string|max:255',
            'privacy_hide_phone' => 'boolean',
            'privacy_hide_address' => 'boolean',
        ], [
            'tanggal_lahir.before_or_equal' => 'Maaf, usia Anda harus minimal 18 tahun untuk menggunakan sistem ini.',
            'tanggal_lahir.required' => 'Tanggal lahir wajib diisi.',
            'experience.required' => 'Pengalaman wajib diisi.',
            'address.required' => 'Domisili wajib diisi.',
        ]);

        $user = Auth::user();
        $alumni = $request->user()->alumniProfile;

        if ($request->hasFile('photo_file')) {
            if ($alumni && $alumni->photo_path) {
                Storage::disk('public')->delete($alumni->photo_path);
            }
            $file = $request->file('photo_file');
            $validated['photo_path'] = $file->storeAs('alumni_photos', preg_replace('/[^a-zA-Z0-9._-]/', '_', $file->getClientOriginalName()), 'public');
        }
        unset($validated['photo_file']);

        if ($request->hasFile('cv_file')) {
            if ($alumni && $alumni->cv_path) {
                Storage::disk('local')->delete($alumni->cv_path);
            }
            $file = $request->file('cv_file');
            $validated['cv_path'] = $file->storeAs('alumni_cvs', preg_replace('/[^a-zA-Z0-9._-]/', '_', $file->getClientOriginalName()), 'local');
        }
        unset($validated['cv_file']);

        if (! in_array($validated['employment_status'], ['Bekerja', 'Wiraswasta'])) {
            $validated['company_name'] = null;
            $validated['position'] = null;
            $validated['job_sector'] = null;
        } elseif ($validated['employment_status'] === 'Wiraswasta') {
            $validated['position'] = null;
            $validated['job_sector'] = null;
        } else {
            $validated['job_sector'] = null;
        }

        DB::transaction(function () use ($validated, $user, $alumni) {
            if ($alumni) {
                $alumni->update($validated);
            } else {
                $validated['user_id'] = $user->id;
                AlumniProfile::create($validated);
            }

            $this->syncEmploymentToResponse($alumni ?? AlumniProfile::where('user_id', $user->id)->first(), $validated['employment_status']);
        });

        return back()->with('message', 'Profil profesional berhasil diperbarui!');
    }

    /**
     * Conditional Sync: propagate employment_status change to the active TracerStudyResponse.
     *
     * Only touches the response when BOTH conditions are met:
     *  1. There is an active (open) TracerStudyForm.
     *  2. The alumni already has a response for that active form.
     *
     * When no active form exists (all forms closed/archived), the historical
     * response data is left untouched as a reporting snapshot.
     */
    private function syncEmploymentToResponse(?AlumniProfile $alumni, string $statusPekerjaan): void
    {
        if (! $alumni) {
            return;
        }

        $activeForm = TracerStudyForm::active()->first();

        if (! $activeForm) {
            return;
        }

        $response = TracerStudyResponse::where('alumni_id', $alumni->id)
            ->where('tracer_study_form_id', $activeForm->id)
            ->first();

        if ($response) {
            $response->update([
                'status_pekerjaan' => $statusPekerjaan,
                'nama_perusahaan' => $alumni->company_name,
                'jabatan' => $alumni->position,
            ]);
        }
    }
}
