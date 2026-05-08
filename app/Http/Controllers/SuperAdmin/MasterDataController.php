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
        // Ambil semua kategori beserta item di dalamnya
        $categories = MasterCategory::with(['items' => function ($query) {
            $query->latest();
        }])->latest()->get();

        return Inertia::render('SuperAdmin/MasterData/Index', [
            'categories' => $categories,
        ]);
    }

    // ── KATEGORI (TABS) ────────────────────────────────────────────────────
    public function storeCategory(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'use_parameter' => 'boolean',
            'parameter_label' => 'nullable|string|max:255',
        ]);

        $validated['slug'] = Str::slug($validated['name']);
        MasterCategory::create($validated);

        return back()->with('message', 'Kategori baru berhasil ditambahkan.');
    }

    public function destroyCategory(MasterCategory $category)
    {
        $category->delete();
        return back()->with('message', 'Kategori beserta isinya berhasil dihapus.');
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

        // Cek apakah sudah ada untuk menghindari duplikat
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
