<?php

// app/Http/Controllers/Alumni/DashboardController.php
namespace App\Http\Controllers\Alumni;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        return Inertia::render('Alumni/Dashboard', [
            'hasFilledTracer' => $user->tracerStudyResponses()->exists(),
            'applicationStatus' => $user->alumniProfile->applications()->with('jobPosting')->latest()->take(5)->get(),
        ]);
    }
}
