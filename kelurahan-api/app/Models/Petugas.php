<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Petugas extends Model
{
    use HasFactory;

    protected $table = 'petugas'; // Nama tabelnya 'petugas', bukan 'petugass'
    protected $primaryKey = 'id_petugas';
    protected $fillable = ['nama_petugas', 'jabatan', 'no_hp'];

    // Relasi: Satu Petugas bisa memiliki satu Akun User
    public function user()
    {
        return $this->hasOne(User::class, 'id_petugas', 'id_petugas');
    }

    // Relasi: Satu Petugas bisa memproses banyak Pengajuan Layanan
    public function pengajuanLayanans()
    {
        return $this->hasMany(PengajuanLayanan::class, 'id_petugas', 'id_petugas');
    }
}
