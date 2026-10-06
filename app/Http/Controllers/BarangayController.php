<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBarangayRequest;
use App\Http\Requests\UpdateBarangayRequest;
use App\Http\Requests\UpdateBarangayStatusRequest;
use App\Models\Municipality;
use App\Services\BarangayService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BarangayController extends BaseController
{
    public function __construct(
        private readonly BarangayService $barangayService
    ) {
    }


    public function index(
        Request $request
    ): JsonResponse {
        $isActive = null;

        if ($request->has('is_active')) {
            $isActive = $request->boolean(
                'is_active'
            );
        }

        $barangays = $this->barangayService
            ->getBarangays(
                $request->query('search'),
                $request->query('municipality_id'),
                $isActive
            );

        return $this->success(
            $barangays,
            'Barangays retrieved successfully.'
        );
    }


    public function referenceByMunicipality(
        string $municipality
    ): JsonResponse {
        $municipality = Municipality::query()
            ->where('is_active', true)
            ->findOrFail($municipality);

        $barangays = $municipality
            ->barangays()
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return $this->success(
            $barangays,
            'Active Barangays retrieved successfully.'
        );
    }


    public function indexByMunicipality(
        string $municipality
    ): JsonResponse {
        $municipality = Municipality::findOrFail(
            $municipality
        );

        $barangays = $this->barangayService
            ->getMunicipalityBarangays(
                $municipality
            );

        return $this->success(
            $barangays,
            'Municipality Barangays retrieved successfully.'
        );
    }


    public function store(
        StoreBarangayRequest $request
    ): JsonResponse {
        $barangay = $this->barangayService
            ->createBarangay(
                $request->validated()
            );

        return $this->success(
            $barangay,
            'Barangay created successfully.',
            201
        );
    }


    public function show(
        string $barangay
    ): JsonResponse {
        $barangay = $this->barangayService
            ->getBarangay($barangay);

        return $this->success(
            $barangay,
            'Barangay retrieved successfully.'
        );
    }


    public function update(
        UpdateBarangayRequest $request,
        string $barangay
    ): JsonResponse {
        $barangay = $this->barangayService
            ->getBarangay($barangay);

        $barangay = $this->barangayService
            ->updateBarangay(
                $barangay,
                $request->validated()
            );

        return $this->success(
            $barangay,
            'Barangay updated successfully.'
        );
    }


    public function updateStatus(
        UpdateBarangayStatusRequest $request,
        string $barangay
    ): JsonResponse {
        $barangay = $this->barangayService
            ->getBarangay($barangay);

        $barangay = $this->barangayService
            ->updateStatus(
                $barangay,
                $request->validated()['is_active']
            );

        return $this->success(
            $barangay,
            'Barangay status updated successfully.'
        );
    }
}