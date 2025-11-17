// Lokasi file: src/pages/admin/AdminLogin.jsx

import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

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
      setError(err.message || "Email atau password salah.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to- from-blue-100 to-blue-200 px-6">

      <div className="bg-white w-full max-w-md shadow-2xl rounded-3xl p-10">

        {/* Judul */}
        <h1 className="text-3xl font-bold text-center text-blue-800 mb-1">
          Admin Panel
        </h1>
        <p className="text-center text-gray-600 text-sm mb-6">
          Login untuk mengakses dashboard petugas.
        </p>

        {/* Error */}
        {error && (
          <div className="alert alert-error mb-4 p-3 rounded-xl shadow-sm">
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Email */}
          <div className="space-y-1">
            <label className="font-semibold text-gray-700 text-sm">
              Email
            </label>
            <input
              type="email"
              placeholder="email@petugas.id"
              className="input input-bordered w-full rounded-xl bg-gray-50 text-base py-3 focus:ring-2 focus:ring-blue-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="font-semibold text-gray-700 text-sm">
              Password
            </label>
            <input
              type="password"
              placeholder="********"
              className="input input-bordered w-full rounded-xl bg-gray-50 text-base py-3 focus:ring-2 focus:ring-blue-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Tombol */}
          <button
            type="submit"
            disabled={loading}
            className="btn w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md py-3 font-semibold hover:scale-[1.02] transition-all"
          >
            {loading ? (
              <span className="loading loading-spinner"></span>
            ) : (
              "Login"
            )}
          </button>
        </form>

      </div>
    </div>
  );
};

export default AdminLogin;
