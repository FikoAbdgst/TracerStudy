<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $notifications = $request->user()->notifications()
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('Notifications/Index', [
            'notifications' => $notifications,
        ]);
    }

    public function poll(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'notifications' => $user->unreadNotifications()->take(5)->get()->toArray(),
            'unread_count' => $user->unreadNotifications()->count(),
        ]);
    }

    public function readAll(Request $request)
    {
        $request->user()->unreadNotifications->markAsRead();

        return back()->with('message', 'Semua notifikasi telah ditandai dibaca.');
    }
}
