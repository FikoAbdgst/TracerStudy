<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TracerStudyForm extends Model
{
    protected $fillable = ['title', 'description', 'questions', 'is_active', 'period_start', 'period_end'];

    protected $casts = [
        'questions' => 'array', // Ini krusial agar otomatis jadi JSON Object
        'is_active' => 'boolean',
    ];
}
