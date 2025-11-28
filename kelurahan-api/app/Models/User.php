<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $primaryKey = 'id_user';

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'id_penduduk',
        'id_petugas',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function penduduk()
    {
        return $this->belongsTo(Penduduk::class, 'id_penduduk', 'id_penduduk');
    }

    public function petugas()
    {
        return $this->belongsTo(Petugas::class, 'id_petugas', 'id_petugas');
    }

    public function pengajuanLayanans()
    {
        return $this->hasMany(PengajuanLayanan::class, 'id_user', 'id_user');
    }
}
