<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;

class AdminAuditLogController extends BaseController
{
    public function index(): JsonResponse
    {
        $logs = AuditLog::query()
            ->with('user:id,first_name,middle_name,last_name,email')
            ->latest()
            ->paginate(50)
            ->through(fn (AuditLog $log): array => [
                'id' => $log->id,
                'action' => $log->action,
                'entity_type' => $log->entity_type,
                'entity_id' => $log->entity_id,
                'old_values' => $log->old_values,
                'new_values' => $log->new_values,
                'ip_address' => $log->ip_address,
                'created_at' => $log->created_at,
                'user' => $log->user ? [
                    'name' => collect([
                        $log->user->first_name,
                        $log->user->middle_name,
                        $log->user->last_name,
                    ])->filter()->implode(' '),
                    'email' => $log->user->email,
                ] : null,
            ]);

        return $this->success(
            $logs,
            'Audit activity retrieved successfully.',
        );
    }
}
