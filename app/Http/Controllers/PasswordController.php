<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\AuditLogService;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class PasswordController extends BaseController
{
    public function __construct(
        private readonly AuditLogService $auditLog,
    ) {
    }

    public function sendResetLink(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email', 'max:255'],
        ]);
        $data['email'] = strtolower(trim($data['email']));

        $status = Password::sendResetLink($data);

        if ($status === Password::RESET_LINK_SENT) {
            $user = User::where('email', $data['email'])->first();
            $this->auditLog->record(
                $user,
                'password.reset_link_sent',
                'user',
                $user?->id,
                request: $request,
            );
        } elseif ($status !== Password::RESET_THROTTLED) {
            $this->auditLog->record(
                null,
                'password.reset_link_requested',
                'password_reset',
                newValues: ['result' => 'not_sent'],
                request: $request,
            );
        }

        return $this->success(
            null,
            'If an account exists for that email address, a password reset link has been sent.',
        );
    }

    public function reset(Request $request): JsonResponse
    {
        $data = $request->validate([
            'token' => ['required', 'string'],
            'email' => ['required', 'email', 'max:255'],
            'password' => ['required', 'confirmed', 'min:8'],
        ]);
        $data['email'] = strtolower(trim($data['email']));

        $status = Password::reset(
            $data,
            function (User $user, string $password): void {
                $user->forceFill([
                    'password' => $password,
                    'remember_token' => Str::random(60),
                ])->save();

                $user->tokens()->delete();

                event(new PasswordReset($user));
            },
        );

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages([
                'email' => [__($status)],
            ]);
        }

        $user = User::where('email', $data['email'])->firstOrFail();
        $this->auditLog->record(
            $user,
            'password.reset',
            'user',
            $user->id,
            request: $request,
        );

        return $this->success(null, 'Your password has been reset. Sign in with your new password.');
    }
}
