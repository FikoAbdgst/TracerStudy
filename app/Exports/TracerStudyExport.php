<?php

namespace App\Exports;

use App\Models\TracerStudyResponse;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class TracerStudyExport implements FromCollection, WithHeadings, WithMapping, WithStyles
{
    protected $form;

    protected $questions;

    public function __construct($form)
    {
        $this->form = $form;
        $this->questions = is_string($form->questions) ? json_decode($form->questions, true) : ($form->questions ?? []);
    }

    public function collection()
    {
        return TracerStudyResponse::with('alumni.user')
            ->where('tracer_study_form_id', $this->form->id)
            ->latest()
            ->get();
    }

    public function headings(): array
    {
        $headings = [
            'No',
            'NIM',
            'Nama Alumni',
            'Program Studi',
            'Status Pekerjaan',
            'Nama Perusahaan',
            'Jabatan',
            'Tanggal Pengisian',
        ];

        foreach ($this->questions as $q) {
            $headings[] = $q['question'] ?? $q['pertanyaan'] ?? 'Pertanyaan';
        }

        return $headings;
    }

    public function map($response): array
    {
        static $no = 0;
        $no++;

        $row = [
            $no,
            $response->alumni->nim ?? '-',
            $response->alumni->user->name ?? '-',
            $response->alumni->major ?? '-',
            $response->status_pekerjaan ?? '-',
            $response->nama_perusahaan ?? '-',
            $response->jabatan ?? '-',
            $response->created_at ? $response->created_at->format('d/m/Y H:i') : '-',
        ];

        $answers = is_string($response->answers) ? json_decode($response->answers, true) : ($response->answers ?? []);
        foreach ($this->questions as $q) {
            $qId = $q['id'] ?? null;
            $row[] = $answers[$qId] ?? $answers[$q['question']] ?? '-';
        }

        return $row;
    }

    public function styles(Worksheet $sheet): array
    {
        return [
            1 => ['font' => ['bold' => true, 'size' => 11]],
        ];
    }
}
