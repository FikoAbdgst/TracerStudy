<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProgramStudi extends Model
{
    // Tambahkan baris ini untuk mengizinkan insert massal
    protected $fillable = ['name', 'jenjang'];
}
