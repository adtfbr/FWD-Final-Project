// File: src/pages/user/WargaLogin.jsx

import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { FaBuilding, FaEnvelope, FaLock } from "react-icons/fa";

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
      navigate("/profil");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to- from-blue-100 to-blue-200 p-8">

      {/* --- CARD LOGIN (DESAIN BARU SUPER ELEGAN) --- */}
      <div className="bg-white w-full max-w-4xl shadow-2xl rounded-3xl overflow-hidden flex flex-col lg:flex-row">

        {/* SISI KIRI — BRAND ADEM */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to- from-blue-500 to-blue-700 text-white p-12 flex-col justify-center">
  <div className="text-center space-y-5">

    <FaBuilding className="text-7xl mx-auto text-blue-900" />

    <h1 className="text-4xl font-extrabold tracking-wide text-blue-900">
      Portal Warga
    </h1>

    <p className="text-lg leading-relaxed text-blue-900">
      Sistem layanan digital modern untuk semua warga kelurahan.
    </p>

  </div>
</div>


        {/* SISI KANAN — FORM LOGIN */}
        <div className="w-full lg:w-1/2 p-10 flex items-center justify-center">

          <div className="w-full max-w-md">

            <h2 className="text-3xl font-bold text-blue-800 text-center mb-6">
              Masuk ke Akun Warga
            </h2>

            {error && (
              <div className="alert alert-warning py-2 mb-4">
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* EMAIL */}
              <div className="space-y-2">
                <label className="font-semibold text-gray-700">Email</label>
                <div className="flex items-center gap-3 border rounded-xl px-4 py-3 bg-gray-50 focus-within:ring-2 focus-within:ring-blue-400 transition-all">
                  <FaEnvelope className="text-gray-500" />
                  <input
                    type="email"
                    className="w-full bg-transparent outline-none"
                    placeholder="email@contoh.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div className="space-y-2">
                <label className="font-semibold text-gray-700">Password</label>
                <div className="flex items-center gap-3 border rounded-xl px-4 py-3 bg-gray-50 focus-within:ring-2 focus-within:ring-blue-400 transition-all">
                  <FaLock className="text-gray-500" />
                  <input
                    type="password"
                    className="w-full bg-transparent outline-none"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* TOMBOL LOGIN */}
              <button
                type="submit"
                className="btn w-full bg-blue-600 text-white py-3 rounded-xl shadow-lg hover:bg-blue-700 hover:scale-[1.02] transition-all font-semibold"
                disabled={loading}
              >
                {loading ? (
                  <span className="loading loading-spinner"></span>
                ) : (
                  "Masuk"
                )}
              </button>
            </form>

            <div className="text-center mt-6">
              <p className="text-gray-600 mb-2">Belum punya akun?</p>
              <Link
                to="/register"
                className="btn btn-outline border-blue-600 text-blue-600 w-full rounded-xl hover:bg-blue-50 transition-all"
              >
                Buat Akun Baru
              </Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default WargaLogin;
