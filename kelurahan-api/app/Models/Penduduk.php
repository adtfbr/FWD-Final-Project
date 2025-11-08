<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Penduduk extends Model
{
    use HasFactory;

    protected $primaryKey = 'id_penduduk';
    protected $fillable = ['id_kk', 'nik', 'nama', 'tanggal_lahir', 'jenis_kelamin', 'alamat'];

    // Relasi: Satu Penduduk dimiliki oleh satu KK
    public function kk()
    {
        return $this->belongsTo(Kk::class, 'id_kk', 'id_kk');
    }

    // Relasi: Satu Penduduk bisa memiliki satu Akun User
    public function user()
    {
        return $this->hasOne(User::class, 'id_penduduk', 'id_penduduk');
    }
}
