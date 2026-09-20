<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class EnsureActiveAlumni
{
    public function handle(Request $request, Closure $next): Response
    {
        $alumni = $request->user()?->alumniProfile;

        $expired = $alumni && $alumni->graduation_year
            && ((int) date('Y') - (int) $alumni->graduation_year) > 5;

        if ($expired) {
            return Inertia::render('Alumni/AccountLocked', [
                'graduationYear' => $alumni->graduation_year,
            ])->toResponse($request);
        }

        return $next($request);
    }
}
