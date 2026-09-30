<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterFarmerRequest;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends BaseController
{
    public function __construct(
        private readonly AuthService $authService
    ) {
    }

    public function registerFarmer(
        RegisterFarmerRequest $request
    ): JsonResponse {
        $result = $this->authService->registerFarmer(
            $request->validated()
        );

        return $this->success(
            $result,
            'Farmer registration successful.',
            201
        );
    }

    public function login(
        LoginRequest $request
    ): JsonResponse {
        $result = $this->authService->login(
            $request->validated()
        );

        return $this->success(
            $result,
            'Login successful.'
        );
    }

    public function me(Request $request): JsonResponse
    {
        return $this->success(
            $request->user()->load([
                'roles',
                'farmerProfile',
                'lguOfficerProfile',
            ]),
            'Authenticated user retrieved successfully.'
        );
    }

    public function logout(Request $request): JsonResponse
    {
        $this->authService->logout(
            $request->user()
        );

        return $this->success(
            null,
            'Logout successful.'
        );
    }
}