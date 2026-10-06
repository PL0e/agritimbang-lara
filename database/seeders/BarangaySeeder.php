<?php

namespace Database\Seeders;

use App\Models\Barangay;
use App\Models\Municipality;
use Illuminate\Database\Seeder;

class BarangaySeeder extends Seeder
{
    public function run(): void
    {
        $barangaysByMunicipality = [
            'Barili' => [
                'Poblacion',
                'Mantalongon',
                'Mantayupan',
                'Minolos',
                'Vito',
            ],
            'Carcar City' => [
                'Can-asujan',
                'Perrelos',
                'Poblacion I',
                'Poblacion II',
                'Valladolid',
            ],
            'Argao' => [
                'Poblacion',
                'Talaga',
                'Taloot',
                'Usmad',
                'Viga',
            ],
        ];

        foreach ($barangaysByMunicipality as $municipalityName => $names) {
            $municipality = Municipality::query()
                ->where('name', $municipalityName)
                ->where('province', 'Cebu')
                ->firstOrFail();

            foreach ($names as $name) {
                Barangay::updateOrCreate(
                    [
                        'municipality_id' => $municipality->id,
                        'name' => $name,
                    ],
                    ['is_active' => true],
                );
            }
        }
    }
}
