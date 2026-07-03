<?php

namespace App\Policies;

use App\Models\Message;
use App\Models\User;

class MessagePolicy
{
    public function deleteForEveryone(User $user, Message $message): bool
    {
        return (int) $message->sender_id === $user->id
            && $message->created_at->diffInHours(now()) <= 48;
    }
}
