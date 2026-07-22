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
        $user = $request->user();

        $conversations = [];
        if ($user) {
            $conversations = $user->conversations()
                ->with(['lastMessage.sender', 'participants.user'])
                ->latest('updated_at')
                ->get()
                ->map(function ($conv) use ($user) {
                    $otherParticipant = $conv->participants->where('user_id', '!=', $user->id)->first();
                    $otherUser = $otherParticipant?->user;

                    return [
                        'id' => $conv->id,
                        'type' => $conv->type,
                        'status' => $conv->status,
                        'other_user' => $otherUser ? [
                            'id' => $otherUser->id,
                            'name' => $otherUser->name,
                            'role' => $otherUser->getRoleNames()->first(),
                        ] : null,
                        'last_message' => $conv->lastMessage ? [
                            'body' => $conv->lastMessage->body,
                            'sender_id' => $conv->lastMessage->sender_id,
                            'created_at' => $conv->lastMessage->created_at,
                        ] : null,
                        'unread_count' => $conv->messages()->unread($user->id)->count(),
                        'updated_at' => $conv->updated_at,
                    ];
                })
                ->values();
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'roles' => $user->getRoleNames(),
                    'notifications' => $user->unreadNotifications()->take(5)->get()->toArray(),
                    'unread_count' => $user->unreadNotifications()->count(),
                ] : null,
            ],
            'conversations' => $conversations,
            'flash' => [
                'message' => fn () => $request->session()->get('message'),
                'error' => fn () => $request->session()->get('error'),
                'duplicates' => fn () => $request->session()->get('duplicates'),
                'draft_body' => fn () => $request->session()->get('draft_body'),
                'draft_cv_path' => fn () => $request->session()->get('draft_cv_path'),
                'draft_cv_name' => fn () => $request->session()->get('draft_cv_name'),
            ],
        ];
    }
}
