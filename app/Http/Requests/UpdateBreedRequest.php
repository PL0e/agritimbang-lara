<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateBreedRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $breed = $this->route('breed');

        $speciesId = $this->input(
            'species_id',
            $breed?->species_id
        );

        return [
            'species_id' => [
                'sometimes',
                'required',
                'uuid',
                'exists:species,id',
            ],

            'name' => [
                'sometimes',
                'required',
                'string',
                'max:100',

                Rule::unique('breeds', 'name')
                    ->where(
                        fn($query) =>
                            $query->where(
                                'species_id',
                                $speciesId
                            )
                    )
                    ->ignore($breed?->id),
            ],

            'code' => [
                'sometimes',
                'nullable',
                'string',
                'max:50',
            ],

            'description' => [
                'sometimes',
                'nullable',
                'string',
                'max:1000',
            ],
        ];
    }

    protected function prepareForValidation(): void
    {
        $data = [];

        if ($this->has('name')) {
            $data['name'] = trim(
                (string) $this->name
            );
        }

        if ($this->has('code')) {
            $data['code'] = $this->filled('code')
                ? strtoupper(trim((string) $this->code))
                : null;
        }

        if ($data) {
            $this->merge($data);
        }
    }
}