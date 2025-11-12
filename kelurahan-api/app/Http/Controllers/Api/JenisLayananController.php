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
            'data' => $layanan
        ], 200);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nama_layanan' => 'required|string|max:255|unique:jenis_layanans',
            'deskripsi' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal.',
                'errors' => $validator->errors()
            ], 422);
        }

        $layanan = JenisLayanan::create($request->only(['nama_layanan', 'deskripsi']));

        return response()->json([
            'success' => true,
            'message' => 'Jenis layanan baru berhasil ditambahkan.',
            'data' => $layanan
        ], 201);
    }

    // Catatan: Fungsi show, update, dan destroy belum diimplementasikan
    // karena tidak ada di spesifikasi awal kita.
}
