<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Berita;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class BeritaController extends Controller
{
    // PUBLIC: Untuk ditampilkan di Halaman Warga
    public function index()
    {
        $berita = Berita::with('petugas')->orderBy('created_at', 'desc')->get();
        return response()->json(['success' => true, 'data' => $berita]);
    }

    // PUBLIC: Detail Berita
    public function show($id)
    {
        $berita = Berita::with('petugas')->find($id);
        if (!$berita) return response()->json(['message' => 'Berita tidak ditemukan'], 404);
        return response()->json(['success' => true, 'data' => $berita]);
    }

    // ADMIN: Tambah Berita
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'judul'  => 'required|string|max:255',
            'isi'    => 'required|string',
            'gambar' => 'nullable|image|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $path = null;
        if ($request->hasFile('gambar')) {
            $path = $request->file('gambar')->store('berita', 'public');
        }

        $berita = Berita::create([
            'judul'      => $request->judul,
            'slug'       => Str::slug($request->judul) . '-' . time(),
            'isi'        => $request->isi,
            'gambar'     => $path,
            'id_petugas' => Auth::user()->id_petugas,
        ]);

        return response()->json(['success' => true, 'message' => 'Berita berhasil diposting.', 'data' => $berita], 201);
    }

    // ADMIN: Hapus Berita
    public function destroy($id)
    {
        $berita = Berita::find($id);
        if (!$berita) return response()->json(['message' => 'Berita tidak ditemukan'], 404);

        if ($berita->gambar) {
            Storage::disk('public')->delete($berita->gambar);
        }

        $berita->delete();
        return response()->json(['success' => true, 'message' => 'Berita dihapus.']);
    }
}
