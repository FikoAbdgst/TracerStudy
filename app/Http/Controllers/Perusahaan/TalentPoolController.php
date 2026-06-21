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
    protected function maskProfile($alumni, $company)
    {
        if ($alumni->privacy_hide_phone) {
            $alumni->phone_number = null;
            $alumni->phone_hidden = true;
        } else {
            $alumni->phone_hidden = false;
        }

        if ($alumni->privacy_hide_address) {
            $alumni->address = null;
            $alumni->detail_address = null;
            $alumni->address_hidden = true;
        } else {
            $alumni->address_hidden = false;
        }

        $alumni->is_saved = $company->savedCandidates()
            ->where('alumni_profile_id', $alumni->id)
            ->exists();

        return $alumni;
    }

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

        $alumni->getCollection()->transform(function ($item) use ($company) {
            return $this->maskProfile($item, $company);
        });

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
        $alumni = $this->maskProfile($alumni, $company);

        $jobList = $company->jobPostings()
            ->where('is_active', true)
            ->get(['id', 'title']);

        return Inertia::render('Perusahaan/TalentPool/Show', [
            'alumni' => $alumni,
            'company' => $company->only(['id', 'name']),
            'jobList' => $jobList,
        ]);
    }

    public function toggleBookmark(AlumniProfile $alumni)
    {
        $company = Auth::user()->company;

        if (! $company) {
            return response()->json(['error' => 'Profil perusahaan tidak ditemukan.'], 404);
        }

        $saved = $company->savedCandidates();

        if ($saved->where('alumni_profile_id', $alumni->id)->exists()) {
            $saved->detach($alumni->id);
            $bookmarked = false;
        } else {
            $saved->attach($alumni->id);
            $bookmarked = true;
        }

        return response()->json(['bookmarked' => $bookmarked]);
    }

    public function savedCandidates(Request $request)
    {
        $company = Auth::user()->company;

        if (! $company) {
            return redirect()->route('perusahaan.profile.edit')->with('error', 'Silakan lengkapi profil terlebih dahulu.');
        }

        $query = $company->savedCandidates()->with('user');

        if ($search = $request->input('search')) {
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        $alumni = $query->latest()->paginate(12)->withQueryString();

        $alumni->getCollection()->transform(function ($item) use ($company) {
            $item->is_saved = true;

            return $this->maskProfile($item, $company);
        });

        return Inertia::render('Perusahaan/TalentPool/Saved', [
            'alumni' => $alumni,
            'filters' => $request->only(['search']),
            'company' => $company->only(['id', 'name']),
        ]);
    }
}
