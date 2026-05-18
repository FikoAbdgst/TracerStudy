<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\MasterCategory;
use App\Models\MasterItem;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class MasterDataController extends Controller
{
    public function index()
    {
        // Pastikan kategori dasar selalu ada di database (Sektor Industri, Program Studi, Keahlian)
        // Kita menggunakan firstOrCreate agar tidak error meski dihapus sebelumnya
        $industriCat = MasterCategory::firstOrCreate(
            ['slug' => 'sektor-industri'],
            ['name' => 'Sektor Industri', 'use_parameter' => false]
        );
        $prodiCat = MasterCategory::firstOrCreate(
            ['slug' => 'program-studi'],
            ['name' => 'Program Studi', 'use_parameter' => true, 'parameter_label' => 'Jenjang']
        );
        $keahlianCat = MasterCategory::firstOrCreate(
            ['slug' => 'keahlian'],
            ['name' => 'Keahlian / Skill', 'use_parameter' => false]
        );

        // Ambil data beserta relasinya (items)
        $categories = MasterCategory::with(['items' => function ($query) {
            $query->latest();
        }])->get()->keyBy('slug'); // Kita jadikan 'slug' sebagai kunci array untuk mempermudah pemanggilan di React

        return Inertia::render('SuperAdmin/MasterData/Index', [
            'categoriesData' => $categories,
        ]);
    }

    // ── ITEM MASTER DATA ───────────────────────────────────────────────────
    public function storeItem(Request $request)
    {
        $validated = $request->validate([
            'master_category_id' => 'required|exists:master_categories,id',
            'name' => 'required|string|max:255',
            'parameter_value' => 'nullable|string|max:255',
        ]);

        MasterItem::create($validated);
        return back()->with('message', 'Data berhasil ditambahkan.');
    }

    public function updateItem(Request $request, MasterItem $item)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'parameter_value' => 'nullable|string|max:255',
        ]);

        $item->update($validated);
        return back()->with('message', 'Data berhasil diperbarui.');
    }

    public function destroyItem(MasterItem $item)
    {
        $item->delete();
        return back()->with('message', 'Data berhasil dihapus.');
    }

    public function quickAddKeahlian(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $category = MasterCategory::where('slug', 'keahlian')->first();

        if (!$category) {
            return response()->json(['error' => 'Kategori Keahlian tidak ditemukan di Master Data.'], 404);
        }

        $existing = MasterItem::where('master_category_id', $category->id)
            ->where('name', 'like', $validated['name'])
            ->first();

        if ($existing) {
            return response()->json($existing);
        }

        $newItem = MasterItem::create([
            'master_category_id' => $category->id,
            'name' => $validated['name'],
            'is_active' => true,
        ]);

        return response()->json($newItem);
    }
}
