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
            'forms' => $forms,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'questions' => 'nullable|array',
        ]);

        TracerStudyForm::where('is_active', true)->update(['is_active' => false]);

        TracerStudyForm::create([...$validated, 'is_active' => true]);

        return back()->with('message', 'Form kuesioner berhasil dibuat dan diaktifkan.');
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

    public function close(TracerStudyForm $tracer)
    {
        if (! $tracer->is_active) {
            return back()->with('error', 'Kuesioner yang sudah ditutup tidak dapat dibuka kembali.');
        }

        $tracer->update(['is_active' => false]);

        return back()->with('message', 'Kuesioner berhasil ditutup secara permanen.');
    }

    public function responses(TracerStudyForm $tracer)
    {
        $responses = TracerStudyResponse::with('alumni.user')
            ->where('tracer_study_form_id', $tracer->id)
            ->latest()
            ->get();

        return Inertia::render('AdminKampus/TracerStudy/Responses', [
            'tracer' => $tracer,
            'responses' => $responses,
        ]);
    }
}
