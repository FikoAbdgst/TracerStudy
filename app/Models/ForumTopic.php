<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class ForumTopic extends Model
{
    protected $fillable = ['user_id', 'title', 'slug', 'content', 'last_reply_at', 'attachment', 'is_announcement'];

    protected $appends = ['attachment_urls'];

    protected $casts = [
        'last_reply_at' => 'datetime',
        'attachment' => 'array',
        'is_announcement' => 'boolean',
    ];

    public function getAttachmentUrlsAttribute(): array
    {
        if (!$this->attachment || !is_array($this->attachment)) return [];
        return array_map(fn($path) => Storage::url($path), $this->attachment);
    }

    protected static function booted()
    {
        static::creating(function ($topic) {
            $topic->slug = $topic->slug ?: Str::slug($topic->title);
            $topic->last_reply_at = $topic->last_reply_at ?: now();
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function replies()
    {
        return $this->hasMany(ForumReply::class);
    }
}
