<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('kks', function (Blueprint $table) {
            $table->string('nama_kepala_keluarga')->nullable()->after('no_kk');
            $table->string('nik_kepala_keluarga', 16)->nullable()->after('nama_kepala_keluarga');
            $table->string('kabupaten', 100)->nullable()->after('kecamatan');
            $table->string('provinsi', 100)->nullable()->after('kabupaten');
            $table->string('kode_pos', 5)->nullable()->after('provinsi');
            $table->integer('jumlah_anggota')->default(0)->after('kode_pos');
            $table->date('tanggal_terbit')->nullable()->after('jumlah_anggota');
        });
    }

    public function down(): void
    {
        Schema::table('kks', function (Blueprint $table) {
            $table->dropColumn([
                'nama_kepala_keluarga',
                'nik_kepala_keluarga',
                'kabupaten',
                'provinsi',
                'kode_pos',
                'jumlah_anggota',
                'tanggal_terbit'
            ]);
        });
    }
};
