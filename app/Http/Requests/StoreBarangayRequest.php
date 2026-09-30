<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreBarangayRequest extends FormRequest
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

            'name' => [
                'required',
                'string',
                'max:255',

                Rule::unique('barangays', 'name')
                    ->where(
                        fn($query) =>
                            $query->where(
                                'municipality_id',
                                $this->municipality_id
                            )
                    ),
            ],

            'psgc_code' => [
                'nullable',
                'string',
                'max:50',
            ],

            'is_active' => [
                'sometimes',
                'boolean',
            ],
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('name')) {
            $this->merge([
                'name' => trim($this->name),
            ]);
        }

        if ($this->has('psgc_code')) {
            $this->merge([
                'psgc_code' => $this->psgc_code
                    ? trim($this->psgc_code)
                    : null,
            ]);
        }
    }
}