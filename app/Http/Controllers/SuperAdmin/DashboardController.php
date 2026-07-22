<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\AlumniProfile;
use App\Models\Company;
use App\Models\TracerStudyResponse;
use App\Models\User;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $totalAlumni = User::role('Alumni')->count();
        $totalCompanies = Company::count();
        $totalUsers = User::count();
        $totalAlumniProfiles = AlumniProfile::count();

        $responseRate = $totalAlumniProfiles > 0
            ? round(TracerStudyResponse::distinct('alumni_id')->count('alumni_id') / $totalAlumniProfiles * 100)
            : 0;

        $recentUsers = User::latest('created_at')
            ->take(5)
            ->get()
            ->map(fn ($u) => [
                'id' => $u->id,
                'name' => $u->name,
                'role' => $u->getRoleNames()->first() ?? 'Unknown',
                'created_at' => $u->created_at,
            ]);

        return Inertia::render('SuperAdmin/Dashboard', [
            'stats' => [
                'totalUsers' => $totalUsers,
                'totalAlumni' => $totalAlumni,
                'totalPerusahaan' => $totalCompanies,
                'responsRate' => $responseRate,
            ],
            'recentUsers' => $recentUsers,
        ]);
    }
}
