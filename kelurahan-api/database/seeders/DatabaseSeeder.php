<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            PetugasSeeder::class,      // 1. Buat Petugas
            JenisLayananSeeder::class, // 2. Buat Jenis Layanan
            KkSeeder::class,           // 3. Buat Kartu Keluarga
            PendudukSeeder::class,     // 4. Buat Penduduk & User Warga
        ]);
    }
}
