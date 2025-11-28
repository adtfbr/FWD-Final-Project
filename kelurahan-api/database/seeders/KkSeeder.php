<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Kk;
use Faker\Factory as Faker;

class KkSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create('id_ID');


        Kk::create([
            'no_kk'                => '3276001122334455',
            'nama_kepala_keluarga' => 'Aditya Febriadi',
            'nik_kepala_keluarga'  => '3276009988776655',
            'alamat'               => 'Depok',
            'rt'                   => '001',
            'rw'                   => '001',
            'kelurahan'            => 'Mekarjaya',
            'kecamatan'            => 'Sukmajaya',
            'kabupaten'            => 'Depok',
            'provinsi'             => 'Jawa Barat',
            'kode_pos'             => '16411',
            'jumlah_anggota'       => 2,
            'tanggal_terbit'       => '2024-01-01',
        ]);


        for ($i = 1; $i <= 6; $i++) {
            Kk::create([
                'no_kk'                => $faker->unique()->numerify('3276############'),
                'nama_kepala_keluarga' => $faker->name('male'),
                'nik_kepala_keluarga'  => $faker->unique()->nik(),
                'alamat'               => $faker->streetAddress(),
                'rt'                   => $faker->numerify('0##'),
                'rw'                   => $faker->numerify('0##'),
                'kelurahan'            => 'Mekarjaya',
                'kecamatan'            => 'Sukmajaya',
                'kabupaten'            => 'Depok',
                'provinsi'             => 'Jawa Barat',
                'kode_pos'             => '16411',
                'jumlah_anggota'       => $faker->numberBetween(2, 5),
                'tanggal_terbit'       => $faker->date(),
            ]);
        }
    }
}
