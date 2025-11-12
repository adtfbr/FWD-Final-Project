<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Penduduk;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Database\Eloquent\ModelNotFoundException;

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

        return response()->json([
            'success' => true,
            'message' => 'Data penduduk baru berhasil ditambahkan.',
            'data' => $penduduk
        ], 201);
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

    public function destroy(string $id)
    {
        try {
            $penduduk = Penduduk::findOrFail($id);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Data penduduk tidak ditemukan.'
            ], 404);
        }

        User::where('id_penduduk', $penduduk->id_penduduk)->delete();
        $penduduk->delete();

        return response()->json([
            'success' => true,
            'message' => 'Data penduduk (dan akun login terkait) berhasil dihapus.'
        ], 200);
    }
}
