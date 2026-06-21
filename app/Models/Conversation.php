<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Conversation extends Model
{
    const TYPE_ALUMNI = 'alumni';

    const TYPE_COMPANY = 'company';

    const TYPE_ADMIN = 'admin';

    const STATUS_OPEN = 'open';

    const STATUS_CLOSED = 'closed';

    protected $fillable = [
        'type',
        'status',
        'job_posting_id',
        'alumni_msg_count',
        'hr_replied',
    ];

    protected $casts = [
        'status' => 'string',
        'hr_replied' => 'boolean',
        'alumni_msg_count' => 'integer',
    ];

    public function participants()
    {
        return $this->hasMany(ConversationParticipant::class);
    }

    public function messages()
    {
        return $this->hasMany(Message::class);
    }

    public function lastMessage()
    {
        return $this->hasOne(Message::class)->latestOfMany();
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'conversation_participants')
            ->withTimestamps();
    }

    public function otherUser($currentUserId)
    {
        return $this->users()->where('user_id', '!=', $currentUserId)->first();
    }

    public function jobPosting()
    {
        return $this->belongsTo(JobPosting::class);
    }

    public function scopeStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeForUser($query, $userId)
    {
        return $query->whereHas('participants', fn ($q) => $q->where('user_id', $userId));
    }

    public function scopeType($query, $type)
    {
        return $query->where('type', $type);
    }
}
