<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PengajuanLayanan extends Model
{
    use HasFactory;

    protected $primaryKey = 'id_pengajuan';
    protected $fillable = ['id_user', 'id_jenis_layanan', 'id_petugas', 'tanggal_pengajuan', 'status', 'keterangan'];

    // Relasi: Satu Pengajuan dimiliki oleh satu User
    public function user()
    {
        return $this->belongsTo(User::class, 'id_user', 'id_user');
    }

    // Relasi: Satu Pengajuan mengacu pada satu Jenis Layanan
    public function jenisLayanan()
    {
        return $this->belongsTo(JenisLayanan::class, 'id_jenis_layanan', 'id_jenis_layanan');
    }

    // Relasi: Satu Pengajuan diproses oleh satu Petugas
    public function petugas()
    {
        return $this->belongsTo(Petugas::class, 'id_petugas', 'id_petugas');
    }
}
