<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JobPosting extends Model
{
    use HasFactory;

    protected $guarded = [];

    // File: app/Models/JobPosting.php

    protected $fillable = [
        'company_id',
        'title',
        'description',
        'requirements',
        'location',
        'province',
        'city',
        'latitude',
        'longitude',
        'salary_range',
        'is_active',
        'min_education',
        'min_experience',
        'max_age',
        'work_model',
        'weight_skill',
        'weight_education',
        'weight_experience',
        'weight_age',
    ];

    // Cast is_active menjadi boolean agar mudah dibaca di React

    // TAMBAHKAN INI:
    protected $casts = [
        'is_active' => 'boolean',
        'requirements' => 'array', // Ubah menjadi array
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function applications()
    {
        return $this->hasMany(JobApplication::class);
    }
}
