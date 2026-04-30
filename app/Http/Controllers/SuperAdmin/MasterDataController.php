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
            'prodis' => ProgramStudi::all(),
            'industries' => IndustrySektor::all(),
        ]);
    }

    // Program Studi CRUD
    public function storeProdi(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'jenjang' => 'required|string|max:10',
        ]);
        ProgramStudi::create($validated);
        return back()->with('message', 'Program Studi berhasil ditambahkan.');
    }

    // Sektor Industri CRUD
    public function storeIndustry(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);
        IndustrySektor::create($validated);
        return back()->with('message', 'Sektor Industri berhasil ditambahkan.');
    }

    // Tambahkan method destroyProdi dan destroyIndustry sesuai kebutuhan
    public function destroyProdi(ProgramStudi $prodi)
    {
        $prodi->delete();
        return back()->with('message', 'Program Studi berhasil dihapus.');
    }

    public function destroyIndustry(IndustrySektor $industry)
    {
        $industry->delete();
        return back()->with('message', 'Sektor Industri berhasil dihapus.');
    }
}
