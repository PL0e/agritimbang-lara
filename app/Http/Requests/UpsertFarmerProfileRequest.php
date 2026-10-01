<?php

namespace App\Http\Requests;

use App\Models\Barangay;
use Illuminate\Foundation\Http\FormRequest;

class UpsertFarmerProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'municipality_id' => [
                'required',
                'uuid',
                'exists:municipalities,id',
            ],

            'barangay_id' => [
                'required',
                'uuid',
                'exists:barangays,id',
            ],

            'address' => [
                'nullable',
                'string',
                'max:500',
            ],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {

            if (
                !$this->municipality_id ||
                !$this->barangay_id
            ) {
                return;
            }

            $barangay = Barangay::query()
                ->whereKey($this->barangay_id)
                ->first();

            if (!$barangay) {
                return;
            }

            if (
                $barangay->municipality_id !==
                $this->municipality_id
            ) {
                $validator->errors()->add(
                    'barangay_id',
                    'The selected Barangay does not belong to the selected Municipality.'
                );
            }

            if (!$barangay->is_active) {
                $validator->errors()->add(
                    'barangay_id',
                    'The selected Barangay is inactive.'
                );
            }

            if (
                $barangay->municipality &&
                !$barangay->municipality->is_active
            ) {
                $validator->errors()->add(
                    'municipality_id',
                    'The selected Municipality is inactive.'
                );
            }
        });
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('address')) {
            $this->merge([
                'address' => $this->address
                    ? trim($this->address)
                    : null,
            ]);
        }
    }
}