<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Petugas;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class PetugasSeeder extends Seeder
{
    public function run(): void
    {
        // Petugas 1: Super Admin
        $petugas1 = Petugas::create([
            'nama_petugas' => 'Administrator Sistem',
            'jabatan'      => 'Kepala Pelayanan',
            'no_hp'        => '081234567890',
        ]);

        User::create([
            'id_petugas' => $petugas1->id_petugas,
            'name'       => $petugas1->nama_petugas,
            'email'      => 'admin@nagari.id',
            'password'   => Hash::make('password'),
            'role'       => 'petugas',
            'status'     => 'active',
        ]);

        // Petugas 2: Staf
        $petugas2 = Petugas::create([
            'nama_petugas' => 'Siti Aminah',
            'jabatan'      => 'Staf Administrasi',
            'no_hp'        => '089876543210',
        ]);

        User::create([
            'id_petugas' => $petugas2->id_petugas,
            'name'       => $petugas2->nama_petugas,
            'email'      => 'siti@nagari.id',
            'password'   => Hash::make('password'),
            'role'       => 'petugas',
            'status'     => 'active',
        ]);
    }
}
