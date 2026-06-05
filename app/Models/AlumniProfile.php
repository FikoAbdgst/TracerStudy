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
    ];

    protected $casts = [
        'skills' => 'array',
        'experience' => 'integer',
        'tanggal_lahir' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
