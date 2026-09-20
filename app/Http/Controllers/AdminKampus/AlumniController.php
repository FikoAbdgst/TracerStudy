<?php

namespace App\Http\Controllers\AdminKampus;

use App\Http\Controllers\Controller;
use App\Models\AlumniProfile;
use App\Models\JobApplication;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use PhpOffice\PhpSpreadsheet\IOFactory;

class AlumniController extends Controller
{
    public function index(Request $request)
    {
        $query = AlumniProfile::with('user')->latest();

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('nim', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($q2) use ($search) {
                        $q2->where('name', 'like', "%{$search}%");
                    });
            });
        }

        if ($prodi = $request->input('major')) {
            $query->where('major', $prodi);
        }

        if ($status = $request->input('employment_status')) {
            $query->where('employment_status', $status);
        }

        if ($year = $request->input('graduation_year')) {
            $query->where('graduation_year', $year);
        }

        $alumnis = $query->paginate(15)->withQueryString();
        $alumnis->getCollection()->transform(function ($al) {
            $al->total_applications = JobApplication::where('alumni_id', $al->id)->count();

            return $al;
        });

        $prodiList = AlumniProfile::whereNotNull('major')->distinct()->pluck('major')->sort()->values();
        $yearList = AlumniProfile::whereNotNull('graduation_year')->distinct()->pluck('graduation_year')->sortDesc()->values();

        return Inertia::render('AdminKampus/Alumni/Index', [
            'alumnis' => $alumnis,
            'prodiList' => $prodiList,
            'yearList' => $yearList,
            'filters' => $request->only(['search', 'major', 'employment_status', 'graduation_year']),
        ]);
    }

    public function show(AlumniProfile $alumni)
    {
        $alumni->load('user');

        $applications = JobApplication::with('jobPosting.company')
            ->where('alumni_id', $alumni->id)
            ->latest()
            ->get();

        $totalApplications = $applications->count();

        return Inertia::render('AdminKampus/Alumni/Show', [
            'alumni' => $alumni,
            'applications' => $applications,
            'totalApplications' => $totalApplications,
        ]);
    }

    private function getFilteredAlumni(Request $request)
    {
        $query = AlumniProfile::with('user')->latest();

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('nim', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($q2) use ($search) {
                        $q2->where('name', 'like', "%{$search}%");
                    });
            });
        }

        if ($prodi = $request->input('major')) {
            $query->where('major', $prodi);
        }

        if ($status = $request->input('employment_status')) {
            $query->where('employment_status', $status);
        }

        if ($year = $request->input('graduation_year')) {
            $query->where('graduation_year', $year);
        }

        $alumnis = $query->get()->map(function ($al) {
            $al->total_applications = JobApplication::where('alumni_id', $al->id)->count();

            return $al;
        });

        $filterLabels = [];
        if ($search) {
            $filterLabels[] = 'Pencarian: '.$search;
        }
        if ($prodi) {
            $filterLabels[] = 'Prodi: '.$prodi;
        }
        if ($status) {
            $filterLabels[] = 'Status: '.$status;
        }
        if ($year) {
            $filterLabels[] = 'Tahun Lulus: '.$year;
        }

        return ['alumnis' => $alumnis, 'filters' => $filterLabels];
    }

    public function previewPdf(Request $request)
    {
        ['alumnis' => $alumnis, 'filters' => $filterLabels] = $this->getFilteredAlumni($request);

        $html = view('exports.alumni-pdf', [
            'alumnis' => $alumnis,
            'total' => $alumnis->count(),
            'filters' => $filterLabels,
        ])->render();

        return response($html)->header('Content-Type', 'text/html');
    }

    public function exportPdf(Request $request)
    {
        ['alumnis' => $alumnis, 'filters' => $filterLabels] = $this->getFilteredAlumni($request);

        $pdf = Pdf::loadView('exports.alumni-pdf', [
            'alumnis' => $alumnis,
            'total' => $alumnis->count(),
            'filters' => $filterLabels,
        ])->setPaper('a4', 'landscape');

        $filename = 'data-alumni-'.now()->format('Y-m-d').'.pdf';

        return $pdf->download($filename);
    }

    public function downloadTemplate()
    {
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="Template_Import_Alumni.csv"',
        ];

        $callback = function () {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['NIM', 'Nama Lengkap', 'Jenjang', 'Program Studi', 'Tanggal Lahir (YYYY-MM-DD)', 'Tahun Lulus']);
            fputcsv($file, ['23010044', 'Fiko Abdigusti', 'D3', 'Teknik Informatika', '2001-08-15', '2025']);
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt,xlsx,xls|max:5120',
        ]);

        $file = $request->file('file');

        try {
            $rows = $this->readSpreadsheetRows($file);
        } catch (\Throwable $e) {
            return back()->with('import_error', 'File tidak dapat dibaca. Pastikan file CSV/Excel sesuai template resmi Import Data Alumni.');
        }

        if (count($rows) < 2) {
            return back()->with('import_error', 'File tidak berisi data. Gunakan template resmi dan isi minimal 1 baris data di bawah header.');
        }

        // ── VALIDASI HEADER ─────────────────────────────────────────────
        $expected = ['NIM', 'Nama Lengkap', 'Jenjang', 'Program Studi', 'Tanggal Lahir', 'Tahun Lulus'];

        // cari baris header (toleran terhadap baris kosong / konten di atasnya)
        $headerRow = null;
        foreach ($rows as $i => $row) {
            $norm = array_map(fn ($h) => $this->normalizeHeader($h), $row);
            if ($this->countMatchingHeaders($norm) >= 3) {
                $headerRow = $i;
                break;
            }
        }

        if ($headerRow === null) {
            return back()->with(
                'import_error',
                'Baris pertama harus berisi header kolom: NIM | Nama Lengkap | Jenjang | Program Studi | Tanggal Lahir (YYYY-MM-DD) | Tahun Lulus. Pastikan anda mengunggah file dari template resmi dan tidak mengubah baris pertama.'
            );
        }

        $rows = array_slice($rows, $headerRow);

        $colMap = $this->mapColumns(array_map(fn ($h) => $this->normalizeHeader($h), $rows[0]));

        $expectedNorm = array_map(fn ($col) => $this->normalizeHeader($col), $expected);
        $labels = array_combine($expectedNorm, $expected);
        $missing = array_values(array_filter($expectedNorm, fn ($col) => ! array_key_exists($col, $colMap)));
        $missingLabels = array_map(fn ($m) => $labels[$m], $missing);

        if (count($missingLabels) > 0) {
            return back()->with(
                'import_error',
                'Format kolom file tidak sesuai template. Kolom yang tidak ditemukan: '.implode(', ', $missingLabels).
                '. Baris pertama harus berupa header: NIM | Nama Lengkap | Jenjang | Program Studi | Tanggal Lahir (YYYY-MM-DD) | Tahun Lulus.'
            );
        }

        // ── VALIDASI SELURUH BARIS (sebelum insert apa pun) ─────────────
        $dataRows = array_slice($rows, 1);
        $errors = [];
        $validRows = [];
        $allowedJenjang = ['D3', 'S1', 'S2', 'S3'];

        foreach ($dataRows as $lineNo => $row) {
            $values = [];
            foreach ($colMap as $col => $idx) {
                $values[$col] = trim((string) ($row[$idx] ?? ''));
            }

            if ($values['nim'] === '' && $values['namalengkap'] === '' && $values['programstudi'] === '') {
                continue; // baris kosong
            }

            $rowErrors = [];
            if ($values['nim'] === '') {
                $rowErrors[] = 'NIM kosong';
            }
            if ($values['namalengkap'] === '') {
                $rowErrors[] = 'Nama Lengkap kosong';
            }
            if ($values['jenjang'] !== '' && ! in_array($values['jenjang'], $allowedJenjang, true)) {
                $rowErrors[] = 'Jenjang "'.$values['jenjang'].'" tidak valid (harus D3/S1/S2/S3)';
            }
            if ($values['tanggallahir'] !== '') {
                try {
                    Carbon::parse($values['tanggallahir']);
                } catch (\Throwable $e) {
                    $rowErrors[] = 'Tanggal Lahir "'.$values['tanggallahir'].'" tidak valid (format YYYY-MM-DD)';
                }
            }
            if ($values['tahunlulus'] !== '' && ! preg_match('/^\d{4}$/', $values['tahunlulus'])) {
                $rowErrors[] = 'Tahun Lulus "'.$values['tahunlulus'].'" tidak valid (4 digit angka)';
            }

            if (count($rowErrors) > 0) {
                $errors[] = 'Baris '.($lineNo + 2).': '.implode('; ', $rowErrors);

                continue;
            }

            $validRows[] = $values;
        }

        if (count($errors) > 0) {
            $shown = array_slice($errors, 0, 8);
            $more = count($errors) > 8 ? ' (dan '.count($errors).' kesalahan lainnya)' : '';

            return back()->with(
                'import_error',
                'Import dibatalkan — tidak ada data yang dimasukkan. Terdapat '.count($errors).' baris bermasalah: '.implode(' || ', $shown).$more
            );
        }

        // ── PROSES IMPORT ────────────────────────────────────────────────
        $count = 0;
        $duplicates = [];

        DB::beginTransaction();
        try {
            foreach ($validRows as $values) {
                if (AlumniProfile::where('nim', $values['nim'])->exists()) {
                    $duplicates[] = [
                        'nim' => $values['nim'],
                        'name' => $values['namalengkap'],
                        'major' => $values['programstudi'],
                    ];

                    continue;
                }

                $user = User::firstOrCreate(
                    ['email' => $values['nim'].'@alumni.kampus.ac.id'],
                    ['name' => $values['namalengkap'], 'password' => Hash::make($values['nim'])]
                );

                if (! $user->hasRole('Alumni')) {
                    $user->assignRole('Alumni');
                }

                AlumniProfile::create([
                    'user_id' => $user->id,
                    'nim' => $values['nim'],
                    'jenjang_pendidikan' => $values['jenjang'],
                    'major' => $values['programstudi'],
                    'tanggal_lahir' => $values['tanggallahir'],
                    'graduation_year' => $values['tahunlulus'] ?: null,
                    'employment_status' => 'Mencari Kerja',
                ]);

                $count++;
            }

            DB::commit();

            return back()->with('import_result', [
                'inserted' => $count,
                'duplicates' => $duplicates,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return back()->with('import_error', 'Terjadi kesalahan sistem: '.$e->getMessage());
        }
    }

    /**
     * Baca baris file CSV/TXT atau Excel (XLSX/XLS) menjadi array 2 dimensi.
     */
    private function readSpreadsheetRows($file)
    {
        $ext = strtolower($file->getClientOriginalExtension());

        if (in_array($ext, ['xlsx', 'xls'], true)) {
            try {
                $spreadsheet = IOFactory::load($file->getPathname());
                $sheet = $spreadsheet->getActiveSheet()->toArray(null, true, true, true);

                $rows = [];
                foreach ($sheet as $row) {
                    $rows[] = array_map(fn ($v) => $v === null ? '' : $v, array_values($row));
                }

                return $rows;
            } catch (\Throwable $e) {
                throw new \RuntimeException('File Excel tidak dapat dibaca.');
            }
        }

        $handle = fopen($file->getPathname(), 'r');

        $sample = null;
        for ($i = 0; $i < 20 && $sample === null; $i++) {
            $line = fgets($handle);
            if ($line === false) {
                break;
            }
            if (trim($line) !== '') {
                $sample = $line;
            }
        }
        rewind($handle);

        $delimiter = ',';
        if ($sample !== null) {
            $counts = [
                ',' => substr_count($sample, ','),
                ';' => substr_count($sample, ';'),
                "\t" => substr_count($sample, "\t"),
            ];
            arsort($counts);
            if (max($counts) > 0) {
                $delimiter = array_key_first($counts);
            }
        }

        $rows = [];
        while (($row = fgetcsv($handle, 0, $delimiter, '"', '\\')) !== false) {
            $rows[] = $row;
        }
        fclose($handle);

        if (isset($rows[0][0])) {
            $rows[0][0] = preg_replace('/^\xEF\xBB\xBF/', '', $rows[0][0]);
        }

        return $rows;
    }

    /**
     * Normalisasi teks header menjadi kata kunci huruf kecil non-spasi.
     * Contoh: "Tanggal Lahir (YYYY-MM-DD)" → "tanggallahiryymmdd".
     */
    private function normalizeHeader(?string $h): string
    {
        return preg_replace('/[^a-z]/', '', strtolower(trim($h ?? '')));
    }

    /**
     * Hitung berapa kolom header yang dikenali sebagai kolom template.
     */
    private function countMatchingHeaders(array $norm): int
    {
        $hits = 0;
        foreach ($norm as $n) {
            if ($n === 'nim'
                || str_starts_with($n, 'nama')
                || $n === 'jenjang'
                || str_starts_with($n, 'programstud')
                || str_starts_with($n, 'prodi')
                || str_starts_with($n, 'tanggallahir')
                || str_starts_with($n, 'tahunlulus')) {
                $hits++;
            }
        }

        return $hits;
    }

    /**
     * Petakan index kolom berdasarkan header yang dinormalisasi.
     */
    private function mapColumns(array $header): array
    {
        $map = [];
        foreach ($header as $idx => $h) {
            if ($h === 'nim') {
                $map['nim'] = $idx;
            } elseif (str_starts_with($h, 'nama')) {
                $map['namalengkap'] = $idx;
            } elseif ($h === 'jenjang') {
                $map['jenjang'] = $idx;
            } elseif (str_starts_with($h, 'programstud') || str_starts_with($h, 'prodi')) {
                $map['programstudi'] = $idx;
            } elseif (str_starts_with($h, 'tanggallahir')) {
                $map['tanggallahir'] = $idx;
            } elseif (str_starts_with($h, 'tahunlulus')) {
                $map['tahunlulus'] = $idx;
            }
        }

        return $map;
    }
}
