<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSpeciesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $species = $this->route('species');

        return [
            'name' => [
                'sometimes',
                'required',
                'string',
                'max:100',

                Rule::unique('species', 'name')
                    ->ignore($species),
            ],

            'code' => [
                'sometimes',
                'required',
                'string',
                'max:50',

                Rule::unique('species', 'code')
                    ->ignore($species),
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
            $data['code'] = strtoupper(
                trim((string) $this->code)
            );
        }

        if ($data) {
            $this->merge($data);
        }
    }
}