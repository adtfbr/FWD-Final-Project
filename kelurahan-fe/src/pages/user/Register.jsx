// Lokasi file: src/pages/user/Register.jsx

import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
  const [formData, setFormData] = useState({
    nik: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const { registerWarga } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (formData.password !== formData.password_confirmation) {
      setError("Konfirmasi password tidak cocok.");
      setLoading(false);
      return;
    }

    try {
      await registerWarga(formData);
      setSuccess("Registrasi berhasil! Menunggu verifikasi petugas...");
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to- from-blue-100 to-blue-200 p-6">

      <div className="bg-white w-full max-w-lg shadow-2xl rounded-3xl p-10 mx-auto text-center">

        <h1 className="text-3xl font-bold text-blue-800 mb-1">
          Registrasi Warga
        </h1>

        <p className="text-gray-600 text-sm mb-6">
          Daftar akun untuk mengakses layanan kelurahan digital.
        </p>

        {error && (
          <div className="alert alert-warning mb-4 p-3 rounded-xl shadow-sm text-center">
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert alert-success mb-4 p-3 rounded-xl shadow-sm text-center">
            <span>{success}</span>
          </div>
        )}

        {/* FORM */}
        <form className="space-y-6" onSubmit={handleSubmit}>

          {/* NIK */}
          <div className="space-y-2">
            <label className="font-semibold text-gray-700 text-sm block text-center">
              NIK (16 Digit)
            </label>

            <div className="flex justify-center">
              <input
                type="text"
                name="nik"
                placeholder="Nomor Induk Kependudukan"
                className="input input-bordered w-4/5 rounded-xl bg-gray-50 text-base py-3 text-center focus:ring-2 focus:ring-blue-400"
                required
                value={formData.nik}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="font-semibold text-gray-700 text-sm block text-center">
              Email
            </label>

            <div className="flex justify-center">
              <input
                type="email"
                name="email"
                placeholder="email@anda.com"
                className="input input-bordered w-4/5 rounded-xl bg-gray-50 text-base py-3 text-center focus:ring-2 focus:ring-blue-400"
                required
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="font-semibold text-gray-700 text-sm block text-center">
              Password
            </label>

            <div className="flex justify-center">
              <input
                type="password"
                name="password"
                placeholder="********"
                className="input input-bordered w-4/5 rounded-xl bg-gray-50 text-base py-3 text-center focus:ring-2 focus:ring-blue-400"
                required
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label className="font-semibold text-gray-700 text-sm block text-center">
              Konfirmasi Password
            </label>

            <div className="flex justify-center">
              <input
                type="password"
                name="password_confirmation"
                placeholder="********"
                className="input input-bordered w-4/5 rounded-xl bg-gray-50 text-base py-3 text-center focus:ring-2 focus:ring-blue-400"
                required
                value={formData.password_confirmation}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Tombol Submit */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={loading || success}
              className="btn bg-blue-600 hover:bg-blue-700 text-white w-4/5 rounded-xl shadow-md py-3 font-semibold hover:scale-[1.02] transition-all"
            >
              {loading ? (
                <span className="loading loading-spinner"></span>
              ) : (
                "Daftar"
              )}
            </button>
          </div>
        </form>

        <p className="text-center mt-6 text-gray-600 text-sm">
          Sudah punya akun?{" "}
          <Link
            to="/login"
            className="text-blue-700 font-semibold hover:underline"
          >
            Login di sini
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Register;
