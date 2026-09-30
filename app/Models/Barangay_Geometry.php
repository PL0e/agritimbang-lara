<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BarangayGeometry extends Model
{
    use HasUuids;

    protected $table = 'barangay_geometries';

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

    /**
     * Barangay associated with this GIS geometry.
     */
    public function barangay(): BelongsTo
    {
        return $this->belongsTo(Barangay::class);
    }
}