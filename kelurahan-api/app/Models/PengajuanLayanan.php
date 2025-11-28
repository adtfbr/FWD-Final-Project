<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PengajuanLayanan extends Model
{
    use HasFactory;

    protected $primaryKey = 'id_pengajuan';

    protected $fillable = [
        'id_user',
        'id_jenis_layanan',
        'id_petugas',
        'tanggal_pengajuan',
        'status',
        'keterangan',
        'file_persyaratan',
        'file_surat_hasil'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'id_user', 'id_user');
    }

    public function jenisLayanan()
    {
        return $this->belongsTo(JenisLayanan::class, 'id_jenis_layanan', 'id_jenis_layanan');
    }

    public function petugas()
    {
        return $this->belongsTo(Petugas::class, 'id_petugas', 'id_petugas');
    }
}
