<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

// app/Models/MouDocument.php
class MouDocument extends Model
{
    protected $fillable = ['company_id', 'document_path', 'expired_at', 'status'];
    protected $casts = ['expired_at' => 'date'];
}
