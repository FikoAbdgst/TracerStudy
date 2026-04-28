<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TracerStudyResponse extends Model
{
    protected $fillable = ['form_id', 'alumni_id', 'answers'];

    protected $casts = [
        'answers' => 'array', // Memudahkan manipulasi data kuesioner JSON
    ];

    public function alumni()
    {
        return $this->belongsTo(AlumniProfile::class, 'alumni_id');
    }
}
