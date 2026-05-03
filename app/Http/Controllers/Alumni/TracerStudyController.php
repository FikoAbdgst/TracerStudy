<?php

namespace App\Http\Controllers\Alumni;

use App\Http\Controllers\Controller;
use App\Models\TracerStudyForm;
use App\Models\TracerStudyResponse;
use App\Models\IndustrySektor;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class TracerStudyController extends Controller
{
    public function index()
    {
        $alumniProfile = Auth::user()->alumniProfile;

        // Validasi: Pastikan alumni sudah mengisi profil
        if (!$alumniProfile) {
            return redirect()->route('alumni.profile.edit')
                ->with('message', 'Silakan lengkapi profil Anda terlebih dahulu sebelum mengisi kuesioner.');
        }

        // Ambil semua form kuesioner yang sedang aktif
        $forms = TracerStudyForm::where('is_active', true)->latest()->get();

        // Cek kuesioner mana saja yang sudah pernah diisi oleh alumni ini
        $respondedFormIds = TracerStudyResponse::where('alumni_id', $alumniProfile->id)
            ->pluck('tracer_study_form_id')
            ->toArray();

        return Inertia::render('Alumni/Kuesioner/Index', [
            'forms' => $forms,
            'respondedFormIds' => $respondedFormIds,
        ]);
    }

    public function show(TracerStudyForm $kuesioner)
    {
        if (!$kuesioner->is_active) {
            abort(404, 'Kuesioner tidak aktif atau sudah ditutup.');
        }

        // Tarik data Sektor Industri untuk form builder yang butuh opsi dinamis
        $industries = IndustrySektor::select('id', 'name')->get();

        return Inertia::render('Alumni/Kuesioner/Show', [
            'tracerForm' => $kuesioner,
            'industries' => $industries,
        ]);
    }

    public function store(Request $request, TracerStudyForm $kuesioner)
    {
        $alumniId = Auth::user()->alumniProfile->id;

        $validated = $request->validate([
            'answers' => 'required|array', // Validasi jawaban dalam bentuk array
        ]);

        // Simpan jawaban. updateOrCreate mencegah alumni submit 2 kali untuk form yang sama
        TracerStudyResponse::updateOrCreate(
            ['tracer_study_form_id' => $kuesioner->id, 'alumni_id' => $alumniId],
            ['answers' => $validated['answers']]
        );

        return redirect()->route('alumni.kuesioner')->with('message', 'Terima kasih telah berpartisipasi mengisi kuesioner Tracer Study!');
    }
}
