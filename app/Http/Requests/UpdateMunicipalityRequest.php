<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateMunicipalityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => [
                'sometimes',
                'required',
                'string',
                'max:255',
            ],

            'province' => [
                'sometimes',
                'required',
                'string',
                'max:255',
            ],

            'psgc_code' => [
                'nullable',
                'string',
                'max:255',

                Rule::unique('municipalities', 'psgc_code')
                    ->ignore($this->route('municipality')),
            ],

            'is_active' => [
                'sometimes',
                'boolean',
            ],
        ];
    }

    protected function prepareForValidation(): void
    {
        $data = [];

        if ($this->has('name')) {
            $data['name'] = trim($this->name);
        }

        if ($this->has('province')) {
            $data['province'] = trim($this->province);
        }

        $this->merge($data);
    }
}