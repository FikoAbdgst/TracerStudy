<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
    use HasFactory;

    // Sesuaikan dengan kolom yang ada di file migrasi kamu
    protected $fillable = [
        'user_id',
        'name',
        'industry',
        'description',
        'address',
        'province',
        'city',
        'latitude',
        'longitude',
        'website',
        'logo_url',
        'verification_status',
        'verified_at',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function jobPostings()
    {
        return $this->hasMany(JobPosting::class);
    }

    public function mouDocuments()
    {
        return $this->hasMany(MouDocument::class);
    }

    public function savedCandidates()
    {
        return $this->belongsToMany(AlumniProfile::class, 'company_saved_candidates', 'company_id', 'alumni_profile_id')
            ->withTimestamps();
    }
}
