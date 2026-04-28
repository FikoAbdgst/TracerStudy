<?php

namespace App\Models;


use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

// app/Models/JobPosting.php
class JobPosting extends Model
{
    protected $fillable = ['company_id', 'title', 'description', 'requirements', 'location', 'salary_range', 'is_active'];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }
    public function applications()
    {
        return $this->hasMany(JobApplication::class);
    }
}
