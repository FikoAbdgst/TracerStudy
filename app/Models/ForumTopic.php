<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


// app/Models/ForumTopic.php
class ForumTopic extends Model
{
    protected $fillable = ['user_id', 'title', 'content'];
    public function replies()
    {
        return $this->hasMany(ForumReply::class);
    }
}
