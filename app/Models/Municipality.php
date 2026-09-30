<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Municipality extends Model
{
    use HasUuids;

    protected $fillable = [
        'name',
        'province',
        'psgc_code',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function barangays(): HasMany
    {
        return $this->hasMany(Barangay::class);
    }

    public function farmerProfiles(): HasMany
    {
        return $this->hasMany(FarmerProfile::class);
    }

    public function lguOfficerProfiles(): HasMany
    {
        return $this->hasMany(LguOfficerProfile::class);
    }
}