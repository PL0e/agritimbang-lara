<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TransactionItem extends Model
{
    use HasUuids;

    protected $fillable = [
        'transaction_id',
        'livestock_id',
        'valuation_id',
        'weight_used_kg',
        'price_per_kg_used',
        'reference_value',
        'actual_selling_price',
        'price_difference',
        'percentage_deviation',
    ];

    protected function casts(): array
    {
        return [
            'weight_used_kg' => 'decimal:2',
            'price_per_kg_used' => 'decimal:2',
            'reference_value' => 'decimal:2',
            'actual_selling_price' => 'decimal:2',
            'price_difference' => 'decimal:2',
            'percentage_deviation' => 'decimal:2',
        ];
    }

    /**
     * Transaction this item belongs to.
     */
    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class);
    }

    /**
     * Livestock included in this transaction.
     */
    public function livestock(): BelongsTo
    {
        return $this->belongsTo(LivestockRecord::class, 'livestock_id');
    }

    /**
     * Valuation used as the reference for this transaction item.
     */
    public function valuation(): BelongsTo
    {
        return $this->belongsTo(Valuation::class);
    }
}