<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpsertBarangayGeometryRequest;
use App\Services\BarangayService;
use Illuminate\Http\JsonResponse;

class BarangayGeometryController extends BaseController
{
    public function __construct(
        private readonly BarangayService $barangayService
    ) {
    }


    public function show(
        string $barangay
    ): JsonResponse {
        $barangay = $this->barangayService
            ->getBarangay($barangay);

        $geometry = $this->barangayService
            ->getGeometry($barangay);

        return $this->success(
            $geometry,
            $geometry
            ? 'Barangay geometry retrieved successfully.'
            : 'Barangay does not have geometry yet.'
        );
    }


    public function upsert(
        UpsertBarangayGeometryRequest $request,
        string $barangay
    ): JsonResponse {
        $barangay = $this->barangayService
            ->getBarangay($barangay);

        $geometry = $this->barangayService
            ->upsertGeometry(
                $barangay,
                $request->validated()
            );

        return $this->success(
            $geometry,
            'Barangay geometry saved successfully.'
        );
    }
}