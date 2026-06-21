<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JobApplication extends Model
{
    protected $fillable = ['job_posting_id', 'alumni_id', 'cv_path', 'status', 'notes', 'hr_notes', 'interview_details'];

    protected function casts(): array
    {
        return [
            'interview_details' => 'array',
        ];
    }

    public function jobPosting()
    {
        return $this->belongsTo(JobPosting::class);
    }

    public function alumni()
    {
        return $this->belongsTo(AlumniProfile::class, 'alumni_id');
    }

    public function lamaranConversation()
    {
        return $this->hasOne(Conversation::class, 'job_posting_id', 'job_posting_id');
    }
}
