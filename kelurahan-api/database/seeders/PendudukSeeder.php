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


        $kkAditya = Kk::where('nama_kepala_keluarga', 'Aditya Febriadi')->first();



        $kkDummyList = Kk::where('id_kk', '!=', $kkAditya->id_kk)->get();


        $aditya = Penduduk::create([
            'id_kk'         => $kkAditya->id_kk,
            'nik'           => '3276009988776655',
            'nama'          => 'Aditya Febriadi',
            'tanggal_lahir' => '2002-02-02',
            'jenis_kelamin' => 'L',
            'alamat'        => $kkAditya->alamat,
        ]);


        User::create([
            'id_penduduk' => $aditya->id_penduduk,
            'name'        => $aditya->nama,
            'email'       => 'aditya@warga.com',
            'password'    => Hash::make('password'),
            'role'        => 'warga',
            'status'      => 'active',
        ]);


        $putri = Penduduk::create([
            'id_kk'         => $kkAditya->id_kk,
            'nik'           => '3276008877665544',
            'nama'          => 'Putri Nur Febrianti',
            'tanggal_lahir' => '2005-02-27',
            'jenis_kelamin' => 'P',
            'alamat'        => $kkAditya->alamat,
        ]);


        User::create([
            'id_penduduk' => $putri->id_penduduk,
            'name'        => $putri->nama,
            'email'       => 'putri@warga.com',
            'password'    => Hash::make('password'),
            'role'        => 'warga',
            'status'      => 'active',
        ]);


        for ($i = 0; $i < 28; $i++) {

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
