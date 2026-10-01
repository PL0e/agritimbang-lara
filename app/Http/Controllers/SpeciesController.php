<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSpeciesRequest;
use App\Http\Requests\UpdateReferenceStatusRequest;
use App\Http\Requests\UpdateSpeciesRequest;
use App\Models\Species;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SpeciesController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        $species = Species::query()
            ->when(
                $request->filled('search'),
                function ($query) use ($request) {
                    $search = $request->string('search');

                    $query->where(function ($query) use ($search) {
                        $query
                            ->where('name', 'like', "%{$search}%")
                            ->orWhere('code', 'like', "%{$search}%");
                    });
                }
            )
            ->withCount('breeds')
            ->orderBy('name')
            ->paginate(20);

        return $this->success(
            $species,
            'Species retrieved successfully.'
        );
    }

    public function store(
        StoreSpeciesRequest $request
    ): JsonResponse {
        $species = Species::create(
            $request->validated()
        );

        return $this->success(
            $species,
            'Species created successfully.',
            201
        );
    }

    public function show(
        Species $species
    ): JsonResponse {
        $species->load([
            'breeds' => fn($query) =>
                $query->orderBy('name'),
        ]);

        return $this->success(
            $species,
            'Species retrieved successfully.'
        );
    }

    public function update(
        UpdateSpeciesRequest $request,
        Species $species
    ): JsonResponse {
        $species->update(
            $request->validated()
        );

        return $this->success(
            $species->fresh(),
            'Species updated successfully.'
        );
    }

    public function updateStatus(
        UpdateReferenceStatusRequest $request,
        Species $species
    ): JsonResponse {
        $species->update([
            'is_active' =>
                $request->validated()['is_active'],
        ]);

        return $this->success(
            $species->fresh(),
            'Species status updated successfully.'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Reference Data
    |--------------------------------------------------------------------------
    */

    public function referenceIndex(): JsonResponse
    {
        $species = Species::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get([
                'id',
                'name',
                'code',
            ]);

        return $this->success(
            $species,
            'Active species retrieved successfully.'
        );
    }
}