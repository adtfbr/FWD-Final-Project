<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Kk extends Model
{
    use HasFactory;

    protected $primaryKey = 'id_kk';
    protected $fillable = ['no_kk', 'alamat', 'rt', 'rw', 'kelurahan', 'kecamatan'];

    // Relasi: Satu KK memiliki banyak Penduduk
    public function penduduks()
    {
        return $this->hasMany(Penduduk::class, 'id_kk', 'id_kk');
    }
}
