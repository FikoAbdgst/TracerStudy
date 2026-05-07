<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\ProgramStudi;
use App\Models\IndustrySektor;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MasterDataController extends Controller
{
    public function index()
    {
        return Inertia::render('SuperAdmin/MasterData/Index', [
            'prodis'     => ProgramStudi::orderBy('created_at', 'desc')->get(),
            'industries' => IndustrySektor::orderBy('created_at', 'desc')->get(),
        ]);
    }

    // ── Program Studi ──────────────────────────────────────────────────────

    public function storeProdi(Request $request)
    {
        $validated = $request->validate([
            'name'    => 'required|string|max:255',
            'jenjang' => 'required|string|max:10',
        ]);
        ProgramStudi::create($validated);
        return back()->with('message', 'Program Studi berhasil ditambahkan.');
    }

    public function updateProdi(Request $request, ProgramStudi $prodi)
    {
        $validated = $request->validate([
            'name'    => 'required|string|max:255',
            'jenjang' => 'required|string|max:10',
        ]);
        $prodi->update($validated);
        return back()->with('message', 'Program Studi berhasil diperbarui.');
    }

    public function destroyProdi(ProgramStudi $prodi)
    {
        $prodi->delete();
        return back()->with('message', 'Program Studi berhasil dihapus.');
    }

    // ── Sektor Industri ────────────────────────────────────────────────────

    public function storeIndustry(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);
        IndustrySektor::create($validated);
        return back()->with('message', 'Sektor Industri berhasil ditambahkan.');
    }

    public function updateIndustry(Request $request, IndustrySektor $industry)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);
        $industry->update($validated);
        return back()->with('message', 'Sektor Industri berhasil diperbarui.');
    }

    public function destroyIndustry(IndustrySektor $industry)
    {
        $industry->delete();
        return back()->with('message', 'Sektor Industri berhasil dihapus.');
    }
}
