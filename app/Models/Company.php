<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Company extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'name', 'industry', 'description', 'address', 'website', 'is_verified'];

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
