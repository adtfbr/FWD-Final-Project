<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JenisLayanan extends Model
{
    use HasFactory;

    protected $primaryKey = 'id_jenis_layanan';
    protected $fillable = ['nama_layanan', 'deskripsi'];

    // Relasi: Satu Jenis Layanan bisa memiliki banyak Pengajuan
    public function pengajuanLayanans()
    {
        return $this->hasMany(PengajuanLayanan::class, 'id_jenis_layanan', 'id_jenis_layanan');
    }
}
