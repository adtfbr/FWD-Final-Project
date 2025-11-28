<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Petugas extends Model
{
    use HasFactory;

    protected $table = 'petugas';
    protected $primaryKey = 'id_petugas';

    protected $fillable = [
        'nama_petugas',
        'jabatan',
        'no_hp'
    ];

    public function user()
    {
        return $this->hasOne(User::class, 'id_petugas', 'id_petugas');
    }

    public function pengajuanLayanans()
    {
        return $this->hasMany(PengajuanLayanan::class, 'id_petugas', 'id_petugas');
    }
}
