<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UploadVerificationDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'document_type' => [
                'required',
                'string',
                Rule::in([
                    'national_id',
                    'drivers_license',
                    'passport',
                    'voters_id',
                    'barangay_id',
                    'other',
                ]),
            ],

            'document_number' => [
                'nullable',
                'string',
                'max:100',
            ],

            'document' => [
                'required',
                'file',
                'mimes:jpg,jpeg,png,pdf',
                'max:5120',
            ],
        ];
    }
}