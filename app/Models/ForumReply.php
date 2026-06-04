<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class ForumReply extends Model
{
    protected $fillable = ['forum_topic_id', 'user_id', 'content', 'attachment', 'parent_id'];

    protected $appends = ['attachment_urls'];

    protected $casts = [
        'attachment' => 'array',
    ];

    public function getAttachmentUrlsAttribute(): array
    {
        if (!$this->attachment || !is_array($this->attachment)) return [];
        return array_map(fn($path) => Storage::url($path), $this->attachment);
    }

    protected static function booted()
    {
        static::created(function ($reply) {
            $reply->topic->update(['last_reply_at' => now()]);
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function topic()
    {
        return $this->belongsTo(ForumTopic::class, 'forum_topic_id');
    }

    public function parent()
    {
        return $this->belongsTo(ForumReply::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(ForumReply::class, 'parent_id');
    }
}
