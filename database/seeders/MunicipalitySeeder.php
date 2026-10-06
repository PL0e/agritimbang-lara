<?php

namespace Database\Seeders;

use App\Models\Municipality;
use Illuminate\Database\Seeder;

class MunicipalitySeeder extends Seeder
{
    public function run(): void
    {
        foreach ([
            ['name' => 'Barili', 'province' => 'Cebu'],
            ['name' => 'Carcar City', 'province' => 'Cebu'],
            ['name' => 'Argao', 'province' => 'Cebu'],
        ] as $municipality) {
            Municipality::updateOrCreate(
                [
                    'name' => $municipality['name'],
                    'province' => $municipality['province'],
                ],
                ['is_active' => true],
            );
        }
    }
}
