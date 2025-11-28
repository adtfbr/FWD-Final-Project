<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('penduduks', function (Blueprint $table) {
            $table->id('id_penduduk');
            $table->foreignId('id_kk')->constrained('kks', 'id_kk')->onDelete('cascade');
            $table->string('nik', 16)->unique();
            $table->string('nama', 255);
            $table->date('tanggal_lahir');
            $table->enum('jenis_kelamin', ['L', 'P']);
            $table->text('alamat');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('penduduks');
    }
};
