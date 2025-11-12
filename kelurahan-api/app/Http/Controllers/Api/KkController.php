<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Kk; // <-- Model KK
use App\Models\Penduduk; // <-- Model Penduduk (untuk cek hapus)
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class KkController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Ambil semua data KK, urutkan berdasarkan No. KK
        $kks = Kk::orderBy('no_kk', 'asc')->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar data KK berhasil diambil.',
            'data' => $kks
        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Validasi berdasarkan seeder Anda
        $validator = Validator::make($request->all(), [
            'no_kk' => 'required|string|size:16|unique:kks',
            'alamat' => 'required|string|max:255',
            'rt' => 'required|string|max:3',
            'rw' => 'required|string|max:3',
            'kelurahan' => 'required|string|max:100',
            'kecamatan' => 'required|string|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal.',
                'errors' => $validator->errors()
            ], 422);
        }

        $kk = Kk::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Data KK baru berhasil ditambahkan.',
            'data' => $kk
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try {
            // Ambil data KK dan juga data 'penduduks' (anggota keluarganya)
            $kk = Kk::with('penduduks')->findOrFail($id);

            return response()->json([
                'success' => true,
                'message' => 'Detail data KK berhasil diambil.',
                'data' => $kk
            ], 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Data KK tidak ditemukan.'
            ], 404);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        try {
            $kk = Kk::findOrFail($id);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Data KK tidak ditemukan.'
            ], 404);
        }

        // Validasi
        $validator = Validator::make($request->all(), [
            'no_kk' => [
                'required',
                'string',
                'size:16',
                Rule::unique('kks')->ignore($id, 'id_kk') // Unik, kecuali untuk ID ini
            ],
            'alamat' => 'required|string|max:255',
            'rt' => 'required|string|max:3',
            'rw' => 'required|string|max:3',
            'kelurahan' => 'required|string|max:100',
            'kecamatan' => 'required|string|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal.',
                'errors' => $validator->errors()
            ], 422);
        }

        $kk->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Data KK berhasil diperbarui.',
            'data' => $kk
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            $kk = Kk::findOrFail($id);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Data KK tidak ditemukan.'
            ], 404);
        }

        // PENTING: Cek apakah KK ini masih memiliki anggota (penduduk)
        // Kita tidak bisa hapus KK jika masih ada penduduk di dalamnya
        // karena akan menyebabkan error Foreign Key constraint.

        $jumlahPenduduk = Penduduk::where('id_kk', $id)->count();

        if ($jumlahPenduduk > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Hapus gagal. Data KK ini masih memiliki ' . $jumlahPenduduk . ' anggota penduduk. Pindahkan atau hapus penduduk terlebih dahulu.'
            ], 409); // 409 Conflict
        }

        // Jika tidak ada anggota, aman untuk dihapus
        $kk->delete();

        return response()->json([
            'success' => true,
            'message' => 'Data KK berhasil dihapus.'
        ], 200);
    }
}
