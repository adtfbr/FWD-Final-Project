<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Petugas;
use App\Models\User;
use App\Models\JenisLayanan;
use App\Models\Kk;
use App\Models\Penduduk;
use Illuminate\Support\Facades\Hash;

class InitialDataSeeder extends Seeder
{
    public function run(): void
    {
        // === BUAT DATA PETUGAS & AKUN LOGIN PETUGAS ===
        $petugas1 = Petugas::create([
            'nama_petugas' => 'Andi Wijaya',
            'jabatan'      => 'Kepala Layanan',
        ]);

        User::create([
            'id_petugas' => $petugas1->id_petugas,
            'name'       => $petugas1->nama_petugas,
            'email'      => 'andi.petugas@kelurahan.com',
            'password'   => Hash::make('password'),
            'role'       => 'petugas',
        ]);

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
        ]);


        // === BUAT JENIS LAYANAN SURAT ===
        JenisLayanan::create(['nama_layanan' => 'Surat Keterangan Usaha', 'deskripsi' => 'Surat untuk keperluan membuka usaha.']);
        JenisLayanan::create(['nama_layanan' => 'Surat Keterangan Domisili', 'deskripsi' => 'Surat keterangan tinggal di wilayah kelurahan.']);
        JenisLayanan::create(['nama_layanan' => 'Surat Pengantar Nikah', 'deskripsi' => 'Surat pengantar untuk keperluan pernikahan.']);


        // === BUAT DATA WARGA & AKUN LOGIN WARGA ===
        $kkContoh = Kk::create([
            'no_kk'     => '3276001122334455',
            'alamat'    => 'Jl. Merdeka No. 10',
            'rt'        => '001',
            'rw'        => '005',
            'kelurahan' => 'Mekarjaya',
            'kecamatan' => 'Sukmajaya',
        ]);

        $penduduk1 = Penduduk::create([
            'id_kk'         => $kkContoh->id_kk,
            'nik'           => '3276009988776655',
            'nama'          => 'Budi Santoso',
            'tanggal_lahir' => '1990-05-15',
            'jenis_kelamin' => 'L',
            'alamat'        => 'Jl. Merdeka No. 10',
        ]);

        Penduduk::create([
            'id_kk'         => $kkContoh->id_kk,
            'nik'           => '3276002244668800',
            'nama'          => 'Citra Lestari',
            'tanggal_lahir' => '1992-08-20',
            'jenis_kelamin' => 'P',
            'alamat'        => 'Jl. Merdeka No. 10',
        ]);

        User::create([
            'id_penduduk' => $penduduk1->id_penduduk,
            'name'        => $penduduk1->nama,
            'email'       => 'budi.warga@email.com',
            'password'    => Hash::make('password'),
            'role'        => 'warga',
        ]);
    }
}