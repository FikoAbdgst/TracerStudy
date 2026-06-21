<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    protected $fillable = [
        'conversation_id',
        'sender_id',
        'body',
        'attachment_url',
        'is_read',
        'deleted_by',
        'is_deleted_for_everyone',
    ];

    protected $casts = [
        'is_read' => 'boolean',
        'is_deleted_for_everyone' => 'boolean',
        'deleted_by' => 'array',
    ];

    public function conversation()
    {
        return $this->belongsTo(Conversation::class);
    }

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function scopeUnread($query, $userId)
    {
        return $query->where('sender_id', '!=', $userId)->where('is_read', false);
    }

    public function isDeletedForUser($userId): bool
    {
        if ($this->is_deleted_for_everyone) {
            return true;
        }

        if ($this->deleted_by && in_array((int) $userId, $this->deleted_by)) {
            return true;
        }

        return false;
    }

    public function scopeAfterCleared($query, $clearedAt)
    {
        if ($clearedAt) {
            return $query->where('created_at', '>', $clearedAt);
        }

        return $query;
    }
}
