<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\JenisLayanan; // <-- Tambahkan ini
use Illuminate\Support\Facades\Validator; // <-- Tambahkan ini

class JenisLayananController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Mengambil semua data jenis layanan
        $layanan = JenisLayanan::orderBy('nama_layanan', 'asc')->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar jenis layanan berhasil diambil.',
            'data' => $layanan
        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Validasi input
        $validator = Validator::make($request->all(), [
            'nama_layanan' => 'required|string|max:255|unique:jenis_layanans',
            'deskripsi' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal.',
                'errors' => $validator->errors()
            ], 422); // 422 Unprocessable Entity
        }

        // Simpan data baru
        $layanan = JenisLayanan::create([
            'nama_layanan' => $request->nama_layanan,
            'deskripsi' => $request->deskripsi,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Jenis layanan baru berhasil ditambahkan.',
            'data' => $layanan
        ], 201); // 201 Created
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        // (Kita bisa tambahkan ini nanti jika perlu)
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        // (Kita bisa tambahkan ini nanti jika perlu)
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        // (Kita bisa tambahkan ini nanti jika perlu)
    }
}
