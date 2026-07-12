<?php

namespace App\Http\Controllers\AdminKampus;

use App\Http\Controllers\Controller;
use App\Models\AlumniProfile;
use App\Models\JobApplication;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

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
            'file' => 'required|file|mimes:csv,txt|max:5120',
        ]);

        $file = $request->file('file');
        $fileHandle = fopen($file->getPathname(), 'r');
        fgetcsv($fileHandle);

        $count = 0;
        $duplicates = [];

        DB::beginTransaction();
        try {
            while (($row = fgetcsv($fileHandle)) !== false) {
                $nim = $row[0] ?? null;
                $name = $row[1] ?? null;
                $jenjang = $row[2] ?? null;
                $major = $row[3] ?? null;
                $tgl_lahir = $row[4] ?? null;
                $graduation_year = $row[5] ?? null;

                if (! $nim || ! $name) {
                    continue;
                }

                if (AlumniProfile::where('nim', $nim)->exists()) {
                    $duplicates[] = ['nim' => $nim, 'name' => $name, 'major' => $major];

                    continue;
                }

                $user = User::firstOrCreate(
                    ['email' => $nim.'@alumni.kampus.ac.id'],
                    ['name' => $name, 'password' => Hash::make($nim)]
                );

                if (! $user->hasRole('Alumni')) {
                    $user->assignRole('Alumni');
                }

                AlumniProfile::create([
                    'user_id' => $user->id,
                    'nim' => $nim,
                    'jenjang_pendidikan' => $jenjang,
                    'major' => $major,
                    'tanggal_lahir' => $tgl_lahir,
                    'graduation_year' => $graduation_year,
                    'employment_status' => 'Mencari Kerja',
                ]);

                $count++;
            }

            DB::commit();
            fclose($fileHandle);

            if (count($duplicates) > 0) {
                return back()->with('message', "Import selesai. $count data berhasil ditambahkan.")->with('duplicates', $duplicates);
            }

            return back()->with('message', "Sukses! $count data alumni berhasil diimport.");
        } catch (\Exception $e) {
            DB::rollBack();
            fclose($fileHandle);

            return back()->with('error', 'Terjadi kesalahan sistem: '.$e->getMessage());
        }
    }
}
