<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JobApplication extends Model
{
    // Pastikan status dan notes masuk dalam fillable
    protected $fillable = ['job_posting_id', 'alumni_id', 'cv_path', 'status', 'notes'];

    public function jobPosting()
    {
        return $this->belongsTo(JobPosting::class);
    }
    public function alumni()
    {
        return $this->belongsTo(AlumniProfile::class, 'alumni_id');
    }
}
