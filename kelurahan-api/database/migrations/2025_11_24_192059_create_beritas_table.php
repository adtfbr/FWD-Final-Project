<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('beritas', function (Blueprint $table) {
            $table->id('id_berita');
            $table->string('judul');
            $table->string('slug')->unique();
            $table->text('isi');
            $table->string('gambar')->nullable();
            $table->foreignId('id_petugas')->constrained('petugas', 'id_petugas')->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('beritas');
    }
};
