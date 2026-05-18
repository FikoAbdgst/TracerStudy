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
            'alumnis' => $alumnis
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
            fputcsv($file, ['NIM', 'Nama Lengkap', 'Program Studi', 'Tahun Lulus']);
            fputcsv($file, ['23010044', 'Fiko Abdigusti', 'Teknik Informatika', '2025']);
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

        fgetcsv($fileHandle); // Lewati baris pertama (Header)

        $count = 0;
        $duplicates = []; // Array untuk menampung data yang duplikat

        DB::beginTransaction();
        try {
            while (($row = fgetcsv($fileHandle)) !== false) {
                $nim = $row[0] ?? null;
                $name = $row[1] ?? null;
                $major = $row[2] ?? null;
                $graduation_year = $row[3] ?? null;

                if (!$nim || !$name) continue;

                // --- CEK DUPLIKASI DATA ---
                // Jika NIM sudah ada di database, masukkan ke array dan SKIP!
                $isDuplicate = AlumniProfile::where('nim', $nim)->exists();
                if ($isDuplicate) {
                    $duplicates[] = [
                        'nim' => $nim,
                        'name' => $name,
                        'major' => $major
                    ];
                    continue; // Skip baris ini, lanjut ke baris excel berikutnya
                }

                $email = $nim . '@alumni.kampus.ac.id';

                $user = User::firstOrCreate(
                    ['email' => $email],
                    [
                        'name' => $name,
                        'password' => Hash::make($nim),
                    ]
                );

                if (!$user->hasRole('Alumni')) {
                    $user->assignRole('Alumni');
                }

                AlumniProfile::create([
                    'user_id' => $user->id,
                    'nim' => $nim,
                    'major' => $major,
                    'graduation_year' => $graduation_year,
                ]);

                $count++;
            }

            DB::commit();
            fclose($fileHandle);

            // Jika ada data yang terdeteksi duplikat, kirim respon khusus
            if (count($duplicates) > 0) {
                return back()
                    ->with('message', "Import selesai. $count data berhasil ditambahkan.")
                    ->with('duplicates', $duplicates); // Kirim array duplikat ke React
            }

            return back()->with('message', "Sukses! Semua $count data alumni berhasil diimport dan akun otomatis dibuat.");
        } catch (\Exception $e) {
            DB::rollBack();
            fclose($fileHandle);
            return back()->with('error', 'Terjadi kesalahan sistem: ' . $e->getMessage());
        }
    }
}
