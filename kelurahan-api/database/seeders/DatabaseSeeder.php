<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            PetugasSeeder::class,
            JenisLayananSeeder::class,
            KkSeeder::class,
            PendudukSeeder::class,
        ]);
    }
}
