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

        // PERBAIKAN: Hapus filter where('is_active', true) sementara waktu
        // Agar form yang baru dibuat admin langsung bisa dites dan muncul di alumni
        $forms = TracerStudyForm::latest()->get();

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
        // Ambil ID profil alumni yang sedang login
        $alumniId = Auth::user()->alumniProfile->id;

        // Cari di database apakah alumni ini sudah pernah men-submit jawaban untuk kuesioner ini
        $response = TracerStudyResponse::where('tracer_study_form_id', $kuesioner->id)
            ->where('alumni_id', $alumniId)
            ->first();

        // Pastikan format jawabannya berupa array agar bisa dibaca React
        $existingAnswers = null;
        if ($response) {
            $existingAnswers = is_string($response->answers) ? json_decode($response->answers, true) : $response->answers;
        }

        $industries = IndustrySektor::select('id', 'name')->get();

        return Inertia::render('Alumni/Kuesioner/Show', [
            'tracerForm' => $kuesioner,
            'industries' => $industries,
            // WAJIB DITAMBAHKAN: Kirim jawaban lama ke Frontend
            'existingResponse' => $existingAnswers
        ]);
    }

    public function store(Request $request, TracerStudyForm $kuesioner)
    {
        $alumniId = Auth::user()->alumniProfile->id;

        $validated = $request->validate([
            'answers' => 'required|array',
        ]);

        TracerStudyResponse::updateOrCreate(
            ['tracer_study_form_id' => $kuesioner->id, 'alumni_id' => $alumniId],
            ['answers' => $validated['answers']]
        );

        return redirect()->route('alumni.kuesioner')->with('message', 'Terima kasih telah berpartisipasi mengisi kuesioner Tracer Study!');
    }
    public function destroyResponse(TracerStudyForm $kuesioner)
    {
        $alumniId = Auth::user()->alumniProfile->id;

        TracerStudyResponse::where('tracer_study_form_id', $kuesioner->id)
            ->where('alumni_id', $alumniId)
            ->delete();

        return redirect()->route('alumni.kuesioner')->with('message', 'Jawaban kuesioner berhasil dihapus.');
    }
}
