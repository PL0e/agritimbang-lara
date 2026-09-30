<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WeightEstimation extends Model
{
    use HasUuids;

    protected $fillable = [
        'livestock_id',
        'chest_girth_cm',
        'body_length_cm',
        'body_frame',
        'estimated_weight_kg',
        'formula_version',
        'calculated_by',
    ];

    protected function casts(): array
    {
        return [
            'chest_girth_cm' => 'decimal:2',
            'body_length_cm' => 'decimal:2',
            'estimated_weight_kg' => 'decimal:2',
        ];
    }

    /**
     * Livestock associated with this weight estimation.
     */
    public function livestock(): BelongsTo
    {
        return $this->belongsTo(LivestockRecord::class, 'livestock_id');
    }

    /**
     * User who calculated the weight estimation.
     */
    public function calculator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'calculated_by');
    }
}