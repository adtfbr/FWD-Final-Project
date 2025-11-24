<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('pengajuan_layanans', function (Blueprint $table) {
            $table->id('id_pengajuan');
            $table->foreignId('id_user')->constrained('users', 'id_user');
            $table->foreignId('id_jenis_layanan')->constrained('jenis_layanans', 'id_jenis_layanan');
            $table->foreignId('id_petugas')->nullable()->constrained('petugas', 'id_petugas');
            $table->date('tanggal_pengajuan');
            $table->enum('status', ['Diajukan', 'Diproses', 'Selesai', 'Ditolak'])->default('Diajukan');
            $table->text('keterangan')->nullable();
            $table->string('file_persyaratan')->nullable();
            $table->string('file_surat_hasil')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pengajuan_layanans');
        // HAPUS JUGA drop users DARI SINI
    }
};
