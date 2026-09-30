<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Valuation extends Model
{
    use HasUuids;

    protected $fillable = [
        'livestock_id',
        'price_reference_id',
        'weight_estimation_id',
        'weight_type',
        'weight_used_kg',
        'price_per_kg_used',
        'estimated_value',
        'calculated_by',
    ];

    protected function casts(): array
    {
        return [
            'weight_used_kg' => 'decimal:2',
            'price_per_kg_used' => 'decimal:2',
            'estimated_value' => 'decimal:2',
        ];
    }

    /**
     * Livestock being valued.
     */
    public function livestock(): BelongsTo
    {
        return $this->belongsTo(LivestockRecord::class, 'livestock_id');
    }

    /**
     * Official price reference used for this valuation.
     */
    public function priceReference(): BelongsTo
    {
        return $this->belongsTo(PriceReference::class);
    }

    /**
     * Weight estimation used when the valuation
     * was based on estimated weight.
     */
    public function weightEstimation(): BelongsTo
    {
        return $this->belongsTo(WeightEstimation::class);
    }

    /**
     * User who calculated the valuation.
     */
    public function calculator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'calculated_by');
    }
}