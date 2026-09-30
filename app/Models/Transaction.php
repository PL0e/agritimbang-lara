<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Transaction extends Model
{
    use HasUuids;

    protected $fillable = [
        'farmer_id',
        'buyer_name',
        'buyer_phone',
        'municipality_id',
        'barangay_id',
        'transaction_date',
        'status',
        'total_reference_value',
        'total_selling_price',
        'encoded_by',
        'verified_by',
        'verified_at',
        'remarks',
    ];

    protected function casts(): array
    {
        return [
            'transaction_date' => 'datetime',
            'verified_at' => 'datetime',
            'total_reference_value' => 'decimal:2',
            'total_selling_price' => 'decimal:2',
        ];
    }

    /**
     * Farmer/seller associated with the transaction.
     */
    public function farmer(): BelongsTo
    {
        return $this->belongsTo(FarmerProfile::class, 'farmer_id');
    }

    /**
     * Municipality where the transaction occurred.
     */
    public function municipality(): BelongsTo
    {
        return $this->belongsTo(Municipality::class);
    }

    /**
     * Barangay where the transaction occurred.
     */
    public function barangay(): BelongsTo
    {
        return $this->belongsTo(Barangay::class);
    }

    /**
     * User who encoded the transaction.
     */
    public function encoder(): BelongsTo
    {
        return $this->belongsTo(User::class, 'encoded_by');
    }

    /**
     * User who verified the transaction.
     */
    public function verifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    /**
     * Individual livestock items included in the transaction.
     */
    public function items(): HasMany
    {
        return $this->hasMany(TransactionItem::class);
    }
}