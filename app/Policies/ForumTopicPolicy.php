<?php

namespace App\Policies;

use App\Models\ForumTopic;
use App\Models\User;

class ForumTopicPolicy
{
    public function update(User $user, ForumTopic $forumTopic): bool
    {
        return $user->id === $forumTopic->user_id
            || $user->hasAnyRole(['Super Admin', 'Admin Kampus']);
    }

    public function delete(User $user, ForumTopic $forumTopic): bool
    {
        return $user->id === $forumTopic->user_id
            || $user->hasAnyRole(['Super Admin', 'Admin Kampus']);
    }
}
