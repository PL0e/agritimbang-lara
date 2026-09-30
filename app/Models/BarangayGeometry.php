<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BarangayGeometry extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'barangay_id',
        'geometry',
        'geometry_type',
        'source',
        'source_reference',
    ];

    protected function casts(): array
    {
        return [
            'geometry' => 'array',
        ];
    }

    public function barangay()
    {
        return $this->belongsTo(Barangay::class);
    }
}