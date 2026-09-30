<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Barangay extends Model
{
    use HasUuids;

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

    /**
     * Municipality this barangay belongs to.
     */
    public function municipality(): BelongsTo
    {
        return $this->belongsTo(Municipality::class);
    }

    /**
     * GIS geometry associated with this barangay.
     */
    public function geometry(): HasOne
    {
        return $this->hasOne(BarangayGeometry::class);
    }
}