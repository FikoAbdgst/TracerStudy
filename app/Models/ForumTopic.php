<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class ForumTopic extends Model
{
    protected $fillable = ['user_id', 'title', 'slug', 'content', 'last_reply_at', 'attachment'];

    protected $appends = ['attachment_url'];

    protected $casts = [
        'last_reply_at' => 'datetime',
    ];

    public function getAttachmentUrlAttribute()
    {
        return $this->attachment ? Storage::url('forum_attachments/' . $this->attachment) : null;
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
