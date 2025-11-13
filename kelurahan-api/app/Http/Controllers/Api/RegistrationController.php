<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;

class RegistrationController extends Controller
{
    public function index()
    {
        $pendingUsers = User::where('status', 'pending')
                            ->where('role', 'warga')
                            ->with('penduduk')
                            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar pendaftaran tertunda berhasil diambil.',
            'data'    => $pendingUsers
        ]);
    }

    public function approve($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'User tidak ditemukan'], 404);
        }

        $user->status = 'active';
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Akun warga berhasil diaktifkan.',
            'data'    => $user
        ]);
    }

    public function reject($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'User tidak ditemukan'], 404);
        }

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'Pendaftaran ditolak dan akun user dihapus.'
        ]);
    }
}
