<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Kk extends Model
{
    use HasFactory;

    protected $primaryKey = 'id_kk';

    protected $fillable = [
        'no_kk',
        'nama_kepala_keluarga',
        'nik_kepala_keluarga',
        'alamat',
        'rt',
        'rw',
        'kelurahan',
        'kecamatan',
        'kabupaten',
        'provinsi',
        'kode_pos',
        'jumlah_anggota',
        'tanggal_terbit'
    ];

    public function penduduks()
    {
        return $this->hasMany(Penduduk::class, 'id_kk', 'id_kk');
    }
}
