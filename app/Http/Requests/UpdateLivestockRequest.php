<?php

namespace App\Http\Requests;

use App\Models\Breed;
use App\Models\Species;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class UpdateLivestockRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'species_id' => [
                'sometimes',
                'uuid',
                'exists:species,id',
            ],

            'breed_id' => [
                'sometimes',
                'nullable',
                'uuid',
                'exists:breeds,id',
            ],

            'sex' => [
                'sometimes',
                'nullable',
                'in:male,female,unknown',
            ],

            'age' => [
                'sometimes',
                'nullable',
                'numeric',
                'min:0',
            ],

            'classification' => [
                'sometimes',
                'nullable',
                'string',
                'max:100',
            ],

            'condition' => [
                'sometimes',
                'required',
                'string',
                'max:100',
            ],

            'actual_weight_kg' => [
                'sometimes',
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
                $livestock = $this->route('livestock');

                if (!$livestock) {
                    return;
                }

                $speciesId = $this->input(
                    'species_id',
                    $livestock->species_id
                );

                $breedId = $this->exists('breed_id')
                    ? $this->input('breed_id')
                    : $livestock->breed_id;

                $species = Species::query()
                    ->whereKey($speciesId)
                    ->first();

                if ($species && !$species->is_active) {
                    $validator->errors()->add(
                        'species_id',
                        'The selected species is inactive.'
                    );
                }

                if (!$breedId) {
                    return;
                }

                $breed = Breed::query()
                    ->whereKey($breedId)
                    ->first();

                if (
                    $breed &&
                    $breed->species_id !== $speciesId
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
        $data = [];

        if ($this->exists('classification')) {
            $data['classification'] =
                $this->filled('classification')
                ? trim((string) $this->classification)
                : null;
        }

        if ($this->exists('condition')) {
            $data['condition'] =
                $this->filled('condition')
                ? trim((string) $this->condition)
                : $this->condition;
        }

        $this->merge($data);
    }
}