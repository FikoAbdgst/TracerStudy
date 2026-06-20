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
        'company_name',
    ];

    protected $casts = [
        'skills' => 'array',
        'experience' => 'integer',
        'tanggal_lahir' => 'date',
        'is_open_to_work' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
