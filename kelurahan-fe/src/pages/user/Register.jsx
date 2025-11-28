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
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-100 to-blue-200 p-6">
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

        <form className="space-y-5" onSubmit={handleSubmit}>
          <RegisterInput
            label="NIK (16 Digit)"
            type="text"
            name="nik"
            value={formData.nik}
            onChange={handleChange}
            placeholder="Nomor Induk Kependudukan"
          />

          <RegisterInput
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="email@anda.com"
          />

          <RegisterInput
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="********"
          />

          <RegisterInput
            label="Konfirmasi Password"
            type="password"
            name="password_confirmation"
            value={formData.password_confirmation}
            onChange={handleChange}
            placeholder="********"
          />

          <div className="pt-2 flex justify-center">
            <button
              type="submit"
              disabled={loading || success}
              className="btn bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-4/5 rounded-xl shadow-md py-3 font-semibold hover:scale-[1.02] transition-all disabled:opacity-70 disabled:scale-100"
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

const RegisterInput = ({ label, type, name, value, onChange, placeholder }) => (
  <div className="space-y-2">
    <label className="font-semibold text-gray-700 text-sm block text-center">
      {label}
    </label>
    <div className="flex justify-center">
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        className="input input-bordered w-full sm:w-4/5 rounded-xl bg-gray-50 text-base py-3 text-center focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all"
        required
        value={value}
        onChange={onChange}
      />
    </div>
  </div>
);

export default Register;