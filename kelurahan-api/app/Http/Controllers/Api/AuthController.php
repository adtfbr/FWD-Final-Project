<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Penduduk;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Email atau password salah'], 401);
        }

        if ($user->status !== 'active') {
            return response()->json([
                'message' => 'Akun Anda belum aktif. Silakan hubungi petugas atau tunggu verifikasi.'
            ], 403);
        }

        if ($user->role === 'warga') {
            $user->load('penduduk');
        } elseif ($user->role === 'petugas') {
            $user->load('petugas');
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login berhasil',
            'data'    => [
                'user'  => $user,
                'token' => $token,
            ]
        ]);
    }

    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nik'      => 'required|string|size:16|exists:penduduks,nik',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|min:8',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $penduduk = Penduduk::where('nik', $request->nik)->first();

        $existingUser = User::where('id_penduduk', $penduduk->id_penduduk)->first();
        if ($existingUser) {
            return response()->json(['message' => 'NIK ini sudah terdaftar memiliki akun.'], 409);
        }

        $user = User::create([
            'name'        => $penduduk->nama,
            'email'       => $request->email,
            'password'    => Hash::make($request->password),
            'role'        => 'warga',
            'status'      => 'pending',
            'id_penduduk' => $penduduk->id_penduduk,
        ]);

        return response()->json([
            'message' => 'Registrasi berhasil. Silakan tunggu verifikasi dari petugas agar akun Anda aktif.',
            'data'    => $user
        ], 201);
    }

    public function me(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'warga') {
            $user->load('penduduk');
        } elseif ($user->role === 'petugas') {
            $user->load('petugas');
        }

        return response()->json($user);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logout berhasil']);
    }
}
