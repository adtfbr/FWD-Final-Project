// Lokasi file: src/pages/user/WargaLogin.jsx

import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock } from "react-icons/fa";
import Logo from "../../components/Logo"; // <--- 1. IMPORT LOGO

const WargaLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { loginWarga } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await loginWarga(email, password);
      navigate("/profil"); // Diarahkan ke Home setelah login
    } catch (err) {
      if (err.code === "ERR_NETWORK" || err.code === "ERR_CONNECTION_REFUSED") {
        setError("Gagal terhubung ke server. Pastikan backend sudah dijalankan.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-blue-100 p-6">

      <div className="bg-white w-full max-w-4xl shadow-2xl rounded-3xl overflow-hidden flex flex-col lg:flex-row border border-white/50">

        {/* SISI KIRI — BRANDING DENGAN LOGO BARU */}
        <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-blue-600 to-blue-800 text-white p-12 flex-col justify-center items-center relative overflow-hidden">
          
          {/* Efek Lingkaran Dekorasi */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>

          <div className="relative z-10 text-center space-y-6">
            
            {/* 2. PASANG LOGO (Variant white-bg agar kontras di latar biru) */}
            <div className="transform hover:scale-105 transition-transform duration-500">
               <Logo className="h-40" variant="white-bg" />
            </div>

            <div>
              <h1 className="text-3xl font-extrabold tracking-wide text-white mt-4">
                Sistem Informasi
              </h1>
              <h2 className="text-xl font-medium text-blue-100">
                Pelayanan Desa Digital
              </h2>
            </div>

            <p className="text-sm text-blue-200 leading-relaxed max-w-xs mx-auto">
              Urus surat menyurat, cek status pengajuan, dan dapatkan informasi terbaru desa dalam satu genggaman.
            </p>
          </div>
        </div>

        {/* SISI KANAN — FORM LOGIN */}
        <div className="w-full lg:w-1/2 p-10 flex items-center justify-center bg-white">
          <div className="w-full max-w-md">
            
            {/* Logo Mobile (Hanya muncul di layar kecil) */}
            <div className="lg:hidden flex justify-center mb-6">
               <Logo className="h-24" />
            </div>

            <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">
              Selamat Datang Kembali
            </h2>
            <p className="text-center text-gray-500 text-sm mb-8">
              Silakan login untuk mengakses layanan.
            </p>

            {error && (
              <div className="alert alert-error py-2 mb-6 text-sm rounded-lg shadow-sm">
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <label className="font-semibold text-gray-700 text-sm ml-1">Email</label>
                <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-blue-500 transition-all focus-within:bg-white">
                  <FaEnvelope className="text-gray-400" />
                  <input
                    type="email"
                    className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-700 text-sm ml-1">Password</label>
                <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-blue-500 transition-all focus-within:bg-white">
                  <FaLock className="text-gray-400" />
                  <input
                    type="password"
                    className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn w-full bg-blue-600 text-white py-3 rounded-xl shadow-lg shadow-blue-600/30 hover:bg-blue-700 hover:shadow-blue-700/40 hover:-translate-y-0.5 transition-all font-semibold border-none h-auto"
                disabled={loading}
              >
                {loading ? <span className="loading loading-spinner"></span> : "Masuk ke Akun"}
              </button>
            </form>

            <div className="text-center mt-8 pt-6 border-t border-gray-100">
              <p className="text-gray-600 text-sm mb-3">Belum punya akun?</p>
              <Link
                to="/register"
                className="inline-block px-6 py-2 rounded-lg border border-blue-600 text-blue-600 font-semibold text-sm hover:bg-blue-50 transition-colors"
              >
                Daftar Sekarang
              </Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default WargaLogin;