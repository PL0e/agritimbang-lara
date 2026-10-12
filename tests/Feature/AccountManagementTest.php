<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\LguOfficerProfile;
use App\Models\Municipality;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Illuminate\Auth\Notifications\ResetPassword;
use Tests\TestCase;

class AccountManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_admin_can_deactivate_farmer_and_revoke_sessions(): void
    {
        $admin = $this->createUser('admin', 'admin@example.test');
        $farmer = $this->createUser('farmer', 'farmer@example.test');
        $farmer->createToken('test');

        $this->actingAs($admin)
            ->patchJson("/api/admin/farmers/{$farmer->id}/status", [
                'status' => 'inactive',
            ])
            ->assertOk()
            ->assertJsonPath('data.status', 'inactive');

        $this->assertDatabaseMissing('personal_access_tokens', [
            'tokenable_id' => $farmer->id,
        ]);

        $this->postJson('/api/auth/login', [
            'email' => $farmer->email,
            'password' => 'secure-password',
        ])->assertUnprocessable();

        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $admin->id,
            'action' => 'account.status_changed',
            'entity_id' => $farmer->id,
        ]);
    }

    public function test_authenticated_user_can_change_password_and_update_own_profile(): void
    {
        $farmer = $this->createUser('farmer', 'farmer@example.test');

        $this->actingAs($farmer)
            ->patchJson('/api/auth/profile', [
                'first_name' => 'Updated',
                'email' => 'updated@example.test',
                'phone_number' => '09123456789',
            ])
            ->assertOk()
            ->assertJsonPath('data.first_name', 'Updated')
            ->assertJsonPath('data.email', 'updated@example.test');

        $this->actingAs($farmer)
            ->patchJson('/api/auth/password', [
                'current_password' => 'incorrect-password',
                'password' => 'new-secure-password',
                'password_confirmation' => 'new-secure-password',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('current_password');

        $this->actingAs($farmer)
            ->patchJson('/api/auth/password', [
                'current_password' => 'secure-password',
                'password' => 'new-secure-password',
                'password_confirmation' => 'new-secure-password',
            ])
            ->assertOk();

        $this->assertTrue(
            Hash::check('new-secure-password', $farmer->fresh()->password),
        );
        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $farmer->id,
            'action' => 'account.profile_updated',
        ]);
        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $farmer->id,
            'action' => 'password.changed',
        ]);
    }

    public function test_staff_can_update_contact_details_without_changing_role_or_municipality(): void
    {
        $municipality = Municipality::create([
            'name' => 'Barili',
            'province' => 'Cebu',
            'is_active' => true,
        ]);
        $authority = $this->createUser('lgu_authority', 'authority@example.test');
        LguOfficerProfile::create([
            'user_id' => $authority->id,
            'municipality_id' => $municipality->id,
            'station' => 'Old station',
        ]);

        $this->actingAs($authority)
            ->patchJson('/api/auth/profile', [
                'first_name' => 'Updated',
                'email' => 'updated-authority@example.test',
                'station' => 'New station',
            ])
            ->assertOk()
            ->assertJsonPath('data.first_name', 'Updated')
            ->assertJsonPath('data.lgu_officer_profile.station', 'New station')
            ->assertJsonPath(
                'data.lgu_officer_profile.municipality_id',
                $municipality->id,
            );

        $this->assertSame(
            'lgu_authority',
            $authority->fresh()->roles()->firstOrFail()->slug,
        );
    }

    public function test_password_reset_token_can_only_be_used_once(): void
    {
        $user = $this->createUser('farmer', 'farmer@example.test');
        $token = Password::createToken($user);
        $payload = [
            'token' => $token,
            'email' => $user->email,
            'password' => 'reset-secure-password',
            'password_confirmation' => 'reset-secure-password',
        ];

        $this->postJson('/api/auth/reset-password', $payload)
            ->assertOk();

        $this->assertTrue(
            Hash::check('reset-secure-password', $user->fresh()->password),
        );

        $this->postJson('/api/auth/reset-password', $payload)
            ->assertUnprocessable();
    }

    public function test_password_recovery_uses_a_reset_notification_without_disclosing_accounts(): void
    {
        Notification::fake();
        $user = $this->createUser('farmer', 'farmer@example.test');

        $this->postJson('/api/auth/forgot-password', [
            'email' => $user->email,
        ])
            ->assertOk()
            ->assertJsonPath(
                'message',
                'If an account exists for that email address, a password reset link has been sent.',
            );

        Notification::assertSentTo(
            $user,
            ResetPassword::class,
            fn (ResetPassword $notification): bool =>
                str_contains(
                    $notification->toMail($user)->actionUrl,
                    '/?reset_token=',
                ) && str_contains(
                    $notification->toMail($user)->actionUrl,
                    'email=farmer%40example.test',
                ),
        );

        $this->postJson('/api/auth/forgot-password', [
            'email' => 'not-registered@example.test',
        ])
            ->assertOk()
            ->assertJsonPath(
                'message',
                'If an account exists for that email address, a password reset link has been sent.',
            );
    }

    public function test_only_administrators_can_view_real_audit_activity(): void
    {
        $admin = $this->createUser('admin', 'admin@example.test');
        $farmer = $this->createUser('farmer', 'farmer@example.test');
        AuditLog::create([
            'user_id' => $farmer->id,
            'action' => 'auth.login',
            'entity_type' => 'user',
            'entity_id' => $farmer->id,
        ]);

        $this->actingAs($admin)
            ->getJson('/api/admin/audit-logs')
            ->assertOk()
            ->assertJsonPath('data.data.0.action', 'auth.login')
            ->assertJsonPath('data.data.0.user.email', 'farmer@example.test');

        $this->actingAs($farmer)
            ->getJson('/api/admin/audit-logs')
            ->assertForbidden();
    }

    public function test_lgu_can_only_deactivate_encoders_in_its_municipality(): void
    {
        $municipality = Municipality::create([
            'name' => 'Barili',
            'province' => 'Cebu',
            'is_active' => true,
        ]);
        $authority = $this->createUser('lgu_authority', 'authority@example.test');
        LguOfficerProfile::create([
            'user_id' => $authority->id,
            'municipality_id' => $municipality->id,
        ]);
        $encoder = $this->createUser('lgu_encoder', 'encoder@example.test');
        LguOfficerProfile::create([
            'user_id' => $encoder->id,
            'municipality_id' => $municipality->id,
        ]);

        $this->actingAs($authority)
            ->patchJson("/api/lgu/encoders/{$encoder->id}/status", [
                'status' => 'suspended',
            ])
            ->assertOk()
            ->assertJsonPath('data.status', 'suspended');

        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $authority->id,
            'action' => 'account.status_changed',
            'entity_id' => $encoder->id,
        ]);
    }

    private function createUser(string $roleSlug, string $email): User
    {
        $user = User::create([
            'first_name' => 'Test',
            'last_name' => ucfirst($roleSlug),
            'email' => $email,
            'password' => Hash::make('secure-password'),
            'status' => 'active',
            'verification_status' => 'verified',
        ]);
        $user->roles()->attach(
            Role::where('slug', $roleSlug)->value('id'),
        );

        return $user;
    }
}
