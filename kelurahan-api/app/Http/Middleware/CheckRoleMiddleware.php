<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth; // <-- Tambahkan ini

class CheckRoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  $role  // <-- Tambahkan parameter $role
     */
    public function handle(Request $request, Closure $next, $role): Response
    {
        // Cek apakah pengguna sudah login DAN rolenya sesuai
        if (Auth::check() && Auth::user()->role == $role) {
            // Jika sesuai (misal: 'petugas' == 'petugas'), lanjutkan request
            return $next($request);
        }

        // Jika tidak sesuai, kirim respon error 'Forbidden' (Dilarang)
        return response()->json([
            'success' => false,
            'message' => 'Akses ditolak. Anda tidak memiliki hak akses yang sesuai.'
        ], 403); // 403 Forbidden
    }
}
