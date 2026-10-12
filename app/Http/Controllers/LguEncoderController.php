<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreLguEncoderRequest;
use App\Http\Requests\UpdateLguEncoderRequest;
use App\Http\Requests\UpdateUserStatusRequest;
use App\Services\AuditLogService;
use App\Services\LguAccountService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LguEncoderController extends BaseController
{
    public function __construct(
        private readonly LguAccountService $lguAccountService,
        private readonly AuditLogService $auditLog,
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
        $this->auditLog->record(
            $request->user(),
            'account.created',
            'user',
            $encoder->id,
            newValues: [
                'email' => $encoder->email,
                'role' => 'lgu_encoder',
                'municipality_id' => $encoder->lguOfficerProfile?->municipality_id,
            ],
            request: $request,
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
        $existingEncoder = $this->lguAccountService
            ->getEncoder($request->user(), $encoder);
        $oldValues = $request->validated();
        unset($oldValues['password']);
        foreach ($oldValues as $field => $value) {
            $oldValues[$field] = $existingEncoder->{$field}
                ?? $existingEncoder->lguOfficerProfile?->{$field};
        }
        $encoder = $this->lguAccountService
            ->updateEncoder(
                $request->user(),
                $encoder,
                $request->validated()
            );
        $newValues = $request->validated();
        unset($newValues['password']);
        $this->auditLog->record(
            $request->user(),
            'account.updated',
            'user',
            $encoder->id,
            $oldValues,
            $newValues,
            $request,
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
        $existingEncoder = $this->lguAccountService
            ->getEncoder($request->user(), $encoder);
        $oldStatus = $existingEncoder->status;
        $newStatus = $request->validated()['status'];
        $encoder = $this->lguAccountService
            ->updateEncoderStatus(
                $request->user(),
                $encoder,
                $newStatus
            );
        $this->auditLog->record(
            $request->user(),
            'account.status_changed',
            'user',
            $encoder->id,
            ['status' => $oldStatus],
            ['status' => $newStatus, 'role' => 'lgu_encoder'],
            $request,
        );

        return $this->success(
            $encoder,
            'LGU Encoder status updated successfully.'
        );
    }
}