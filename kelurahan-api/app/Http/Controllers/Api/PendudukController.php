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
    public function index(Request $request)
    {
        $query = Penduduk::with('kk');

        // Logika Pencarian
        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                  ->orWhere('nik', 'like', "%{$search}%");
            });
        }

        // --- PERBAIKAN DISINI ---
        // Jika ada parameter ?limit=all, ambil semua data (get)
        // Jika tidak, gunakan pagination (paginate)
        if ($request->has('limit') && $request->limit == 'all') {
            $penduduk = $query->orderBy('nama', 'asc')->get();
        } else {
            $penduduk = $query->orderBy('nama', 'asc')->paginate(10);
        }
        // ------------------------

        return response()->json([
            'success' => true,
            'message' => 'Daftar data penduduk berhasil diambil.',
            'data'    => $penduduk
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
        // Mulai Transaksi Database agar aman
        DB::beginTransaction();

        try {
            $penduduk = Penduduk::findOrFail($id);

            // 1. Simpan NIK lama sebelum di-update untuk pengecekan nanti
            $oldNik = $penduduk->nik;

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

            // 2. Update Data Penduduk
            $penduduk->update($request->only([
                 'id_kk', 'nik', 'nama', 'tanggal_lahir', 'jenis_kelamin', 'alamat'
            ]));

            // 3. Cek Sinkronisasi dengan Data KK
            // Ambil data KK yang terhubung
            $kk = $penduduk->kk;

            // Jika KK ditemukan DAN NIK lama penduduk ini sama dengan NIK Kepala Keluarga di tabel KK
            if ($kk && $kk->nik_kepala_keluarga === $oldNik) {
                // Maka update juga data di tabel KK agar sinkron
                $kk->update([
                    'nama_kepala_keluarga' => $penduduk->nama,
                    'nik_kepala_keluarga'  => $penduduk->nik // Update NIK juga jaga-jaga kalau NIK-nya diedit
                ]);
            }

            // Jika ada user login yang terhubung, update juga namanya
            // (Opsional: agar nama di dashboard/profil langsung berubah)
            $user = User::where('id_penduduk', $id)->first();
            if ($user) {
                $user->update(['name' => $penduduk->nama]);
            }

            DB::commit(); // Simpan semua perubahan

            return response()->json([
                'success' => true,
                'message' => 'Data penduduk berhasil diperbarui (Data KK sinkron).',
                'data' => $penduduk
            ], 200);

        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Data penduduk tidak ditemukan.'
            ], 404);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Gagal update penduduk: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan server.'
            ], 500);
        }
    }

    /**
     * Menghapus data penduduk dengan Transaction & Cascade Delete Manual
     */
    public function destroy(string $id)
    {
        DB::beginTransaction();

        try {
            $penduduk = Penduduk::findOrFail($id);

            // 1. Cari User yang terhubung dengan Penduduk ini
            $user = User::where('id_penduduk', $id)->first();

            if ($user) {
                // 2. Hapus Pengajuan Layanan milik User ini (karena relasinya ke id_user)
                PengajuanLayanan::where('id_user', $user->id_user)->delete();

                // 3. Hapus User
                $user->delete();
            }

            // 4. Hapus Penduduk
            $penduduk->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Data penduduk berhasil dihapus.'
            ], 200);

        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json(['message' => 'Data tidak ditemukan.'], 404);

        } catch (\Exception $e) {
            DB::rollBack();
            // Log error agar developer tahu (opsional)
            Log::error('Gagal hapus penduduk: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus: ' . $e->getMessage()
            ], 500);
        }
    }
}
