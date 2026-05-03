<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AlumniProfile extends Model
{
    // Pastikan semua kolom form ada di sini
    protected $fillable = [
        'user_id',
        'nim',
        'major',
        'graduation_year',
        'skills',
        'phone_number',
        'address'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
