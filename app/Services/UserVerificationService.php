<?php

namespace App\Services;

use App\Models\FarmerProfile;
use App\Models\User;
use App\Models\UserVerificationDocument;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class UserVerificationService
{
    /*
    |--------------------------------------------------------------------------
    | Farmer
    |--------------------------------------------------------------------------
    */

    public function getDocuments(User $farmer)
    {
        return UserVerificationDocument::query()
            ->where('user_id', $farmer->id)
            ->with('reviewer')
            ->latest()
            ->get();
    }


    public function getFarmerDocument(
        User $farmer,
        string $documentId
    ): UserVerificationDocument {
        return UserVerificationDocument::query()
            ->whereKey($documentId)
            ->where('user_id', $farmer->id)
            ->with('reviewer')
            ->firstOrFail();
    }


    public function uploadDocument(
        User $farmer,
        array $data,
        UploadedFile $file
    ): UserVerificationDocument {
        return DB::transaction(function () use ($farmer, $data, $file) {
            /*
             * Farmer must complete their profile before
             * submitting verification.
             */
            $profile = FarmerProfile::query()
                ->where('user_id', $farmer->id)
                ->first();

            if (!$profile) {
                throw ValidationException::withMessages([
                    'profile' => [
                        'Complete your farmer profile before submitting verification documents.',
                    ],
                ]);
            }

            /*
             * Don't allow another submission while one
             * is already awaiting review.
             */
            $hasPendingDocument =
                UserVerificationDocument::query()
                    ->where('user_id', $farmer->id)
                    ->where('status', 'pending')
                    ->exists();

            if ($hasPendingDocument) {
                throw ValidationException::withMessages([
                    'document' => [
                        'You already have a verification document awaiting review.',
                    ],
                ]);
            }

            if ($farmer->verification_status === 'verified') {
                throw ValidationException::withMessages([
                    'document' => [
                        'Your account is already verified.',
                    ],
                ]);
            }

            /*
             * Store privately.
             *
             * storage/app/private/
             * verification-documents/{user UUID}/...
             */
            $path = $file->store(
                "verification-documents/{$farmer->id}",
                'private'
            );

            try {
                $document =
                    UserVerificationDocument::create([
                        'user_id' => $farmer->id,

                        'document_type' =>
                            $data['document_type'],

                        'document_number' =>
                            $data['document_number'] ?? null,

                        'file_path' => $path,

                        'status' => 'pending',
                    ]);

                $farmer->update([
                    'verification_status' => 'pending',
                ]);

                return $document;
            } catch (\Throwable $exception) {

                /*
                 * DB transaction can roll back database changes,
                 * but it cannot automatically delete a file.
                 */
                Storage::disk('private')->delete($path);

                throw $exception;
            }
        });
    }


    /*
    |--------------------------------------------------------------------------
    | LGU Authority
    |--------------------------------------------------------------------------
    */

    public function getMunicipalityFarmers(
        User $authority
    ): LengthAwarePaginator {
        $municipalityId = $this->getAuthorityMunicipalityId($authority);

        return User::query()
            ->whereHas(
                'roles',
                fn($query) => $query->where('slug', 'farmer')
            )
            ->whereHas(
                'farmerProfile',
                fn($query) => $query->where(
                    'municipality_id',
                    $municipalityId
                )
            )
            ->with([
                'farmerProfile.municipality',
                'farmerProfile.barangay',
                'verificationDocuments' => fn($query) => $query->latest(),
            ])
            ->orderByDesc('created_at')
            ->paginate(15);
    }

    public function getPendingFarmers(
        User $authority
    ): LengthAwarePaginator {
        $municipalityId =
            $this->getAuthorityMunicipalityId($authority);

        return User::query()
            ->where('verification_status', 'pending')
            ->whereHas(
                'roles',
                fn($query) =>
                    $query->where('slug', 'farmer')
            )
            ->whereHas(
                'farmerProfile',
                fn($query) =>
                    $query->where(
                        'municipality_id',
                        $municipalityId
                    )
            )
            ->with([
                'farmerProfile.municipality',
                'farmerProfile.barangay',

                'verificationDocuments' =>
                    fn($query) =>
                        $query
                            ->where('status', 'pending')
                            ->latest(),
            ])
            ->orderBy('last_name')
            ->paginate(15);
    }


    public function getFarmerForReview(
        User $authority,
        string $farmerId
    ): User {
        $municipalityId =
            $this->getAuthorityMunicipalityId($authority);

        return User::query()
            ->whereKey($farmerId)
            ->whereHas(
                'roles',
                fn($query) =>
                    $query->where('slug', 'farmer')
            )
            ->whereHas(
                'farmerProfile',
                fn($query) =>
                    $query->where(
                        'municipality_id',
                        $municipalityId
                    )
            )
            ->with([
                'farmerProfile.municipality',
                'farmerProfile.barangay',
                'verificationDocuments.reviewer',
            ])
            ->firstOrFail();
    }


    public function getDocumentForReview(
        User $authority,
        string $documentId
    ): UserVerificationDocument {
        $municipalityId =
            $this->getAuthorityMunicipalityId($authority);

        return UserVerificationDocument::query()
            ->whereKey($documentId)
            ->whereHas(
                'user.farmerProfile',
                fn($query) =>
                    $query->where(
                        'municipality_id',
                        $municipalityId
                    )
            )
            ->with([
                'user.farmerProfile.municipality',
                'user.farmerProfile.barangay',
            ])
            ->firstOrFail();
    }


    public function approve(
        User $authority,
        string $documentId
    ): UserVerificationDocument {
        return DB::transaction(function () use ($authority, $documentId) {
            $document = $this->getDocumentForReview(
                $authority,
                $documentId
            );

            if ($document->status !== 'pending') {
                throw ValidationException::withMessages([
                    'document' => [
                        'Only pending verification documents can be approved.',
                    ],
                ]);
            }

            $farmer = $document->user;

            $document->update([
                'status' => 'approved',
                'rejection_reason' => null,
                'reviewed_by' => $authority->id,
                'reviewed_at' => now(),
            ]);

            $farmer->update([
                'verification_status' => 'verified',
            ]);

            $this->ensureFarmerCode($farmer);

            return $document->fresh([
                'user.farmerProfile.municipality',
                'user.farmerProfile.barangay',
                'reviewer',
            ]);
        });
    }


    public function reject(
        User $authority,
        string $documentId,
        string $reason
    ): UserVerificationDocument {
        return DB::transaction(function () use ($authority, $documentId, $reason) {
            $document = $this->getDocumentForReview(
                $authority,
                $documentId
            );

            if ($document->status !== 'pending') {
                throw ValidationException::withMessages([
                    'document' => [
                        'Only pending verification documents can be rejected.',
                    ],
                ]);
            }

            $document->update([
                'status' => 'rejected',
                'rejection_reason' => $reason,
                'reviewed_by' => $authority->id,
                'reviewed_at' => now(),
            ]);

            $document->user->update([
                'verification_status' => 'rejected',
            ]);

            return $document->fresh([
                'user.farmerProfile.municipality',
                'user.farmerProfile.barangay',
                'reviewer',
            ]);
        });
    }


    /*
    |--------------------------------------------------------------------------
    | Farmer Code
    |--------------------------------------------------------------------------
    */

    private function ensureFarmerCode(
        User $farmer
    ): void {
        $profile = $farmer->farmerProfile;

        if (!$profile || $profile->farmer_code) {
            return;
        }

        /*
         * UUID-derived code avoids race conditions from
         * COUNT() + 1 style sequential generation.
         */
        $profile->update([
            'farmer_code' =>
                'FMR-' .
                strtoupper(
                    substr(
                        str_replace('-', '', $farmer->id),
                        0,
                        10
                    )
                ),
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    private function getAuthorityMunicipalityId(
        User $authority
    ): string {
        $authority->loadMissing(
            'lguOfficerProfile'
        );

        if (!$authority->lguOfficerProfile) {
            throw ValidationException::withMessages([
                'authority' => [
                    'LGU Authority profile was not found.',
                ],
            ]);
        }

        return $authority
            ->lguOfficerProfile
            ->municipality_id;
    }
}