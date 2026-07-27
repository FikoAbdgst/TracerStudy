<?php

namespace App\Http\Controllers\AdminKampus;

use App\Exports\TracerStudyExport;
use App\Http\Controllers\Controller;
use App\Models\TracerStudyForm;
use App\Models\TracerStudyResponse;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class TracerStudyController extends Controller
{
    public function index()
    {
        $forms = TracerStudyForm::latest()->get();

        return Inertia::render('AdminKampus/TracerStudy/Index', [
            'forms' => $forms,
        ]);
    }

    /**
     * Create a new Tracer Study form.
     * Status defaults to 'draft' — admin must explicitly activate it.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'questions' => 'nullable|array',
        ]);

        TracerStudyForm::create([...$validated, 'status' => 'draft']);

        return back()->with('message', 'Form kuesioner berhasil dibuat dalam status draft.');
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

    /**
     * Activate a draft Tracer Study form.
     *
     * RULE 1 (Single Active): Only 1 form may be active at any time.
     * RULE 2 (No Reactivation): A closed form CANNOT be activated.
     */
    public function activate(TracerStudyForm $tracer)
    {
        // Rule 2: closed forms are permanently locked
        if ($tracer->isClosed()) {
            return back()->with('error', 'Kuesioner yang sudah ditutup tidak dapat diaktifkan kembali.');
        }

        // Only draft forms can be activated
        if (! $tracer->isDraft()) {
            return back()->with('error', 'Hanya kuesioner berstatus draft yang dapat diaktifkan.');
        }

        // Rule 1: ensure no other form is currently active
        $existingActive = TracerStudyForm::active()->where('id', '!=', $tracer->id)->first();

        if ($existingActive) {
            return back()->with('error', 'Gagal mengaktifkan: Masih ada Tracer Study lain yang sedang aktif ('.$existingActive->title.'). Harap tutup sesi aktif terlebih dahulu.');
        }

        $tracer->update(['status' => 'active']);

        return back()->with('message', 'Kuesioner berhasil diaktifkan.');
    }

    /**
     * Close (permanently deactivate) a Tracer Study form.
     * One-way transition: once closed, a form can never be reactivated.
     */
    public function close(TracerStudyForm $tracer)
    {
        if ($tracer->isClosed()) {
            return back()->with('error', 'Kuesioner ini sudah dalam status ditutup.');
        }

        $tracer->update(['status' => 'closed']);

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

    public function previewExcel(TracerStudyForm $tracer)
    {
        $responses = TracerStudyResponse::with('alumni.user')
            ->where('tracer_study_form_id', $tracer->id)
            ->latest()
            ->get();

        $questions = is_string($tracer->questions) ? json_decode($tracer->questions, true) : ($tracer->questions ?? []);

        $rows = $responses->map(function ($resp) use ($questions) {
            $answers = is_string($resp->answers) ? json_decode($resp->answers, true) : ($resp->answers ?? []);

            $row = [
                'nim' => $resp->alumni->nim ?? '-',
                'nama' => $resp->alumni->user->name ?? '-',
                'prodi' => $resp->alumni->major ?? '-',
                'status' => $resp->status_pekerjaan ?? '-',
                'perusahaan' => $resp->nama_perusahaan ?? '-',
                'jabatan' => $resp->jabatan ?? '-',
                'tanggal' => $resp->created_at ? $resp->created_at->format('d/m/Y H:i') : '-',
            ];

            foreach ($questions as $q) {
                $qId = $q['id'] ?? null;
                $row[$q['question'] ?? $q['pertanyaan'] ?? "q_{$qId}"] = $answers[$qId] ?? $answers[$q['question']] ?? '-';
            }

            return $row;
        });

        $columns = [
            'nim' => 'NIM',
            'nama' => 'Nama Alumni',
            'prodi' => 'Program Studi',
            'status' => 'Status Pekerjaan',
            'perusahaan' => 'Perusahaan',
            'jabatan' => 'Jabatan',
            'tanggal' => 'Tanggal Pengisian',
        ];

        foreach ($questions as $q) {
            $columns[$q['question'] ?? $q['pertanyaan'] ?? "q_{$q['id']}"] = $q['question'] ?? $q['pertanyaan'] ?? 'Pertanyaan';
        }

        return response()->json([
            'title' => $tracer->title,
            'description' => $tracer->description,
            'total' => $responses->count(),
            'columns' => $columns,
            'rows' => $rows,
        ]);
    }

    public function previewPdf(TracerStudyForm $tracer)
    {
        $responses = TracerStudyResponse::with('alumni.user')
            ->where('tracer_study_form_id', $tracer->id)
            ->latest()
            ->get();

        $questions = is_string($tracer->questions) ? json_decode($tracer->questions, true) : ($tracer->questions ?? []);

        $html = view('exports.tracer-study-pdf', [
            'form' => $tracer,
            'responses' => $responses,
            'questions' => $questions,
        ])->render();

        return response($html)->header('Content-Type', 'text/html');
    }

    public function exportExcel(TracerStudyForm $tracer)
    {
        $responseCount = TracerStudyResponse::where('tracer_study_form_id', $tracer->id)->count();

        if ($responseCount === 0) {
            return back()->with('error', 'Tidak ada data respons untuk diekspor.');
        }

        $filename = 'tracer-study-'.$this->slugify($tracer->title).'-'.now()->format('Y-m-d').'.xlsx';

        return Excel::download(new TracerStudyExport($tracer), $filename);
    }

    public function exportPdf(TracerStudyForm $tracer)
    {
        $responses = TracerStudyResponse::with('alumni.user')
            ->where('tracer_study_form_id', $tracer->id)
            ->latest()
            ->get();

        if ($responses->isEmpty()) {
            return back()->with('error', 'Tidak ada data respons untuk diekspor.');
        }

        $questions = is_string($tracer->questions) ? json_decode($tracer->questions, true) : ($tracer->questions ?? []);

        $pdf = Pdf::loadView('exports.tracer-study-pdf', [
            'form' => $tracer,
            'responses' => $responses,
            'questions' => $questions,
        ])->setPaper('a4', 'landscape');

        $filename = 'tracer-study-'.$this->slugify($tracer->title).'-'.now()->format('Y-m-d').'.pdf';

        return $pdf->download($filename);
    }

    private function slugify($text)
    {
        $text = preg_replace('~[^\pL\d]+~u', '-', $text);
        $text = preg_replace('~[^-\w]+~', '', $text);
        $text = trim($text, '-');
        $text = preg_replace('~-+~', '-', $text);

        return strtolower($text);
    }
}
