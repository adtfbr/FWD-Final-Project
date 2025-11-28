<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\JenisLayananController;
use App\Http\Controllers\Api\PendudukController;
use App\Http\Controllers\Api\KkController;
use App\Http\Controllers\Api\PengajuanLayananController;
use App\Http\Controllers\Api\RegistrationController;
use App\Http\Controllers\Api\BeritaController;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

Route::get('/berita', [BeritaController::class, 'index']);
Route::get('/berita/{id}', [BeritaController::class, 'show']);

Route::get('/file/download', [PengajuanLayananController::class, 'downloadFile']);

Route::middleware('auth:sanctum')->group(function () {

    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/jenis-layanan', [JenisLayananController::class, 'index']);
    Route::get('/jenis-layanan/{id}', [JenisLayananController::class, 'show']);

    Route::middleware('role:warga')->group(function () {
        Route::post('/pengajuan-layanan', [PengajuanLayananController::class, 'store']);
        Route::get('/pengajuan-layanan/riwayat-saya', [PengajuanLayananController::class, 'riwayatSaya']);
    });

    Route::middleware('role:petugas')->group(function () {

        Route::get('/pengajuan-layanan', [PengajuanLayananController::class, 'index']);
        Route::get('/pengajuan-layanan/{id}', [PengajuanLayananController::class, 'show']);
        Route::put('/pengajuan-layanan/{id}/status', [PengajuanLayananController::class, 'updateStatus']);

        Route::get('/registrations', [RegistrationController::class, 'index']);
        Route::put('/registrations/{id}/approve', [RegistrationController::class, 'approve']);
        Route::delete('/registrations/{id}/reject', [RegistrationController::class, 'reject']);

        Route::apiResource('/penduduk', PendudukController::class);
        Route::apiResource('/kk', KkController::class);

        Route::post('/jenis-layanan', [JenisLayananController::class, 'store']);
        Route::put('/jenis-layanan/{id}', [JenisLayananController::class, 'update']);
        Route::delete('/jenis-layanan/{id}', [JenisLayananController::class, 'destroy']);

        Route::post('/berita', [BeritaController::class, 'store']);
        Route::put('/berita/{id}', [BeritaController::class, 'update']);
        Route::delete('/berita/{id}', [BeritaController::class, 'destroy']);
    });
});
