<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpsertFarmerProfileRequest;
use App\Services\AuditLogService;
use App\Services\FarmerProfileService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FarmerProfileController extends BaseController
{
    public function __construct(
        private readonly FarmerProfileService $farmerProfileService,
        private readonly AuditLogService $auditLog,
    ) {
    }


    public function show(
        Request $request
    ): JsonResponse {
        $profile = $this->farmerProfileService
            ->getProfile(
                $request->user()
            );

        return $this->success(
            $profile,
            $profile
            ? 'Farmer profile retrieved successfully.'
            : 'Farmer profile has not been completed yet.'
        );
    }


    public function upsert(
        UpsertFarmerProfileRequest $request
    ): JsonResponse {
        $oldProfile = $this->farmerProfileService
            ->getProfile($request->user());
        $profile = $this->farmerProfileService
            ->upsertProfile(
                $request->user(),
                $request->validated()
            );
        $this->auditLog->record(
            $request->user(),
            'farmer_profile.updated',
            'farmer_profile',
            $profile->id,
            $oldProfile ? [
                'municipality_id' => $oldProfile->municipality_id,
                'barangay_id' => $oldProfile->barangay_id,
                'address' => $oldProfile->address,
            ] : null,
            [
                'municipality_id' => $profile->municipality_id,
                'barangay_id' => $profile->barangay_id,
                'address' => $profile->address,
            ],
            $request,
        );

        return $this->success(
            $profile,
            'Farmer profile saved successfully.'
        );
    }
}