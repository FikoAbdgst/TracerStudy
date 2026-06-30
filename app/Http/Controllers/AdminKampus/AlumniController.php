<?php

namespace App\Http\Controllers\AdminKampus;

use App\Http\Controllers\Controller;
use App\Models\AlumniProfile;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class AlumniController extends Controller
{
    public function index()
    {
        $alumnis = AlumniProfile::with('user')->latest()->get();

        return Inertia::render('AdminKampus/Alumni/Index', [
            'alumnis' => $alumnis,
        ]);
    }

    public function downloadTemplate()
    {
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="Template_Import_Alumni.csv"',
        ];

        $callback = function () {
            $file = fopen('php://output', 'w');
            // 1. Tulis Header (Ditambah Jenjang dan Tgl Lahir)
            fputcsv($file, ['NIM', 'Nama Lengkap', 'Jenjang', 'Program Studi', 'Tanggal Lahir (YYYY-MM-DD)', 'Tahun Lulus']);
            // 2. Tulis Contoh Data
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
        fgetcsv($fileHandle); // Lewati Header

        $count = 0;
        $duplicates = [];

        DB::beginTransaction();
        try {
            while (($row = fgetcsv($fileHandle)) !== false) {
                // Mapping index Excel yang baru
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
