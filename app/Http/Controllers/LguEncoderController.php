<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreLguEncoderRequest;
use App\Http\Requests\UpdateLguEncoderRequest;
use App\Http\Requests\UpdateUserStatusRequest;
use App\Services\LguAccountService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LguEncoderController extends BaseController
{
    public function __construct(
        private readonly LguAccountService $lguAccountService
    ) {
    }


    public function index(
        Request $request
    ): JsonResponse {
        $encoders = $this->lguAccountService
            ->getEncoders(
                $request->user(),
                $request->query('search'),
                $request->query('status')
            );

        return $this->success(
            $encoders,
            'LGU Encoders retrieved successfully.'
        );
    }


    public function store(
        StoreLguEncoderRequest $request
    ): JsonResponse {
        $encoder = $this->lguAccountService
            ->createEncoder(
                $request->validated(),
                $request->user()
            );

        return $this->success(
            $encoder,
            'LGU Encoder created successfully.',
            201
        );
    }


    public function show(
        Request $request,
        string $encoder
    ): JsonResponse {
        $encoder = $this->lguAccountService
            ->getEncoder(
                $request->user(),
                $encoder
            );

        return $this->success(
            $encoder,
            'LGU Encoder retrieved successfully.'
        );
    }


    public function update(
        UpdateLguEncoderRequest $request,
        string $encoder
    ): JsonResponse {
        $encoder = $this->lguAccountService
            ->updateEncoder(
                $request->user(),
                $encoder,
                $request->validated()
            );

        return $this->success(
            $encoder,
            'LGU Encoder updated successfully.'
        );
    }


    public function updateStatus(
        UpdateUserStatusRequest $request,
        string $encoder
    ): JsonResponse {
        $encoder = $this->lguAccountService
            ->updateEncoderStatus(
                $request->user(),
                $encoder,
                $request->validated()['status']
            );

        return $this->success(
            $encoder,
            'LGU Encoder status updated successfully.'
        );
    }
}