<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminFarmerController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        $farmers = User::query()
            ->whereHas(
                'roles',
                fn($query) => $query->where('slug', 'farmer')
            )
            ->when($request->query('search'), function ($query, $search) {
                $query->where(function ($query) use ($search) {
                    $query
                        ->where('first_name', 'like', "%{$search}%")
                        ->orWhere('middle_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->with([
                'farmerProfile.municipality',
                'farmerProfile.barangay',
                'verificationDocuments' => fn($query) => $query->latest(),
            ])
            ->orderByDesc('created_at')
            ->paginate(15)
            ->through(function (User $farmer): array {
                $profile = $farmer->farmerProfile;
                $document = $farmer->verificationDocuments->first();

                return [
                    'id' => $farmer->id,
                    'first_name' => $farmer->first_name,
                    'middle_name' => $farmer->middle_name,
                    'last_name' => $farmer->last_name,
                    'email' => $farmer->email,
                    'status' => $farmer->status,
                    'verification_status' => $farmer->verification_status,
                    'created_at' => $farmer->created_at,
                    'profile' => $profile ? [
                        'address' => $profile->address,
                        'barangay' => $profile->barangay?->name,
                        'municipality' => $profile->municipality?->name,
                        'province' => $profile->municipality?->province,
                    ] : null,
                    'latest_document' => $document ? [
                        'type' => $document->document_type,
                        'status' => $document->status,
                        'submitted_at' => $document->created_at,
                    ] : null,
                ];
            });

        return $this->success(
            $farmers,
            'Farmer accounts retrieved successfully.'
        );
    }
}