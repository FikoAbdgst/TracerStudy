<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AlumniProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'nim',
        'jenjang_pendidikan',
        'major',
        'tanggal_lahir',
        'graduation_year',
        'phone_number',
        'address',
        'detail_address',
        'experience',
        'skills',
        'cv_path',
        'photo_path',
        'is_open_to_work',
        'employment_status',
        'position',
        'company_name',
        'job_sector',
        'privacy_hide_phone',
        'privacy_hide_address',
        'privacy_allow_search',
        'judul_skripsi',
        'portofolio_proyek',
    ];

    protected $casts = [
        'skills' => 'array',
        'experience' => 'integer',
        'tanggal_lahir' => 'date',
        'is_open_to_work' => 'boolean',
        'privacy_hide_phone' => 'boolean',
        'privacy_hide_address' => 'boolean',
        'privacy_allow_search' => 'boolean',
        'portofolio_proyek' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function savedByCompanies()
    {
        return $this->belongsToMany(Company::class, 'company_saved_candidates', 'alumni_profile_id', 'company_id')
            ->withTimestamps();
    }
}
