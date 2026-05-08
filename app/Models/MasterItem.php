<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MasterItem extends Model
{
    protected $fillable = ['master_category_id', 'name', 'parameter_value', 'is_active'];

    public function category()
    {
        return $this->belongsTo(MasterCategory::class, 'master_category_id');
    }
}
