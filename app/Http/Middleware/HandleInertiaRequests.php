<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                // Pastikan user ada sebelum mencoba mengambil data
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    // Tarik nama rolenya sebagai array sederhana
                    'roles' => $request->user()->roles->pluck('name'),
                    // Tarik notifikasi, pastikan di-load sebagai array object sederhana
                    'notifications' => $request->user()->unreadNotifications()->take(5)->get()->toArray(),
                ] : null,
            ],
            // Opsional: Untuk menampilkan flash message sukses/error dari backend
            'flash' => [
                'message' => fn() => $request->session()->get('message'),
                'error' => fn() => $request->session()->get('error'),
            ],
        ];
    }
}
