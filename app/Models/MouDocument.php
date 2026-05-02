<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MouDocument extends Model
{
    protected $fillable = [
        'company_id',
        'file_url',
        'status',
        'signed_at',
        'expires_at'
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}
