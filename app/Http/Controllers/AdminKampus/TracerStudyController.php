<?php

namespace App\Http\Controllers\AdminKampus;

use App\Http\Controllers\Controller;
use App\Models\TracerStudyForm;
use App\Models\TracerStudyResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TracerStudyController extends Controller
{
    public function index()
    {
        $forms = TracerStudyForm::latest()->get();
        return Inertia::render('AdminKampus/TracerStudy/Index', [
            'forms' => $forms
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'questions' => 'nullable|array', // JSON array dari Form Builder
        ]);

        TracerStudyForm::create($validated);
        return back()->with('message', 'Form kuesioner berhasil dibuat.');
    }

    public function update(Request $request, TracerStudyForm $tracer)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'questions' => 'nullable|array',
        ]);

        $tracer->update($validated);
        return back()->with('message', 'Form kuesioner berhasil diperbarui.');
    }

    public function destroy(TracerStudyForm $tracer)
    {
        $tracer->delete();
        return back()->with('message', 'Form dihapus.');
    }

    public function toggleActive(TracerStudyForm $tracer)
    {
        // Fitur untuk mengaktifkan/menonaktifkan kuesioner
        $tracer->update(['is_active' => !$tracer->is_active]);
        return back()->with('message', 'Status kuesioner diubah.');
    }
    public function responses(TracerStudyForm $tracer)
    {
        // Ambil semua jawaban untuk form ini, beserta relasi data alumni dan usernya
        $responses = TracerStudyResponse::with('alumni.user')
            ->where('tracer_study_form_id', $tracer->id)
            ->latest()
            ->get();

        return Inertia::render('AdminKampus/TracerStudy/Responses', [
            'tracer' => $tracer,
            'responses' => $responses
        ]);
    }
}
