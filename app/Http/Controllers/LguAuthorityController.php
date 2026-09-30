<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreLguAuthorityRequest;
use App\Http\Requests\UpdateLguAuthorityRequest;
use App\Http\Requests\UpdateUserStatusRequest;
use App\Models\Municipality;
use App\Services\LguAccountService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LguAuthorityController extends BaseController
{
    public function __construct(
        private readonly LguAccountService $lguAccountService
    ) {
    }


    public function index(Request $request): JsonResponse
    {
        $authorities = $this->lguAccountService
            ->getAuthorities(
                $request->query('search'),
                $request->query('status'),
                $request->query('municipality_id')
            );

        return $this->success(
            $authorities,
            'LGU Authorities retrieved successfully.'
        );
    }


    public function store(
        StoreLguAuthorityRequest $request
    ): JsonResponse {
        $data = $request->validated();

        $municipality = Municipality::findOrFail(
            $data['municipality_id']
        );

        $authority = $this->lguAccountService
            ->createAuthority(
                $data,
                $municipality
            );

        return $this->success(
            $authority,
            'LGU Authority created successfully.',
            201
        );
    }


    public function show(
        string $authority
    ): JsonResponse {
        $authority = $this->lguAccountService
            ->getAuthority($authority);

        return $this->success(
            $authority,
            'LGU Authority retrieved successfully.'
        );
    }


    public function update(
        UpdateLguAuthorityRequest $request,
        string $authority
    ): JsonResponse {
        $authority = $this->lguAccountService
            ->getAuthority($authority);

        $authority = $this->lguAccountService
            ->updateAuthority(
                $authority,
                $request->validated()
            );

        return $this->success(
            $authority,
            'LGU Authority updated successfully.'
        );
    }


    public function updateStatus(
        UpdateUserStatusRequest $request,
        string $authority
    ): JsonResponse {
        $authority = $this->lguAccountService
            ->getAuthority($authority);

        $authority = $this->lguAccountService
            ->updateAuthorityStatus(
                $authority,
                $request->validated()['status']
            );

        return $this->success(
            $authority,
            'LGU Authority status updated successfully.'
        );
    }
}