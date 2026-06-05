<?php

namespace App\Policies;

use App\Models\ForumReply;
use App\Models\User;

class ForumReplyPolicy
{
    public function update(User $user, ForumReply $forumReply): bool
    {
        return $user->id === $forumReply->user_id
            || $user->hasAnyRole(['Super Admin', 'Admin Kampus']);
    }

    public function delete(User $user, ForumReply $forumReply): bool
    {
        return $user->id === $forumReply->user_id
            || $user->hasAnyRole(['Super Admin', 'Admin Kampus']);
    }
}
