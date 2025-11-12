<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\PengajuanLayanan;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Database\Eloquent\ModelNotFoundException; // <-- Tambahkan ini

class PengajuanLayananController extends Controller
{
    /**
     * Store a newly created resource in storage.
     * (Digunakan oleh WARGA)
     * (STATUS: SUDAH BENAR)
     */
    public function store(Request $request)
    {
        // 1. Validasi input
        $validator = Validator::make($request->all(), [
            'id_jenis_layanan' => 'required|integer|exists:jenis_layanans,id_jenis_layanan',
            'keterangan' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal.',
                'errors' => $validator->errors()
            ], 422);
        }

        // 2. Dapatkan id_user dari user yang sedang login
        $idUser = Auth::id();

        // 3. Buat pengajuan baru
        $pengajuan = PengajuanLayanan::create([
            'id_user' => $idUser,
            'id_jenis_layanan' => $request->id_jenis_layanan,
            'keterangan' => $request->keterangan,
            'status' => 'Diajukan',
            'tanggal_pengajuan' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pengajuan layanan berhasil dikirim.',
            'data' => $pengajuan
        ], 201);
    }

    /**
     * Menampilkan riwayat pengajuan milik user yang sedang login.
     * (Digunakan oleh WARGA)
     * (STATUS: SUDAH BENAR)
     */
    public function riwayatSaya()
    {
        $idUser = Auth::id();

        $riwayat = PengajuanLayanan::with('jenisLayanan')
            ->where('id_user', $idUser)
            ->orderBy('tanggal_pengajuan', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Riwayat pengajuan berhasil diambil.',
            'data' => $riwayat
        ], 200);
    }


    // --- FUNGSI UNTUK PETUGAS ---

    /**
     * Display a listing of the resource.
     * (Digunakan oleh PETUGAS)
     */
    public function index()
    {
        // --- DIPERBAIKI ---
        // Relasi Anda adalah ke 'user', lalu 'user' ke 'penduduk'.
        // Jadi kita panggil relasinya sebagai 'user.penduduk'.
        $pengajuan = PengajuanLayanan::with('user.penduduk', 'jenisLayanan')
            ->orderBy('tanggal_pengajuan', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar semua pengajuan layanan berhasil diambil.',
            'data' => $pengajuan
        ], 200);
    }

    /**
     * Display the specified resource.
     * (Digunakan oleh PETUGAS)
     */
    public function show(string $id)
    {
        try {
            // --- DIPERBAIKI ---
            // Sama seperti index, kita panggil 'user.penduduk'
            $pengajuan = PengajuanLayanan::with('user.penduduk', 'jenisLayanan', 'petugas')
                ->findOrFail($id);

            return response()->json([
                'success' => true,
                'message' => 'Detail pengajuan layanan berhasil diambil.',
                'data' => $pengajuan
            ], 200);
        } catch (ModelNotFoundException $e) { // <-- Dirapikan
            return response()->json([
                'success' => false,
                'message' => 'Data pengajuan tidak ditemukan.'
            ], 404);
        }
    }

    /**
     * Update the status of the specified resource in storage.
     * (Digunakan oleh PETUGAS untuk ubah status)
     */
    public function updateStatus(Request $request, string $id)
    {
        // 1. Validasi status yang masuk
        // --- DIPERBAIKI ---
        // Menghapus validasi 'catatan_petugas' karena tidak ada di migrasi Anda
        $validator = Validator::make($request->all(), [
            'status' => 'required|string|in:Diproses,Selesai,Ditolak',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal: Status tidak valid.',
                'errors' => $validator->errors()
            ], 422);
        }

        // 2. Cari pengajuan
        try {
            $pengajuan = PengajuanLayanan::findOrFail($id);
        } catch (ModelNotFoundException $e) { // <-- Dirapikan
            return response()->json([
                'success' => false,
                'message' => 'Data pengajuan tidak ditemukan.'
            ], 404);
        }

        // 3. Dapatkan id_petugas dari user yang sedang login
        $idPetugas = Auth::user()->id_petugas;

        // 4. Update data
        $pengajuan->status = $request->status;
        $pengajuan->id_petugas = $idPetugas; // Catat siapa petugas yg memproses

        // --- DIPERBAIKI ---
        // Menghapus 'catatan_petugas' dan 'tanggal_selesai'
        // karena tidak ada di file migrasi yang Anda kirimkan.

        // $pengajuan->catatan_petugas = $request->catatan_petugas; // <-- DIHAPUS
        // if (in_array($request->status, ['Selesai', 'Ditolak'])) {
        //     $pengajuan->tanggal_selesai = now(); // <-- DIHAPUS
        // }

        $pengajuan->save();

        return response()->json([
            'success' => true,
            'message' => 'Status pengajuan berhasil diperbarui.',
            'data' => $pengajuan
        ], 200);
    }
}
