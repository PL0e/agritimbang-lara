<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            [
                'name' => 'Farmer',
                'slug' => 'farmer',
            ],
            [
                'name' => 'LGU Encoder',
                'slug' => 'lgu_encoder',
            ],
            [
                'name' => 'LGU Authority',
                'slug' => 'lgu_authority',
            ],
            [
                'name' => 'Administrator',
                'slug' => 'admin',
            ],
        ];

        foreach ($roles as $role) {
            Role::updateOrCreate(
                ['slug' => $role['slug']],
                $role
            );
        }
    }
}