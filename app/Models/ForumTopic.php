<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ForumTopic extends Model
{
    protected $fillable = ['user_id', 'title', 'content'];

    // Relasi ke pembuat topik
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Relasi ke balasan
    public function replies()
    {
        return $this->hasMany(ForumReply::class);
    }
}
