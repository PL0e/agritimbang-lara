<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateBarangayRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $barangayId = $this->route('barangay');

        /*
         * When municipality_id isn't being changed,
         * determine the existing municipality.
         */
        $municipalityId = $this->input('municipality_id');

        if (!$municipalityId && $barangayId) {
            $municipalityId = \App\Models\Barangay::query()
                ->whereKey($barangayId)
                ->value('municipality_id');
        }

        return [
            'municipality_id' => [
                'sometimes',
                'required',
                'uuid',
                'exists:municipalities,id',
            ],

            'name' => [
                'sometimes',
                'required',
                'string',
                'max:255',

                Rule::unique('barangays', 'name')
                    ->where(
                        fn($query) =>
                            $query->where(
                                'municipality_id',
                                $municipalityId
                            )
                    )
                    ->ignore($barangayId),
            ],

            'psgc_code' => [
                'sometimes',
                'nullable',
                'string',
                'max:50',
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