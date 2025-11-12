<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\JenisLayananController;
use App\Http\Controllers\Api\PendudukController;
use App\Http\Controllers\Api\KkController;
use App\Http\Controllers\Api\PengajuanLayananController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Rute Publik (tidak perlu login)
Route::post('/login', [AuthController::class, 'login']);

// Rute Terproteksi (wajib login / butuh token)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // GET ini bisa diakses semua role (petugas & penduduk)
    Route::get('/jenis-layanan', [JenisLayananController::class, 'index']);

    // POST ini HANYA bisa diakses oleh 'petugas'
    Route::post('/jenis-layanan', [JenisLayananController::class, 'store'])->middleware('role:petugas');

    // --- Rute CRUD Penduduk
    Route::apiResource('/penduduk', PendudukController::class)->middleware('role:petugas');

    // --- Rute CRUD Kartu Keluarga (KK)
    Route::apiResource('/kk', KkController::class)->middleware('role:petugas');

    // --- Rute Baru: Pengajuan Layanan (Untuk WARGA) ---
    Route::middleware('role:warga')->group(function () {
        // Endpoint untuk warga membuat pengajuan baru
        Route::post('/pengajuan-layanan', [PengajuanLayananController::class, 'store']);

        // Endpoint untuk warga melihat riwayat pengajuannya
        Route::get('/pengajuan-layanan/riwayat-saya', [PengajuanLayananController::class, 'riwayatSaya']);
    });

    // --- Rute Baru: Pengajuan Layanan (Untuk PETUGAS) ---
    Route::middleware('role:petugas')->group(function () {
        // Endpoint untuk petugas melihat SEMUA pengajuan
        Route::get('/pengajuan-layanan', [PengajuanLayananController::class, 'index']);

        // Endpoint untuk petugas melihat DETAIL satu pengajuan
        Route::get('/pengajuan-layanan/{id}', [PengajuanLayananController::class, 'show']);

        // Endpoint untuk petugas mengubah STATUS pengajuan
        Route::put('/pengajuan-layanan/{id}/status', [PengajuanLayananController::class, 'updateStatus']);
    });
    // --- (Di sini nanti kita akan menambahkan rute untuk penduduk, kk, dll.) ---
});
