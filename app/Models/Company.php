<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

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
        'website',
        'logo_url',
        'verification_status',
        'verified_at'
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
}
