<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpsertBarangayGeometryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'geometry' => [
                'required',
                'array',
            ],

            'geometry.type' => [
                'required',
                'string',
                Rule::in([
                    'Polygon',
                    'MultiPolygon',
                ]),
            ],

            'geometry.coordinates' => [
                'required',
                'array',
                'min:1',
            ],

            'geometry_type' => [
                'required',
                'string',
                Rule::in([
                    'Polygon',
                    'MultiPolygon',
                ]),
            ],

            'source' => [
                'nullable',
                'string',
                'max:255',
            ],

            'source_reference' => [
                'nullable',
                'string',
                'max:1000',
            ],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $geometry = $this->input('geometry');
            $geometryType = $this->input('geometry_type');

            if (
                is_array($geometry) &&
                isset($geometry['type']) &&
                $geometry['type'] !== $geometryType
            ) {
                $validator->errors()->add(
                    'geometry_type',
                    'Geometry type must match the GeoJSON geometry type.'
                );
            }
        });
    }
}