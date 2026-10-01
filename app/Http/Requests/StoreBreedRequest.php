<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreBreedRequest extends FormRequest
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

            'name' => [
                'required',
                'string',
                'max:100',

                Rule::unique('breeds', 'name')
                    ->where(
                        fn($query) =>
                            $query->where(
                                'species_id',
                                $this->species_id
                            )
                    ),
            ],

            'code' => [
                'nullable',
                'string',
                'max:50',
            ],

            'description' => [
                'nullable',
                'string',
                'max:1000',
            ],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'name' => trim((string) $this->name),

            'code' => $this->filled('code')
                ? strtoupper(trim((string) $this->code))
                : null,
        ]);
    }
}