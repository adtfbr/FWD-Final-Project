<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\JenisLayananController;
use App\Http\Controllers\Api\PendudukController;
use App\Http\Controllers\Api\KkController;
use App\Http\Controllers\Api\PengajuanLayananController;
use App\Http\Controllers\Api\RegistrationController;
use App\Http\Controllers\Api\BeritaController;

// --- RUTE PUBLIK (Tanpa Login) ---
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

Route::get('/berita', [BeritaController::class, 'index']);
Route::get('/berita/{id}', [BeritaController::class, 'show']);

// Download File (Aman dari CORS)
Route::get('/file/download', [PengajuanLayananController::class, 'downloadFile']);

// --- RUTE TERPROTEKSI (Harus Login) ---
Route::middleware('auth:sanctum')->group(function () {

    // Profil & Logout
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // --- Rute Jenis Layanan (READ ONLY untuk Warga & Petugas) ---
    // Dipindah kesini agar Warga bisa akses dropdown form
    Route::get('/jenis-layanan', [JenisLayananController::class, 'index']);
    Route::get('/jenis-layanan/{id}', [JenisLayananController::class, 'show']);

    // --- Rute KHUSUS WARGA ---
    Route::middleware('role:warga')->group(function () {
        Route::post('/pengajuan-layanan', [PengajuanLayananController::class, 'store']);
        Route::get('/pengajuan-layanan/riwayat-saya', [PengajuanLayananController::class, 'riwayatSaya']);
    });

    // --- Rute KHUSUS PETUGAS (ADMIN) ---
    Route::middleware('role:petugas')->group(function () {

        // Manajemen Pengajuan
        Route::get('/pengajuan-layanan', [PengajuanLayananController::class, 'index']);
        Route::get('/pengajuan-layanan/{id}', [PengajuanLayananController::class, 'show']);
        Route::put('/pengajuan-layanan/{id}/status', [PengajuanLayananController::class, 'updateStatus']);

        // Manajemen Registrasi Warga
        Route::get('/registrations', [RegistrationController::class, 'index']);
        Route::put('/registrations/{id}/approve', [RegistrationController::class, 'approve']);
        Route::delete('/registrations/{id}/reject', [RegistrationController::class, 'reject']);

        // Manajemen Data Master (CRUD Penduduk & KK)
        Route::apiResource('/penduduk', PendudukController::class);
        Route::apiResource('/kk', KkController::class);

        // Manajemen Jenis Layanan (CREATE, UPDATE, DELETE)
        // (Index & Show sudah didefinisikan di atas untuk umum)
        Route::post('/jenis-layanan', [JenisLayananController::class, 'store']);
        Route::put('/jenis-layanan/{id}', [JenisLayananController::class, 'update']);
        Route::delete('/jenis-layanan/{id}', [JenisLayananController::class, 'destroy']);

        // Manajemen Berita
        Route::post('/berita', [BeritaController::class, 'store']);
        Route::delete('/berita/{id}', [BeritaController::class, 'destroy']);
    });
});
