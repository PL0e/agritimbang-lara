<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PriceValidationLog extends Model
{
    use HasUuids;

    protected $fillable = [
        'price_reference_id',
        'from_status',
        'to_status',
        'action',
        'remarks',
        'performed_by',
    ];

    /**
     * Price reference associated with this validation log.
     */
    public function priceReference(): BelongsTo
    {
        return $this->belongsTo(PriceReference::class);
    }

    /**
     * User who performed the validation action.
     */
    public function performer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'performed_by');
    }
}