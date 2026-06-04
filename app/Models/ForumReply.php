<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class ForumReply extends Model
{
    protected $fillable = ['forum_topic_id', 'user_id', 'content', 'attachment'];

    protected $appends = ['attachment_url'];

    public function getAttachmentUrlAttribute()
    {
        return $this->attachment ? Storage::url('forum_attachments/' . $this->attachment) : null;
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
}
