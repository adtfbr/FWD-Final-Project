<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Penduduk; // <-- Tambahkan ini
use App\Models\User; // <-- Tambahkan ini
use Illuminate\Support\Facades\Validator; // <-- Tambahkan ini
use Illuminate\Support\Facades\Hash; // <-- Tambahkan ini
use Illuminate\Validation\Rule;

class PendudukController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Ambil semua data penduduk, urutkan berdasarkan nama
        // Muat juga relasi 'kk' (Kartu Keluarga)
        $penduduk = Penduduk::with('kk')->orderBy('nama', 'asc')->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar data penduduk berhasil diambil.',
            'data' => $penduduk
        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Validasi data (sesuai Model & Migrasi Anda)
        $validator = Validator::make($request->all(), [
            'id_kk' => 'required|integer|exists:kks,id_kk',
            'nik' => 'required|string|size:16|unique:penduduks',
            'nama' => 'required|string|max:255',
            'tanggal_lahir' => 'required|date',
            'jenis_kelamin' => 'required|in:L,P',
            'alamat' => 'required|string',

            // Validasi untuk data akun login (opsional)
            'email' => 'nullable|string|email|max:255|unique:users',
            'password' => 'nullable|string|min:8',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal.',
                'errors' => $validator->errors()
            ], 422);
        }

        // 1. Buat data Penduduk
        $penduduk = Penduduk::create([
            'id_kk' => $request->id_kk,
            'nik' => $request->nik,
            'nama' => $request->nama,
            'tanggal_lahir' => $request->tanggal_lahir,
            'jenis_kelamin' => $request->jenis_kelamin,
            'alamat' => $request->alamat,
        ]);

        // 2. Jika email dan password diisi, buatkan akun User untuknya
        if ($request->filled('email') && $request->filled('password')) {
            User::create([
                'name' => $penduduk->nama,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'warga', // Sesuai AuthController Anda
                'id_penduduk' => $penduduk->id_penduduk,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Data penduduk baru berhasil ditambahkan.',
            'data' => $penduduk
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        // Cari penduduk berdasarkan ID, muat juga data KK
        // findOrFail akan otomatis mengembalikan 404 jika tidak ditemukan
        try {
            $penduduk = Penduduk::with('kk')->findOrFail($id);

            return response()->json([
                'success' => true,
                'message' => 'Detail data penduduk berhasil diambil.',
                'data' => $penduduk
            ], 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Data penduduk tidak ditemukan.'
            ], 404);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        // 1. Cari data penduduk
        try {
            $penduduk = Penduduk::findOrFail($id);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Data penduduk tidak ditemukan.'
            ], 404);
        }

        // 2. Validasi (Mirip store, tapi NIK harus unik KECUALI untuk ID ini)
        $validator = Validator::make($request->all(), [
            'id_kk' => 'required|integer|exists:kks,id_kk',
            'nik' => [
                'required',
                'string',
                'size:16',
                // Peraturan unik: abaikan (ignore) id_penduduk saat ini
                Rule::unique('penduduks')->ignore($id, 'id_penduduk')
            ],
            'nama' => 'required|string|max:255',
            'tanggal_lahir' => 'required|date',
            'jenis_kelamin' => 'required|in:L,P',
            'alamat' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal.',
                'errors' => $validator->errors()
            ], 422);
        }

        // 3. Update data
        $penduduk->update($request->all());

        // (Catatan: Ini belum menangani update email/password akun login,
        // kita fokus di biodata penduduk dulu sesuai Model)

        return response()->json([
            'success' => true,
            'message' => 'Data penduduk berhasil diperbarui.',
            'data' => $penduduk
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        // 1. Cari data penduduk
        try {
            $penduduk = Penduduk::findOrFail($id);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Data penduduk tidak ditemukan.'
            ], 404);
        }

        // 2. Hapus akun user yang terkait (jika ada)
        // Ini penting untuk menghindari 'orphaned' user account
        User::where('id_penduduk', $penduduk->id_penduduk)->delete();

        // 3. Hapus data penduduk
        $penduduk->delete();

        return response()->json([
            'success' => true,
            'message' => 'Data penduduk (dan akun login terkait) berhasil dihapus.'
        ], 200);
    }
}
