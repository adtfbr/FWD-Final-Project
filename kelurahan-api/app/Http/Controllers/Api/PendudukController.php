<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Penduduk;
use App\Models\User;
use App\Models\PengajuanLayanan;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB; // Tambahkan ini untuk Transaction
use Illuminate\Support\Facades\Log; // Tambahkan ini untuk Logging error

class PendudukController extends Controller
{
    public function index()
    {
        $penduduk = Penduduk::with('kk')->orderBy('nama', 'asc')->get();
        return response()->json([
            'success' => true,
            'message' => 'Daftar data penduduk berhasil diambil.',
            'data' => $penduduk
        ], 200);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id_kk' => 'required|integer|exists:kks,id_kk',
            'nik' => 'required|string|size:16|unique:penduduks',
            'nama' => 'required|string|max:255',
            'tanggal_lahir' => 'required|date',
            'jenis_kelamin' => 'required|in:L,P',
            'alamat' => 'required|string',
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

        // Gunakan transaction untuk memastikan integritas data saat create
        DB::beginTransaction();
        try {
            $penduduk = Penduduk::create($request->only([
                'id_kk', 'nik', 'nama', 'tanggal_lahir', 'jenis_kelamin', 'alamat'
            ]));

            if ($request->filled('email') && $request->filled('password')) {
                User::create([
                    'name' => $penduduk->nama,
                    'email' => $request->email,
                    'password' => Hash::make($request->password),
                    'role' => 'warga',
                    'id_penduduk' => $penduduk->id_penduduk,
                ]);
            }

            DB::commit(); // Simpan perubahan jika semua sukses

            return response()->json([
                'success' => true,
                'message' => 'Data penduduk baru berhasil ditambahkan.',
                'data' => $penduduk
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack(); // Batalkan jika ada error
            return response()->json([
                'success' => false,
                'message' => 'Gagal menambahkan data: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show(string $id)
    {
        try {
            $penduduk = Penduduk::with('kk')->findOrFail($id);
            return response()->json([
                'success' => true,
                'message' => 'Detail data penduduk berhasil diambil.',
                'data' => $penduduk
            ], 200);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Data penduduk tidak ditemukan.'
            ], 404);
        }
    }

    public function update(Request $request, string $id)
    {
        try {
            $penduduk = Penduduk::findOrFail($id);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Data penduduk tidak ditemukan.'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'id_kk' => 'required|integer|exists:kks,id_kk',
            'nik' => [
                'required',
                'string',
                'size:16',
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

        $penduduk->update($request->only([
             'id_kk', 'nik', 'nama', 'tanggal_lahir', 'jenis_kelamin', 'alamat'
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Data penduduk berhasil diperbarui.',
            'data' => $penduduk
        ], 200);
    }

    /**
     * Menghapus data penduduk dengan Transaction & Cascade Delete Manual
     */
    public function destroy(string $id)
    {
        // Mulai Database Transaction
        DB::beginTransaction();

        try {
            $penduduk = Penduduk::findOrFail($id);

            // 1. Hapus Pengajuan Layanan (Relasi: Penduduk -> Pengajuan)
            // Gunakan query builder delete() agar lebih cepat dan menghindari masalah event model
            $deletedPengajuan = PengajuanLayanan::where('id_penduduk', $id)->delete();

            // 2. Hapus User Login (Relasi: Penduduk -> User)
            $deletedUser = User::where('id_penduduk', $id)->delete();

            // 3. Hapus Penduduk itu sendiri
            $penduduk->delete();

            // Jika sampai sini tidak ada error, commit perubahan ke database
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Data penduduk beserta akun dan riwayat layanan berhasil dihapus.'
            ], 200);

        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Data penduduk tidak ditemukan.'
            ], 404);

        } catch (\Illuminate\Database\QueryException $e) {
            DB::rollBack();
            // Cek error spesifik MySQL/MariaDB Foreign Key
            if ($e->errorInfo[1] == 1451) {
                return response()->json([
                    'success' => false,
                    'message' => 'Gagal menghapus: Data ini masih digunakan di tabel lain (misal: Kepala Keluarga di tabel KK). Hapus/ubah data di tabel terkait terlebih dahulu.'
                ], 409);
            }

            Log::error('Query Exception delete penduduk: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Database error: ' . $e->errorInfo[2]
            ], 500);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('General Exception delete penduduk: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan server: ' . $e->getMessage()
            ], 500);
        }
    }
}
