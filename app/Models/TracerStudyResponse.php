<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TracerStudyResponse extends Model
{
    protected $fillable = [
        'tracer_study_form_id',
        'alumni_id',
        'answers',
        'status_pekerjaan',
        'nama_perusahaan',
        'kesesuaian_bidang',
    ];

    protected $casts = [
        'answers' => 'array',
    ];

    public function form()
    {
        return $this->belongsTo(TracerStudyForm::class, 'tracer_study_form_id');
    }

    public function alumni()
    {
        return $this->belongsTo(AlumniProfile::class, 'alumni_id');
    }
}
