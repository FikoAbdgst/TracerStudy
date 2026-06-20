<?php

namespace App\Http\Controllers\Perusahaan;

use App\Http\Controllers\Controller;
use App\Models\AlumniProfile;
use App\Models\MasterCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class TalentPoolController extends Controller
{
    public function index(Request $request)
    {
        $company = Auth::user()->company;

        if (! $company) {
            return redirect()->route('perusahaan.profile.edit')->with('error', 'Silakan lengkapi profil terlebih dahulu.');
        }

        $query = AlumniProfile::with('user')
            ->where('is_open_to_work', true);

        if ($search = $request->input('search')) {
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        if ($skill = $request->input('skill')) {
            $query->whereJsonContains('skills', $skill);
        }

        if ($major = $request->input('major')) {
            $query->where('major', $major);
        }

        $alumni = $query->latest()->paginate(12)->withQueryString();

        $keahlianCat = MasterCategory::with('items')->where('slug', 'keahlian')->first();
        $keahlianMaster = $keahlianCat ? $keahlianCat->items : [];

        $majors = AlumniProfile::where('is_open_to_work', true)
            ->whereNotNull('major')
            ->distinct()
            ->pluck('major')
            ->sort()
            ->values();

        return Inertia::render('Perusahaan/TalentPool/Index', [
            'alumni' => $alumni,
            'filters' => $request->only(['search', 'skill', 'major']),
            'skills' => $keahlianMaster,
            'majors' => $majors,
            'company' => $company->only(['id', 'name']),
        ]);
    }

    public function show(AlumniProfile $alumni)
    {
        $company = Auth::user()->company;

        if (! $company) {
            return redirect()->route('perusahaan.profile.edit')->with('error', 'Silakan lengkapi profil terlebih dahulu.');
        }

        if (! $alumni->is_open_to_work) {
            return redirect()->route('perusahaan.talent-pool')->with('error', 'Alumni ini tidak sedang membuka diri untuk peluang kerja.');
        }

        $alumni->load('user');

        return Inertia::render('Perusahaan/TalentPool/Show', [
            'alumni' => $alumni,
            'company' => $company->only(['id', 'name']),
        ]);
    }
}
