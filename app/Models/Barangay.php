<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Barangay extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'municipality_id',
        'name',
        'psgc_code',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function municipality()
    {
        return $this->belongsTo(Municipality::class);
    }

    public function geometry()
    {
        return $this->hasOne(BarangayGeometry::class);
    }
}