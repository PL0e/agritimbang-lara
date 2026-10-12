<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\ChangeOwnPasswordRequest;
use App\Http\Requests\RegisterFarmerRequest;
use App\Http\Requests\UpdateOwnProfileRequest;
use App\Models\User;
use App\Services\AuditLogService;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Laravel\Sanctum\PersonalAccessToken;

class AuthController extends BaseController
{
    public function __construct(
        private readonly AuthService $authService,
        private readonly AuditLogService $auditLog,
    ) {
    }

    public function registerFarmer(
        RegisterFarmerRequest $request
    ): JsonResponse {
        $result = $this->authService->registerFarmer(
            $request->validated()
        );
        $this->auditLog->record(
            $result['user'],
            'account.registered',
            'user',
            $result['user']->id,
            newValues: [
                'email' => $result['user']->email,
                'role' => 'farmer',
            ],
            request: $request,
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
        try {
            $result = $this->authService->login(
                $request->validated()
            );
        } catch (ValidationException $exception) {
            $attemptedUser = User::where(
                'email',
                strtolower(trim($request->validated()['email'])),
            )->first();
            $this->auditLog->record(
                $attemptedUser,
                'auth.login_failed',
                'authentication',
                $attemptedUser?->id,
                newValues: ['result' => 'denied'],
                request: $request,
            );

            throw $exception;
        }

        $this->auditLog->record(
            $result['user'],
            'auth.login',
            'user',
            $result['user']->id,
            request: $request,
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
        $this->auditLog->record(
            $request->user(),
            'auth.logout',
            'user',
            $request->user()->id,
            request: $request,
        );

        $this->authService->logout(
            $request->user()
        );

        return $this->success(
            null,
            'Logout successful.'
        );
    }

    public function updateProfile(
        UpdateOwnProfileRequest $request
    ): JsonResponse {
        $user = $request->user();
        $data = $request->validated();
        $isStaff = $user->roles()
            ->whereIn('slug', ['admin', 'lgu_authority', 'lgu_encoder'])
            ->exists();

        if (!$isStaff && (array_key_exists('station', $data) || array_key_exists('designation', $data))) {
            abort(403, 'Only staff accounts have station and designation fields.');
        }

        $oldValues = [];
        foreach ($data as $field => $value) {
            if (in_array($field, ['station', 'designation'], true)) {
                $oldValues[$field] = $user->lguOfficerProfile?->{$field};
            } else {
                $oldValues[$field] = $user->{$field};
            }
        }

        $user->fill(collect($data)->except(['station', 'designation'])->all());
        $user->save();

        if ($isStaff && $user->lguOfficerProfile) {
            $user->lguOfficerProfile->fill(
                collect($data)->only(['station', 'designation'])->all()
            )->save();
        }

        $this->auditLog->record(
            $user,
            'account.profile_updated',
            'user',
            $user->id,
            $oldValues,
            $data,
            $request,
        );

        return $this->success(
            $user->fresh()->load(['roles', 'farmerProfile', 'lguOfficerProfile']),
            'Profile updated successfully.',
        );
    }

    public function changePassword(
        ChangeOwnPasswordRequest $request
    ): JsonResponse {
        $user = $request->user();
        $data = $request->validated();
        if (!Hash::check($data['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['The current password is incorrect.'],
            ]);
        }

        $user->forceFill([
            'password' => Hash::make($data['password']),
        ])->save();

        $currentToken = $user->currentAccessToken();
        $tokens = $user->tokens();
        if ($currentToken instanceof PersonalAccessToken) {
            $tokens->where('id', '!=', $currentToken->getKey());
        }
        $tokens->delete();

        $this->auditLog->record(
            $user,
            'password.changed',
            'user',
            $user->id,
            request: $request,
        );

        return $this->success(
            null,
            'Password changed successfully. Other sessions have been signed out.',
        );
    }
}