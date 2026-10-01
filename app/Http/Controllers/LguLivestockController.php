<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreLivestockRequest;
use App\Http\Requests\UpdateLivestockRequest;
use App\Models\FarmerProfile;
use App\Models\LivestockRecord;
use App\Services\LivestockService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LguLivestockController extends BaseController
{
    public function __construct(
        private readonly LivestockService $service
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $livestock =
            $this->service->getMunicipalityLivestock(
                $request->user(),
                $request->only([
                    'status',
                    'species_id',
                    'breed_id',
                    'farmer_id',
                ])
            );

        return $this->success($livestock);
    }

    public function store(
        StoreLivestockRequest $request,
        FarmerProfile $farmer
    ): JsonResponse {
        $livestock = $this->service->createForLgu(
            $request->user(),
            $farmer,
            $request->validated()
        );

        return $this->success(
            $livestock,
            'Livestock registered successfully.',
            201
        );
    }

    public function show(
        Request $request,
        LivestockRecord $livestock
    ): JsonResponse {
        $livestock =
            $this->service->getMunicipalityLivestockRecord(
                $request->user(),
                $livestock
            );

        return $this->success($livestock);
    }

    public function update(
        UpdateLivestockRequest $request,
        LivestockRecord $livestock
    ): JsonResponse {
        $livestock = $this->service->updateForLgu(
            $request->user(),
            $livestock,
            $request->validated()
        );

        return $this->success(
            $livestock,
            'Livestock updated successfully.'
        );
    }
}