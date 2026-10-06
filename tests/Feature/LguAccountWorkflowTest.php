<?php

namespace Tests\Feature;

use App\Models\Barangay;
use App\Models\FarmerProfile;
use App\Models\LguOfficerProfile;
use App\Models\Municipality;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class LguAccountWorkflowTest extends TestCase
{
    use RefreshDatabase;

    private Municipality $municipality;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed();

        $this->municipality = Municipality::create([
            'name' => 'Barili',
            'province' => 'Cebu',
            'is_active' => true,
        ]);
    }

    public function test_admin_can_create_an_lgu_authority_for_a_municipality(): void
    {
        $admin = $this->createUserWithRole('admin', 'admin@example.test');

        $this->actingAs($admin)
            ->postJson('/api/admin/lgu-authorities', [
                'first_name' => 'Lgu',
                'last_name' => 'Authority',
                'email' => 'authority@example.test',
                'password' => 'secure-password',
                'password_confirmation' => 'secure-password',
                'municipality_id' => $this->municipality->id,
            ])
            ->assertCreated()
            ->assertJsonPath('data.email', 'authority@example.test')
            ->assertJsonPath('data.roles.0.slug', 'lgu_authority')
            ->assertJsonPath(
                'data.lgu_officer_profile.municipality_id',
                $this->municipality->id,
            );
    }

    public function test_lgu_authority_can_create_an_encoder_for_its_municipality(): void
    {
        $authority = $this->createAuthority();

        $this->actingAs($authority)
            ->postJson('/api/lgu/encoders', [
                'first_name' => 'Market',
                'last_name' => 'Encoder',
                'email' => 'encoder@example.test',
                'password' => 'secure-password',
                'password_confirmation' => 'secure-password',
            ])
            ->assertCreated()
            ->assertJsonPath('data.email', 'encoder@example.test')
            ->assertJsonPath('data.roles.0.slug', 'lgu_encoder')
            ->assertJsonPath(
                'data.lgu_officer_profile.municipality_id',
                $this->municipality->id,
            );
    }

    public function test_registered_farmer_can_upload_a_document_for_lgu_review(): void
    {
        $authority = $this->createAuthority();
        $registration = $this->postJson('/api/auth/register/farmer', [
            'first_name' => 'Registered',
            'last_name' => 'Farmer',
            'email' => 'farmer@example.test',
            'password' => 'secure-password',
            'password_confirmation' => 'secure-password',
        ])
            ->assertCreated()
            ->assertJsonPath('data.user.roles.0.slug', 'farmer');

        $farmer = User::findOrFail(
            $registration->json('data.user.id'),
        );
        $barangay = Barangay::create([
            'municipality_id' => $this->municipality->id,
            'name' => 'Poblacion',
            'is_active' => true,
        ]);

        FarmerProfile::create([
            'user_id' => $farmer->id,
            'municipality_id' => $this->municipality->id,
            'barangay_id' => $barangay->id,
        ]);

        $this->actingAs($authority)
            ->getJson('/api/lgu/farmers')
            ->assertOk()
            ->assertJsonPath('data.data.0.email', 'farmer@example.test')
            ->assertJsonPath(
                'data.data.0.verification_documents',
                [],
            );

        Storage::fake('private');

        $upload = $this->actingAs($farmer)
            ->postJson('/api/farmer/verification-documents', [
                'document_type' => 'national_id',
                'document' => UploadedFile::fake()->create(
                    'national-id.pdf',
                    40,
                    'application/pdf',
                ),
            ])
            ->assertCreated()
            ->assertJsonPath('data.status', 'pending');

        Storage::disk('private')->assertExists(
            $upload->json('data.file_path'),
        );

        $this->actingAs($authority)
            ->getJson('/api/lgu/farmer-verifications')
            ->assertOk()
            ->assertJsonPath('data.data.0.email', 'farmer@example.test');

        $this->actingAs($authority)
            ->postJson(
                '/api/lgu/verification-documents/' . $upload->json('data.id') . '/approve',
            )
            ->assertOk()
            ->assertJsonPath('data.status', 'approved');

        $this->assertDatabaseHas('users', [
            'id' => $farmer->id,
            'verification_status' => 'verified',
        ]);
    }

    public function test_admin_cannot_use_lgu_only_workflows(): void
    {
        $admin = $this->createUserWithRole('admin', 'admin@example.test');

        $this->actingAs($admin)
            ->getJson('/api/lgu/farmer-verifications')
            ->assertForbidden();

        $this->actingAs($admin)
            ->postJson('/api/lgu/encoders', [
                'first_name' => 'Market',
                'last_name' => 'Encoder',
                'email' => 'encoder@example.test',
                'password' => 'secure-password',
                'password_confirmation' => 'secure-password',
            ])
            ->assertForbidden();
    }

    public function test_admin_can_view_registered_farmers_and_their_saved_location(): void
    {
        $admin = $this->createUserWithRole('admin', 'admin@example.test');
        $newFarmer = $this->createUserWithRole(
            'farmer',
            'new-farmer@example.test',
        );
        $newFarmer->update(['verification_status' => 'unverified']);

        $profiledFarmer = $this->createUserWithRole(
            'farmer',
            'profiled-farmer@example.test',
        );
        $barangay = Barangay::create([
            'municipality_id' => $this->municipality->id,
            'name' => 'Poblacion',
            'is_active' => true,
        ]);
        FarmerProfile::create([
            'user_id' => $profiledFarmer->id,
            'municipality_id' => $this->municipality->id,
            'barangay_id' => $barangay->id,
            'address' => '12 Main Street',
        ]);

        $response = $this->actingAs($admin)
            ->getJson('/api/admin/farmers')
            ->assertOk();

        $farmers = collect($response->json('data.data'))->keyBy('email');

        $this->assertCount(2, $farmers);
        $this->assertNull(
            $farmers['new-farmer@example.test']['profile'],
        );
        $this->assertSame(
            'unverified',
            $farmers['new-farmer@example.test']['verification_status'],
        );
        $this->assertSame(
            [
                'address' => '12 Main Street',
                'barangay' => 'Poblacion',
                'municipality' => 'Barili',
                'province' => 'Cebu',
            ],
            $farmers['profiled-farmer@example.test']['profile'],
        );
    }

    private function createAuthority(): User
    {
        $authority = $this->createUserWithRole(
            'lgu_authority',
            'authority@example.test',
        );

        LguOfficerProfile::create([
            'user_id' => $authority->id,
            'municipality_id' => $this->municipality->id,
        ]);

        return $authority;
    }

    private function createUserWithRole(string $roleSlug, string $email): User
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
