<?php

namespace App\Http\Requests;

use App\Models\Breed;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreLivestockRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'species_id' => [
                'required',
                'uuid',
                'exists:species,id',
            ],

            'breed_id' => [
                'nullable',
                'uuid',
                'exists:breeds,id',
            ],

            'sex' => [
                'nullable',
                'in:male,female,unknown',
            ],

            'age' => [
                'nullable',
                'numeric',
                'min:0',
            ],

            'classification' => [
                'nullable',
                'string',
                'max:100',
            ],

            'condition' => [
                'required',
                'string',
                'max:100',
            ],

            'actual_weight_kg' => [
                'nullable',
                'numeric',
                'gt:0',
                'decimal:0,2',
            ],
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator) {
                if (
                    !$this->filled('breed_id') ||
                    !$this->filled('species_id')
                ) {
                    return;
                }

                $breed = Breed::query()
                    ->whereKey($this->input('breed_id'))
                    ->first();

                if (
                    $breed &&
                    $breed->species_id !== $this->input('species_id')
                ) {
                    $validator->errors()->add(
                        'breed_id',
                        'The selected breed does not belong to the selected species.'
                    );
                }

                if ($breed && !$breed->is_active) {
                    $validator->errors()->add(
                        'breed_id',
                        'The selected breed is inactive.'
                    );
                }
            },
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'classification' => $this->filled('classification')
                ? trim((string) $this->classification)
                : null,

            'condition' => $this->filled('condition')
                ? trim((string) $this->condition)
                : null,
        ]);
    }
}