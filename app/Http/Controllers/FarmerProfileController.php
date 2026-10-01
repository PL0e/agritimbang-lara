<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpsertFarmerProfileRequest;
use App\Services\FarmerProfileService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FarmerProfileController extends BaseController
{
    public function __construct(
        private readonly FarmerProfileService $farmerProfileService
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
        $profile = $this->farmerProfileService
            ->upsertProfile(
                $request->user(),
                $request->validated()
            );

        return $this->success(
            $profile,
            'Farmer profile saved successfully.'
        );
    }
}