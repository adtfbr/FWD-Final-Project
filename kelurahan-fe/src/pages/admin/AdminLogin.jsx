import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Logo from "../../components/Logo";
import { FaEnvelope, FaLock } from "react-icons/fa";

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { loginPetugas } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await loginPetugas(email, password);
      navigate('/admin/dashboard');
    } catch (err) {
      if (err.code === "ERR_NETWORK" || err.code === "ERR_CONNECTION_REFUSED") {
        setError("Gagal terhubung ke server. Pastikan backend sudah dijalankan.");
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("Terjadi kesalahan yang tidak diketahui.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-100 to-blue-200 px-6">
      <div className="bg-white w-full max-w-md shadow-2xl rounded-3xl p-10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-blue-600"></div>

        <div className="flex justify-center mb-6">
           <Logo className="h-24 w-auto" />
        </div>

        <h1 className="text-2xl font-bold text-center text-gray-800 mb-1">
          Portal Petugas
        </h1>
        <p className="text-center text-gray-500 text-sm mb-8">
          Silakan login untuk mengelola data nagari.
        </p>

        {error && (
          <div className="alert alert-error mb-6 p-3 rounded-xl shadow-sm text-sm flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="font-semibold text-gray-700 text-sm ml-1">
              Email Petugas
            </label>
            <div className="flex items-center gap-3 border border-gray-300 rounded-xl px-4 py-3 bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all focus-within:bg-white">
              <FaEnvelope className="text-gray-400" />
              <input
                type="email"
                placeholder="admin@nagari.id"
                className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-semibold text-gray-700 text-sm ml-1">
              Password
            </label>
            <div className="flex items-center gap-3 border border-gray-300 rounded-xl px-4 py-3 bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all focus-within:bg-white">
              <FaLock className="text-gray-400" />
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-600/30 py-3 font-bold text-base hover:scale-[1.02] active:scale-95 transition-all mt-4 border-none h-auto"
          >
            {loading ? (
              <span className="loading loading-spinner loading-md"></span>
            ) : (
              "Masuk Dashboard"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;