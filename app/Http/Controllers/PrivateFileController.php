<?php

namespace App\Http\Controllers;

use App\Models\JobApplication;
use Illuminate\Support\Facades\Storage;

class PrivateFileController extends Controller
{
    public function __invoke(string $path)
    {
        $disk = Storage::disk('local');

        if (! $disk->exists($path)) {
            abort(404);
        }

        $user = request()->user();

        $allowed = false;

        if ($user->hasRole('Super Admin')) {
            $allowed = true;
        } elseif ($user->hasRole('Admin Kampus')) {
            $allowed = str_starts_with($path, 'mou_documents/');
        } elseif ($user->hasRole('Admin PT')) {
            $company = $user->company;
            if ($company) {
                if (str_starts_with($path, 'mou_documents/')) {
                    $allowed = $company->mouDocuments()
                        ->where('file_url', $path)
                        ->exists();
                }
                if (str_starts_with($path, 'cv_documents/')) {
                    $allowed = $company->jobPostings()
                        ->whereHas('applications', fn ($q) => $q->where('cv_path', $path))
                        ->exists();
                }
            }
        } elseif ($user->hasRole('Alumni')) {
            $alumni = $user->alumniProfile;
            if ($alumni) {
                if (str_starts_with($path, 'alumni_cvs/')) {
                    $allowed = $path === $alumni->cv_path;
                }
                if (str_starts_with($path, 'cv_documents/')) {
                    $allowed = JobApplication::where('alumni_id', $alumni->id)
                        ->where('cv_path', $path)
                        ->exists();
                }
            }
        }

        if (! $allowed) {
            abort(403);
        }

        return $disk->response($path);
    }
}
