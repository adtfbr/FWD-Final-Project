<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\JenisLayananController;
use App\Http\Controllers\Api\PendudukController;
use App\Http\Controllers\Api\KkController;
use App\Http\Controllers\Api\PengajuanLayananController;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // --- Rute Jenis Layanan ---
    Route::get('/jenis-layanan', [JenisLayananController::class, 'index']);
    Route::post('/jenis-layanan', [JenisLayananController::class, 'store'])->middleware('role:petugas');

    // --- Rute CRUD Penduduk ---
    Route::apiResource('/penduduk', PendudukController::class)->middleware('role:petugas');

    // --- Rute CRUD Kartu Keluarga (KK) ---
    Route::apiResource('/kk', KkController::class)->middleware('role:petugas');

    // --- Rute Pengajuan Layanan (Untuk WARGA) ---
    Route::middleware('role:warga')->group(function () {
        Route::post('/pengajuan-layanan', [PengajuanLayananController::class, 'store']);
        Route::get('/pengajuan-layanan/riwayat-saya', [PengajuanLayananController::class, 'riwayatSaya']);
    });

    // --- Rute Pengajuan Layanan (Untuk PETUGAS) ---
    Route::middleware('role:petugas')->group(function () {
        Route::get('/pengajuan-layanan', [PengajuanLayananController::class, 'index']);
        Route::get('/pengajuan-layanan/{id}', [PengajuanLayananController::class, 'show']);
        Route::put('/pengajuan-layanan/{id}/status', [PengajuanLayananController::class, 'updateStatus']);
    });
});
