<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\JenisLayanan;
use Illuminate\Support\Facades\Validator;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class JenisLayananController extends Controller
{
    public function index()
    {
        $layanan = JenisLayanan::orderBy('nama_layanan', 'asc')->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar jenis layanan berhasil diambil.',
            'data'    => $layanan
        ], 200);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nama_layanan' => 'required|string|max:255|unique:jenis_layanans',
            'deskripsi'    => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal.',
                'errors'  => $validator->errors()
            ], 422);
        }

        $layanan = JenisLayanan::create($request->only(['nama_layanan', 'deskripsi']));

        return response()->json([
            'success' => true,
            'message' => 'Jenis layanan baru berhasil ditambahkan.',
            'data'    => $layanan
        ], 201);
    }

    public function show($id)
    {
        try {
            $layanan = JenisLayanan::findOrFail($id);
            return response()->json([
                'success' => true,
                'data'    => $layanan
            ], 200);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Data layanan tidak ditemukan.'], 404);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $layanan = JenisLayanan::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'nama_layanan' => 'required|string|max:255|unique:jenis_layanans,nama_layanan,' . $id . ',id_jenis_layanan',
                'deskripsi'    => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal.',
                    'errors'  => $validator->errors()
                ], 422);
            }

            $layanan->update($request->only(['nama_layanan', 'deskripsi']));

            return response()->json([
                'success' => true,
                'message' => 'Jenis layanan berhasil diperbarui.',
                'data'    => $layanan
            ], 200);

        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Data tidak ditemukan.'], 404);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Terjadi kesalahan: ' . $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $layanan = JenisLayanan::findOrFail($id);
            $layanan->delete();

            return response()->json([
                'success' => true,
                'message' => 'Jenis layanan berhasil dihapus.'
            ], 200);

        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Data tidak ditemukan.'], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus data. Kemungkinan data ini sedang digunakan dalam riwayat pengajuan.'
            ], 500);
        }
    }
}
