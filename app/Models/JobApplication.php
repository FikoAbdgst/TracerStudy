<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JobApplication extends Model
{
    protected $fillable = [
        'job_posting_id',
        'alumni_id',
        'cv_path',
        'status',
        'notes',
        'hr_notes',
        'interview_details',
        'source_type',
        'invitation_status',
    ];

    const SOURCE_MANUAL = 'manual';

    const SOURCE_INVITATION = 'invitation';

    const INVITE_NONE = 'none';

    const INVITE_PENDING = 'pending';

    const INVITE_ACCEPTED = 'accepted';

    const INVITE_REJECTED = 'rejected';

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
        return $this->hasOne(Conversation::class, 'job_application_id');
    }

    public function scopeMenunggu($query)
    {
        return $query->where('status', 'menunggu');
    }
}
