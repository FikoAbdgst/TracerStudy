<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class AlumniProfile extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'nim', 'major', 'graduation_year', 'phone', 'address', 'bio'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function applications()
    {
        return $this->hasMany(JobApplication::class, 'alumni_id');
    }
}
