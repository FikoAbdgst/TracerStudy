<?php

namespace App\Http\Controllers\Alumni;

use App\Http\Controllers\Controller;
use App\Models\MasterCategory;
use App\Models\TracerStudyForm;
use App\Models\TracerStudyResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TracerStudyController extends Controller
{
    public function index()
    {
        $alumniProfile = Auth::user()->alumniProfile;

        if (! $alumniProfile) {
            return redirect()->route('alumni.profile.edit')->with('error', 'Silakan lengkapi profil terlebih dahulu.');
        }

        $activeForm = TracerStudyForm::where('is_active', true)->latest()->first();

        $existingResponse = null;
        if ($activeForm) {
            $existingResponse = TracerStudyResponse::where('alumni_id', $alumniProfile->id)
                ->where('tracer_study_form_id', $activeForm->id)
                ->first();
        }

        $industries = [];
        $category = MasterCategory::with('items')
            ->where('slug', 'like', '%industri%')
            ->first();
        if ($category) {
            $industries = $category->items;
        }

        return Inertia::render('Alumni/Kuesioner/Index', [
            'kuesioner' => $activeForm,
            'existingResponse' => $existingResponse,
            'profile' => $alumniProfile,
            'industries' => $industries,
        ]);
    }

    public function store(Request $request, TracerStudyForm $kuesioner)
    {
        $alumniProfile = Auth::user()->alumniProfile;

        if (! $alumniProfile) {
            return back()->with('error', 'Profil alumni tidak ditemukan.');
        }

        if (! $kuesioner->is_active) {
            return back()->with('error', 'Kuesioner ini sudah tidak aktif.');
        }

        $validated = $request->validate([
            'status_pekerjaan' => 'required|string|in:Bekerja,Mencari Kerja,Wiraswasta',
            'nama_perusahaan' => 'nullable|string|max:255',
            'jabatan' => 'nullable|string|max:255',
            'answers' => 'nullable|array',
        ]);

        DB::transaction(function () use ($validated, $alumniProfile, $kuesioner) {
            $hasCompany = in_array($validated['status_pekerjaan'], ['Bekerja', 'Wiraswasta']);
            $isWorking = $validated['status_pekerjaan'] === 'Bekerja';

            $alumniProfile->update([
                'employment_status' => $validated['status_pekerjaan'],
                'company_name' => $hasCompany ? ($validated['nama_perusahaan'] ?? null) : null,
                'position' => $hasCompany ? ($validated['jabatan'] ?? null) : null,
            ]);

            TracerStudyResponse::updateOrCreate(
                [
                    'alumni_id' => $alumniProfile->id,
                    'tracer_study_form_id' => $kuesioner->id,
                ],
                [
                    'status_pekerjaan' => $validated['status_pekerjaan'],
                    'nama_perusahaan' => $validated['nama_perusahaan'] ?? null,
                    'jabatan' => $validated['jabatan'] ?? null,
                    'answers' => $validated['answers'] ?? [],
                ]
            );
        });

        return redirect()->route('alumni.kuesioner')->with('message', 'Terima kasih telah mengisi Kuesioner Tracer Study!');
    }

    public function destroyResponse(TracerStudyForm $kuesioner)
    {
        $alumniProfile = Auth::user()->alumniProfile;

        if (! $alumniProfile) {
            return back()->with('error', 'Profil alumni tidak ditemukan.');
        }

        TracerStudyResponse::where('alumni_id', $alumniProfile->id)
            ->where('tracer_study_form_id', $kuesioner->id)
            ->delete();

        return back()->with('message', 'Jawaban kuesioner berhasil dihapus.');
    }
}
