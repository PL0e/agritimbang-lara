<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreLguAuthorityRequest;
use App\Http\Requests\UpdateLguAuthorityRequest;
use App\Http\Requests\UpdateUserStatusRequest;
use App\Models\Municipality;
use App\Services\AuditLogService;
use App\Services\LguAccountService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LguAuthorityController extends BaseController
{
    public function __construct(
        private readonly LguAccountService $lguAccountService,
        private readonly AuditLogService $auditLog,
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
        $this->auditLog->record(
            $request->user(),
            'account.created',
            'user',
            $authority->id,
            newValues: [
                'email' => $authority->email,
                'role' => 'lgu_authority',
                'municipality_id' => $municipality->id,
            ],
            request: $request,
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

        $oldValues = $request->validated();
        unset($oldValues['password']);
        foreach ($oldValues as $field => $value) {
            $oldValues[$field] = $field === 'municipality_id'
                ? $authority->lguOfficerProfile?->municipality_id
                : $authority->{$field} ?? $authority->lguOfficerProfile?->{$field};
        }
        $authority = $this->lguAccountService
            ->updateAuthority(
                $authority,
                $request->validated()
            );
        $newValues = $request->validated();
        unset($newValues['password']);
        $this->auditLog->record(
            $request->user(),
            'account.updated',
            'user',
            $authority->id,
            $oldValues,
            $newValues,
            $request,
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

        abort_if(
            $authority->is($request->user()),
            422,
            'You cannot deactivate your own account.',
        );
        $oldStatus = $authority->status;
        $newStatus = $request->validated()['status'];
        $authority = $this->lguAccountService
            ->updateAuthorityStatus(
                $authority,
                $newStatus
            );
        $this->auditLog->record(
            $request->user(),
            'account.status_changed',
            'user',
            $authority->id,
            ['status' => $oldStatus],
            ['status' => $newStatus, 'role' => 'lgu_authority'],
            $request,
        );

        return $this->success(
            $authority,
            'LGU Authority status updated successfully.'
        );
    }
}