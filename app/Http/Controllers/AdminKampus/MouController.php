<?php

namespace App\Http\Controllers\AdminKampus;

use App\Http\Controllers\Controller;
use App\Models\MouDocument;
use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class MouController extends Controller
{
    public function index()
    {
        $mous = MouDocument::with('company')->latest()->get();
        // Tarik juga data perusahaan untuk pilihan di form tambah MoU
        $companies = Company::select('id', 'name')->get();

        return Inertia::render('AdminKampus/MoU/Index', [
            'mous' => $mous,
            'companies' => $companies
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'company_id' => 'required|exists:companies,id',
            'file' => 'required|file|mimes:pdf|max:5120', // Maksimal 5MB, hanya PDF
            'signed_at' => 'required|date',
            'expires_at' => 'required|date|after:signed_at',
        ]);

        // Proses Upload File
        if ($request->hasFile('file')) {
            $path = $request->file('file')->store('mou_documents', 'public');

            MouDocument::create([
                'company_id' => $validated['company_id'],
                'file_url' => $path,
                'status' => 'active',
                'signed_at' => $validated['signed_at'],
                'expires_at' => $validated['expires_at'],
            ]);
        }

        return back()->with('message', 'Dokumen MoU berhasil diunggah.');
    }

    // Fungsi <<extends>> Mengakhiri Kerja Sama
    public function terminate(MouDocument $mou)
    {
        // Ubah status menjadi terminated (Diakhiri)
        $mou->update(['status' => 'terminated']);
        return back()->with('message', 'Kerja sama (MoU) berhasil diakhiri.');
    }
}
