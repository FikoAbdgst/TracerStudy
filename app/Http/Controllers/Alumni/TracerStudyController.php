<?php

namespace App\Http\Controllers\Alumni;

use App\Http\Controllers\Controller;
use App\Models\TracerStudyForm;
use App\Models\TracerStudyResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class TracerStudyController extends Controller
{
    public function index()
    {
        $alumniProfile = Auth::user()->alumniProfile;

        if (! $alumniProfile) {
            return redirect()->route('alumni.profile.edit')->with('error', 'Silakan lengkapi profil terlebih dahulu.');
        }

        // Langsung tarik SATU-SATUNYA kuesioner yang statusnya Aktif
        $activeForm = TracerStudyForm::where('is_active', true)->latest()->first();

        // Cek apakah alumni ini sudah pernah mengisi form tersebut
        $hasResponded = false;
        if ($activeForm) {
            $hasResponded = TracerStudyResponse::where('alumni_id', $alumniProfile->id)
                ->where('tracer_study_form_id', $activeForm->id)
                ->exists();
        }

        // Lempar langsung ke halaman Kuesioner (Bypass)
        return Inertia::render('Alumni/Kuesioner/Index', [
            'kuesioner' => $activeForm,
            'hasResponded' => $hasResponded,
        ]);
    }

    public function show(TracerStudyForm $kuesioner)
    {
        $alumniProfile = Auth::user()->alumniProfile;

        if (! $alumniProfile) {
            return redirect()->route('alumni.profile.edit')->with('error', 'Silakan lengkapi profil terlebih dahulu.');
        }

        $existingResponse = TracerStudyResponse::where('alumni_id', $alumniProfile->id)
            ->where('tracer_study_form_id', $kuesioner->id)
            ->value('answers');

        $industries = [];
        $category = \App\Models\MasterCategory::with('items')
            ->where('slug', 'like', '%industri%')
            ->first();
        if ($category) {
            $industries = $category->items;
        }

        return Inertia::render('Alumni/Kuesioner/Show', [
            'tracerForm' => $kuesioner,
            'industries' => $industries,
            'existingResponse' => $existingResponse ? (is_string($existingResponse) ? json_decode($existingResponse, true) : $existingResponse) : null,
        ]);
    }

    public function store(Request $request, TracerStudyForm $kuesioner)
    {
        $alumniProfile = Auth::user()->alumniProfile;

        if (! $kuesioner->is_active) {
            return back()->with('error', 'Kuesioner ini sudah tidak aktif.');
        }

        $request->validate([
            'answers' => 'required|array',
        ]);

        TracerStudyResponse::updateOrCreate(
            [
                'alumni_id' => $alumniProfile->id,
                'tracer_study_form_id' => $kuesioner->id,
            ],
            [
                'answers' => json_encode($request->answers),
            ]
        );

        return back()->with('message', 'Terima kasih telah mengisi Kuesioner Tracer Study!');
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
