<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MasterCategory extends Model
{
    protected $fillable = ['name', 'slug', 'use_parameter', 'parameter_label'];
    protected $casts = ['use_parameter' => 'boolean'];

    public function items()
    {
        return $this->hasMany(MasterItem::class);
    }
}
