<?php

namespace App\Services;

use App\Models\FarmerProfile;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class FarmerProfileService
{
    public function getProfile(User $user): ?FarmerProfile
    {
        return FarmerProfile::query()
            ->where('user_id', $user->id)
            ->with([
                'municipality',
                'barangay',
            ])
            ->first();
    }


    public function upsertProfile(
        User $user,
        array $data
    ): FarmerProfile {
        return DB::transaction(function () use ($user, $data) {
            $profile = FarmerProfile::updateOrCreate(
                [
                    'user_id' => $user->id,
                ],
                [
                    'municipality_id' =>
                        $data['municipality_id'],

                    'barangay_id' =>
                        $data['barangay_id'],

                    'address' =>
                        $data['address'] ?? null,
                ]
            );

            return $profile->load([
                'municipality',
                'barangay',
            ]);
        });
    }
}