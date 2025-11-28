<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\PengajuanLayanan;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class PengajuanLayananController extends Controller
{
    public function index()
    {
        $pengajuan = PengajuanLayanan::with(['user.penduduk', 'jenisLayanan'])
            ->orderBy('tanggal_pengajuan', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar semua pengajuan layanan berhasil diambil.',
            'data'    => $pengajuan
        ], 200);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id_jenis_layanan' => 'required|exists:jenis_layanans,id_jenis_layanan',
            'keterangan'       => 'nullable|string',
            'file_persyaratan' => 'required|file|mimes:pdf,jpg,jpeg,png|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $path = null;
            if ($request->hasFile('file_persyaratan')) {
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

    public function updateStatus(Request $request, string $id)
    {
        $validator = Validator::make($request->all(), [
            'status'           => 'required|string|in:Diproses,Selesai,Ditolak',
            'file_surat_hasil' => 'nullable|file|mimes:pdf,jpg,png|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $pengajuan = PengajuanLayanan::findOrFail($id);

            $pengajuan->status = $request->status;
            $pengajuan->id_petugas = Auth::user()->id_petugas;

            if ($request->hasFile('file_surat_hasil')) {
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

    public function riwayatSaya(Request $request)
    {
        $idUser = $request->user()->id_user;

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

    public function indexForPetugas()
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

        if (!Storage::disk('public')->exists($path)) {
            return response()->json(['message' => 'File tidak ditemukan.'], 404);
        }

        return Storage::disk('public')->download($path);
    }
}
