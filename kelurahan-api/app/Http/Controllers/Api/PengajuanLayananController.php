<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\PengajuanLayanan;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class PengajuanLayananController extends Controller
{
    /**
     * Store (Digunakan oleh WARGA)
     */
    public function store(Request $request)
    {
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

        $idUser = Auth::id();

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
     * Riwayat (Digunakan oleh WARGA)
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

    /**
     * Index (Digunakan oleh PETUGAS)
     */
    public function index()
    {
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
     * Show (Digunakan oleh PETUGAS)
     */
    public function show(string $id)
    {
        try {
            $pengajuan = PengajuanLayanan::with('user.penduduk', 'jenisLayanan', 'petugas')
                ->findOrFail($id);

            return response()->json([
                'success' => true,
                'message' => 'Detail pengajuan layanan berhasil diambil.',
                'data' => $pengajuan
            ], 200);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Data pengajuan tidak ditemukan.'
            ], 404);
        }
    }

    /**
     * Update Status (Digunakan oleh PETUGAS)
     */
    public function updateStatus(Request $request, string $id)
    {
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

        try {
            $pengajuan = PengajuanLayanan::findOrFail($id);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Data pengajuan tidak ditemukan.'
            ], 404);
        }

        $idPetugas = Auth::user()->id_petugas;

        $pengajuan->status = $request->status;
        $pengajuan->id_petugas = $idPetugas;
        $pengajuan->save();

        return response()->json([
            'success' => true,
            'message' => 'Status pengajuan berhasil diperbarui.',
            'data' => $pengajuan
        ], 200);
    }
}
