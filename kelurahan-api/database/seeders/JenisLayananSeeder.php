<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\JenisLayanan;

class JenisLayananSeeder extends Seeder
{
    public function run(): void
    {
        $layanan = [
            [
                'nama_layanan' => 'Surat Keterangan Usaha (SKU)',
                'deskripsi'    => 'Surat keterangan untuk keperluan izin usaha mikro/kecil.'
            ],
            [
                'nama_layanan' => 'Surat Keterangan Domisili',
                'deskripsi'    => 'Keterangan tempat tinggal sementara atau menetap.'
            ],
            [
                'nama_layanan' => 'Surat Pengantar Nikah (N1-N4)',
                'deskripsi'    => 'Dokumen pengantar untuk pendaftaran pernikahan di KUA.'
            ],
            [
                'nama_layanan' => 'Surat Keterangan Tidak Mampu (SKTM)',
                'deskripsi'    => 'Untuk keperluan beasiswa, BPJS PBI, atau bantuan sosial.'
            ],
            [
                'nama_layanan' => 'Surat Keterangan Kematian',
                'deskripsi'    => 'Bukti administratif untuk pelaporan kematian warga.'
            ],
            [
                'nama_layanan' => 'Surat Keterangan Kelahiran',
                'deskripsi'    => 'Pengantar untuk pembuatan akta kelahiran.'
            ],
            [
                'nama_layanan' => 'Surat Keterangan Pindah Datang',
                'deskripsi'    => 'Untuk warga yang akan pindah domisili atau baru datang.'
            ],
        ];

        foreach ($layanan as $item) {
            JenisLayanan::create($item);
        }
    }
}
