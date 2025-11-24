<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePengajuanLayananRequest;
use Illuminate\Http\Request;
use App\Models\PengajuanLayanan;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class PengajuanLayananController extends Controller
{
    /**
     * Store (Digunakan oleh WARGA)
     * Menggunakan Form Request untuk validasi otomatis
     */
    public function store(Request $request)
    {
        // Validasi Manual karena kita butuh handle file
        $validator = Validator::make($request->all(), [
            'id_jenis_layanan' => 'required|exists:jenis_layanans,id_jenis_layanan',
            'keterangan'       => 'nullable|string',
            'file_persyaratan' => 'required|file|mimes:pdf,jpg,jpeg,png|max:2048', // Max 2MB
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $path = null;
            if ($request->hasFile('file_persyaratan')) {
                // Simpan ke folder 'public/persyaratan'
                $path = $request->file('file_persyaratan')->store('persyaratan', 'public');
            }

            $pengajuan = PengajuanLayanan::create([
                'id_user'           => $request->user()->id_user,
                'id_jenis_layanan'  => $request->id_jenis_layanan,
                'keterangan'        => $request->keterangan,
                'file_persyaratan'  => $path,
                'status'            => 'Diajukan',
                'tanggal_pengajuan' => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Pengajuan layanan berhasil dikirim.',
                'data'    => $pengajuan
            ], 201);

        } catch (\Exception $e) {
            Log::error('Gagal menyimpan pengajuan: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan internal.',
            ], 500);
        }
    }

    // Update Status (Admin Upload Hasil Surat)
    public function updateStatus(Request $request, string $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|string|in:Diproses,Selesai,Ditolak',
            // Jika status selesai, admin BISA (opsional/wajib) upload file hasil
            'file_surat_hasil' => 'nullable|file|mimes:pdf,jpg,png|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $pengajuan = PengajuanLayanan::findOrFail($id);

            // Update data
            $pengajuan->status = $request->status;
            $pengajuan->id_petugas = Auth::user()->id_petugas;

            // Jika ada file hasil yang diupload admin
            if ($request->hasFile('file_surat_hasil')) {
                // Hapus file lama jika ada (biar tidak numpuk sampah)
                if ($pengajuan->file_surat_hasil) {
                    Storage::disk('public')->delete($pengajuan->file_surat_hasil);
                }
                $path = $request->file('file_surat_hasil')->store('surat_hasil', 'public');
                $pengajuan->file_surat_hasil = $path;
            }

            $pengajuan->save();

            return response()->json([
                'success' => true,
                'message' => 'Status pengajuan berhasil diperbarui.',
                'data'    => $pengajuan
            ], 200);

        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Data tidak ditemukan.'], 404);
        }
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
            'data'    => $riwayat
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
            'data'    => $pengajuan
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
                'data'    => $pengajuan
            ], 200);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Data pengajuan tidak ditemukan.'
            ], 404);
        }
    }

    public function downloadFile(Request $request)
    {
        $path = $request->query('path');

        // Pastikan file ada di storage public
        if (!Storage::disk('public')->exists($path)) {
            return response()->json(['message' => 'File tidak ditemukan.'], 404);
        }

        // Gunakan fungsi download bawaan Laravel (Otomatis set header CORS & Attachment)
        return Storage::disk('public')->download($path);
    }

}
