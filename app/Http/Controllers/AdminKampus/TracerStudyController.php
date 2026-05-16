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
            'questions' => 'nullable|array',
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
        if (!$tracer->is_active) {
            TracerStudyForm::where('id', '!=', $tracer->id)->update(['is_active' => false]);
            $tracer->update(['is_active' => true]);
        } else {
            $tracer->update(['is_active' => false]);
        }

        return back()->with('message', 'Status kuesioner berhasil diperbarui.');
    }
    public function responses(TracerStudyForm $tracer)
    {
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
