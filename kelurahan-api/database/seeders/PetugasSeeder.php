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
        // Petugas 1
        $petugas1 = Petugas::create([
            'nama_petugas' => 'Aditya Febriadi (Admin)',
            'jabatan'      => 'Kepala Layanan',
        ]);

        User::create([
            'id_petugas' => $petugas1->id_petugas,
            'name'       => $petugas1->nama_petugas,
            'email'      => 'adit.petugas@kelurahan.com',
            'password'   => Hash::make('password'),
            'role'       => 'petugas',
            'status'     => 'active',
        ]);

        // Petugas 2
        $petugas2 = Petugas::create([
            'nama_petugas' => 'Siti Aminah',
            'jabatan'      => 'Staf Administrasi',
        ]);

        User::create([
            'id_petugas' => $petugas2->id_petugas,
            'name'       => $petugas2->nama_petugas,
            'email'      => 'siti.petugas@kelurahan.com',
            'password'   => Hash::make('password'),
            'role'       => 'petugas',
            'status'     => 'active',
        ]);
    }
}
