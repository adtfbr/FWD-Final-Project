<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Berita extends Model
{
    use HasFactory;

    protected $primaryKey = 'id_berita';
    protected $fillable = ['judul', 'slug', 'isi', 'gambar', 'id_petugas'];

    // Relasi: Berita ditulis oleh Petugas
    public function petugas()
    {
        return $this->belongsTo(Petugas::class, 'id_petugas', 'id_petugas');
    }
}
