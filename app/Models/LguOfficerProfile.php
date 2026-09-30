<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LguOfficerProfile extends Model
{
    use HasUuids;

    protected $fillable = [
        'user_id',
        'municipality_id',
        'station',
        'designation',
    ];

    /**
     * User account associated with this LGU officer profile.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Municipality where this LGU officer is assigned.
     */
    public function municipality(): BelongsTo
    {
        return $this->belongsTo(Municipality::class);
    }
}