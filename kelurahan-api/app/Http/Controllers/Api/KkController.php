<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Kk;
use App\Models\Penduduk;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class KkController extends Controller
{
    public function index(Request $request)
    {
        $query = Kk::withCount('penduduks');

        // Logika Pencarian
        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nama_kepala_keluarga', 'like', "%{$search}%")
                  ->orWhere('no_kk', 'like', "%{$search}%");
            });
        }

        // --- PERBAIKAN DISINI ---
        if ($request->has('limit') && $request->limit == 'all') {
            $kks = $query->orderBy('no_kk', 'asc')->get();
        } else {
            $kks = $query->orderBy('no_kk', 'asc')->paginate(10);
        }
        // ------------------------

        return response()->json([
            'success' => true,
            'message' => 'Daftar data KK berhasil diambil.',
            'data'    => $kks
        ], 200);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'no_kk' => 'required|string|size:16|unique:kks',
            'nama_kepala_keluarga' => 'required|string|max:255',
            'nik_kepala_keluarga' => 'required|string|size:16',
            'alamat' => 'required|string|max:255',
            'rt' => 'required|string|max:3',
            'rw' => 'required|string|max:3',
            'kelurahan' => 'required|string|max:100',
            'kecamatan' => 'required|string|max:100',
            'kabupaten' => 'nullable|string',
            'provinsi' => 'nullable|string',
            'kode_pos' => 'nullable|string',
            'jumlah_anggota' => 'nullable|integer',
            'tanggal_terbit' => 'nullable|date',
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

    public function show(string $id)
    {
        try {
            $kk = Kk::with('penduduks')->findOrFail($id);
            return response()->json([
                'success' => true,
                'message' => 'Detail data KK berhasil diambil.',
                'data' => $kk
            ], 200);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Data KK tidak ditemukan.'
            ], 404);
        }
    }

    public function update(Request $request, string $id)
    {
        try {
            $kk = Kk::findOrFail($id);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Data KK tidak ditemukan.'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'no_kk' => [
                'required',
                'string',
                'size:16',
                Rule::unique('kks')->ignore($id, 'id_kk')
            ],
            'nama_kepala_keluarga' => 'required|string|max:255',
            'nik_kepala_keluarga' => 'required|string|size:16',
            'alamat' => 'required|string|max:255',
            'rt' => 'required|string|max:3',
            'rw' => 'required|string|max:3',
            'kelurahan' => 'required|string|max:100',
            'kecamatan' => 'required|string|max:100',
            'kabupaten' => 'nullable|string',
            'provinsi' => 'nullable|string',
            'kode_pos' => 'nullable|string',
            'jumlah_anggota' => 'nullable|integer',
            'tanggal_terbit' => 'nullable|date',
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

    public function destroy(string $id)
    {
        try {
            $kk = Kk::findOrFail($id);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Data KK tidak ditemukan.'
            ], 404);
        }

        $jumlahPenduduk = Penduduk::where('id_kk', $id)->count();

        if ($jumlahPenduduk > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Hapus gagal. Data KK ini masih memiliki ' . $jumlahPenduduk . ' anggota penduduk. Pindahkan atau hapus penduduk terlebih dahulu.'
            ], 409);
        }

        $kk->delete();

        return response()->json([
            'success' => true,
            'message' => 'Data KK berhasil dihapus.'
        ], 200);
    }
}
