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
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PendudukController extends Controller
{
    public function index(Request $request)
    {
        $query = Penduduk::with('kk');

        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                  ->orWhere('nik', 'like', "%{$search}%");
            });
        }

        if ($request->has('limit') && $request->limit == 'all') {
            $penduduk = $query->orderBy('nama', 'asc')->get();
        } else {
            $penduduk = $query->orderBy('nama', 'asc')->paginate(10);
        }

        return response()->json([
            'success' => true,
            'message' => 'Daftar data penduduk berhasil diambil.',
            'data'    => $penduduk
        ], 200);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id_kk'         => 'required|integer|exists:kks,id_kk',
            'nik'           => 'required|string|size:16|unique:penduduks',
            'nama'          => 'required|string|max:255',
            'tanggal_lahir' => 'required|date',
            'jenis_kelamin' => 'required|in:L,P',
            'alamat'        => 'required|string',
            'email'         => 'nullable|string|email|max:255|unique:users',
            'password'      => 'nullable|string|min:8',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal.',
                'errors'  => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();
        try {
            $penduduk = Penduduk::create($request->only([
                'id_kk', 'nik', 'nama', 'tanggal_lahir', 'jenis_kelamin', 'alamat'
            ]));

            if ($request->filled('email') && $request->filled('password')) {
                User::create([
                    'name'        => $penduduk->nama,
                    'email'       => $request->email,
                    'password'    => Hash::make($request->password),
                    'role'        => 'warga',
                    'id_penduduk' => $penduduk->id_penduduk,
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Data penduduk baru berhasil ditambahkan.',
                'data'    => $penduduk
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal menambahkan data: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $penduduk = Penduduk::with('kk')->findOrFail($id);
            return response()->json([
                'success' => true,
                'message' => 'Detail data penduduk berhasil diambil.',
                'data'    => $penduduk
            ], 200);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Data penduduk tidak ditemukan.'
            ], 404);
        }
    }

    public function update(Request $request, $id)
    {
        DB::beginTransaction();

        try {
            $penduduk = Penduduk::findOrFail($id);
            $oldNik = $penduduk->nik;

            $validator = Validator::make($request->all(), [
                'id_kk' => 'required|integer|exists:kks,id_kk',
                'nik'   => [
                    'required', 'string', 'size:16',
                    Rule::unique('penduduks')->ignore($id, 'id_penduduk')
                ],
                'nama'          => 'required|string|max:255',
                'tanggal_lahir' => 'required|date',
                'jenis_kelamin' => 'required|in:L,P',
                'alamat'        => 'required|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal.',
                    'errors'  => $validator->errors()
                ], 422);
            }

            $penduduk->update($request->only([
                'id_kk', 'nik', 'nama', 'tanggal_lahir', 'jenis_kelamin', 'alamat'
            ]));

            $kk = $penduduk->kk;
            if ($kk && $kk->nik_kepala_keluarga === $oldNik) {
                $kk->update([
                    'nama_kepala_keluarga' => $penduduk->nama,
                    'nik_kepala_keluarga'  => $penduduk->nik
                ]);
            }

            $user = User::where('id_penduduk', $id)->first();
            if ($user) {
                $user->update(['name' => $penduduk->nama]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Data penduduk berhasil diperbarui.',
                'data'    => $penduduk
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

    public function destroy($id)
    {
        DB::beginTransaction();

        try {
            $penduduk = Penduduk::findOrFail($id);
            $user = User::where('id_penduduk', $id)->first();

            if ($user) {
                PengajuanLayanan::where('id_user', $user->id_user)->delete();
                $user->delete();
            }

            $penduduk->delete();
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Data penduduk berhasil dihapus.'
            ], 200);

        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Data tidak ditemukan.'
            ], 404);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Gagal hapus penduduk: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus: ' . $e->getMessage()
            ], 500);
        }
    }
}
