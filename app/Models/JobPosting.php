<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class JobPosting extends Model
{
    use HasFactory;
    protected $guarded = [];


    // Pastikan semua kolom ini ada di fillable
    protected $fillable = [
        'company_id',
        'title',
        'description',
        'requirements',
        'location',
        'salary_range',
        'is_active'
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
