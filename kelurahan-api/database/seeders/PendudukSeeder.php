<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Penduduk;
use App\Models\Kk;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Faker\Factory as Faker;

class PendudukSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create('id_ID');

        // 1. Ambil KK Spesial (Punya Aditya)
        $kkAditya = Kk::where('nama_kepala_keluarga', 'Aditya Febriadi')->first();

        // 2. Ambil KK Dummy (KK SELAIN Punya Aditya)
        // Agar orang asing tidak masuk ke KK Aditya
        $kkDummyList = Kk::where('id_kk', '!=', $kkAditya->id_kk)->get();

        // === 1. PENDUDUK SPESIAL 1: Aditya Febriadi ===
        $aditya = Penduduk::create([
            'id_kk'         => $kkAditya->id_kk,
            'nik'           => '3276009988776655',
            'nama'          => 'Aditya Febriadi',
            'tanggal_lahir' => '2000-05-15',
            'jenis_kelamin' => 'L',
            'alamat'        => $kkAditya->alamat,
        ]);

        // User Login Aditya
        User::create([
            'id_penduduk' => $aditya->id_penduduk,
            'name'        => $aditya->nama,
            'email'       => 'aditya@warga.com',
            'password'    => Hash::make('password'),
            'role'        => 'warga',
            'status'      => 'active',
        ]);

        // === 2. PENDUDUK SPESIAL 2: Putri Nur Febrianti ===
        $putri = Penduduk::create([
            'id_kk'         => $kkAditya->id_kk, // Satu KK dengan Aditya
            'nik'           => '3276008877665544',
            'nama'          => 'Putri Nur Febrianti',
            'tanggal_lahir' => '2002-08-20',
            'jenis_kelamin' => 'P',
            'alamat'        => $kkAditya->alamat,
        ]);

        // User Login Putri
        User::create([
            'id_penduduk' => $putri->id_penduduk,
            'name'        => $putri->nama,
            'email'       => 'putri@warga.com',
            'password'    => Hash::make('password'),
            'role'        => 'warga',
            'status'      => 'active',
        ]);

        // === 3. BUAT 28 PENDUDUK DUMMY SISANYA ===
        for ($i = 0; $i < 28; $i++) {
            // Pilih KK secara acak HANYA DARI KK DUMMY
            $randomKk = $kkDummyList->random();

            Penduduk::create([
                'id_kk'         => $randomKk->id_kk,
                'nik'           => $faker->unique()->nik(),
                'nama'          => $faker->name(),
                'tanggal_lahir' => $faker->date('Y-m-d', '2010-01-01'),
                'jenis_kelamin' => $faker->randomElement(['L', 'P']),
                'alamat'        => $randomKk->alamat,
            ]);
        }
    }
}
