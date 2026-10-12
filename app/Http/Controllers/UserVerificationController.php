<?php

namespace App\Http\Controllers;

use App\Http\Requests\RejectVerificationRequest;
use App\Http\Requests\UploadVerificationDocumentRequest;
use App\Services\AuditLogService;
use App\Services\UserVerificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class UserVerificationController extends BaseController
{
    public function __construct(
        private readonly UserVerificationService $verificationService,
        private readonly AuditLogService $auditLog,
    ) {
    }

    /*
    |--------------------------------------------------------------------------
    | Farmer
    |--------------------------------------------------------------------------
    */

    /**
     * Get the authenticated farmer's verification documents.
     */
    public function myDocuments(Request $request): JsonResponse
    {
        $documents = $this->verificationService
            ->getDocuments($request->user());

        return $this->success(
            $documents,
            'Verification documents retrieved successfully.'
        );
    }

    /**
     * Upload a new verification document.
     */
    public function upload(
        UploadVerificationDocumentRequest $request
    ): JsonResponse {
        $document = $this->verificationService
            ->uploadDocument(
                $request->user(),
                $request->validated(),
                $request->file('document')
            );
        $this->auditLog->record(
            $request->user(),
            'farmer_verification.submitted',
            'user_verification_document',
            $document->id,
            newValues: [
                'document_type' => $document->document_type,
                'status' => $document->status,
            ],
            request: $request,
        );

        return $this->success(
            $document,
            'Verification document submitted successfully.',
            201
        );
    }

    /**
     * Get one verification document belonging to
     * the authenticated farmer.
     */
    public function showMyDocument(
        Request $request,
        string $document
    ): JsonResponse {
        $document = $this->verificationService
            ->getFarmerDocument(
                $request->user(),
                $document
            );

        return $this->success(
            $document,
            'Verification document retrieved successfully.'
        );
    }

    /**
     * Securely return the farmer's verification file.
     *
     * The file is stored privately and is never exposed
     * through Laravel's public storage symlink.
     */
    public function myDocumentFile(
        Request $request,
        string $document
    ): StreamedResponse {
        $document = $this->verificationService
            ->getFarmerDocument(
                $request->user(),
                $document
            );

        abort_unless(
            Storage::disk('private')->exists(
                $document->file_path
            ),
            404,
            'Verification document file not found.'
        );

        return Storage::disk('private')->response(
            $document->file_path
        );
    }

    /*
    |--------------------------------------------------------------------------
    | LGU Authority
    |--------------------------------------------------------------------------
    */

    /**
     * Get farmer accounts assigned to the authority's municipality.
     */
    public function farmers(Request $request): JsonResponse
    {
        $farmers = $this->verificationService
            ->getMunicipalityFarmers($request->user());

        return $this->success(
            $farmers,
            'Municipality farmer accounts retrieved successfully.'
        );
    }

    /**
     * Get pending farmer verification applications
     * belonging to the authority's municipality.
     */
    public function pending(Request $request): JsonResponse
    {
        $farmers = $this->verificationService
            ->getPendingFarmers(
                $request->user()
            );

        return $this->success(
            $farmers,
            'Pending farmer verifications retrieved successfully.'
        );
    }

    /**
     * Get a farmer's verification details for review.
     *
     * Municipality ownership is enforced by the service.
     */
    public function review(
        Request $request,
        string $farmer
    ): JsonResponse {
        $farmer = $this->verificationService
            ->getFarmerForReview(
                $request->user(),
                $farmer
            );

        return $this->success(
            $farmer,
            'Farmer verification details retrieved successfully.'
        );
    }

    /**
     * Securely return a verification file to the
     * appropriate LGU Authority.
     */
    public function reviewDocumentFile(
        Request $request,
        string $document
    ): StreamedResponse {
        $document = $this->verificationService
            ->getDocumentForReview(
                $request->user(),
                $document
            );

        abort_unless(
            Storage::disk('private')->exists(
                $document->file_path
            ),
            404,
            'Verification document file not found.'
        );

        return Storage::disk('private')->response(
            $document->file_path
        );
    }

    /**
     * Approve a pending farmer verification document.
     */
    public function approve(
        Request $request,
        string $document
    ): JsonResponse {
        $document = $this->verificationService
            ->approve(
                $request->user(),
                $document
            );
        $this->auditLog->record(
            $request->user(),
            'farmer_verification.approved',
            'user_verification_document',
            $document->id,
            ['status' => 'pending'],
            ['status' => 'approved', 'farmer_id' => $document->user_id],
            $request,
        );

        return $this->success(
            $document,
            'Farmer verification approved successfully.'
        );
    }

    /**
     * Reject a pending farmer verification document.
     */
    public function reject(
        RejectVerificationRequest $request,
        string $document
    ): JsonResponse {
        $document = $this->verificationService
            ->reject(
                $request->user(),
                $document,
                $request->validated()['rejection_reason']
            );
        $this->auditLog->record(
            $request->user(),
            'farmer_verification.rejected',
            'user_verification_document',
            $document->id,
            ['status' => 'pending'],
            [
                'status' => 'rejected',
                'farmer_id' => $document->user_id,
                'rejection_reason' => $document->rejection_reason,
            ],
            $request,
        );

        return $this->success(
            $document,
            'Farmer verification rejected successfully.'
        );
    }
}