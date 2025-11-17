// Lokasi file: src/pages/admin/Dashboard.jsx
// Dashboard Admin — Versi Rapi, Bersih, dan Terstruktur

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

import {
  FaUsers,
  FaIdCard,
  FaFileAlt,
  FaUserCheck,
  FaArrowRight,
} from "react-icons/fa";

// ======================================================================
// BADGE STATUS
// ======================================================================
const StatusBadge = ({ status }) => {
  const colors = {
    Diajukan: "bg-yellow-400 text-yellow-900",
    Diproses: "bg-blue-400 text-blue-900",
    Selesai: "bg-green-500 text-white",
    Ditolak: "bg-red-500 text-white",
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-semibold ${
        colors[status] || "bg-gray-400 text-gray-900"
      }`}
    >
      {status}
    </span>
  );
};

// ======================================================================
// DASHBOARD PAGE
// ======================================================================
export default function Dashboard() {
  const { user } = useAuth();

  const [stats, setStats] = useState({
    penduduk: 0,
    kk: 0,
    pengajuan: 0,
  });

  const [pendingCount, setPendingCount] = useState(0);
  const [recentSubmissions, setRecentSubmissions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ====================================================================
  // FETCH DATA (Promise.all)
  // ====================================================================
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [pendudukRes, kkRes, pengajuanRes, regRes] = await Promise.all([
          api.get("/penduduk"),
          api.get("/kk"),
          api.get("/pengajuan-layanan"),
          api.get("/registrations"),
        ]);

        const penduduk = pendudukRes.data.data || [];
        const kk = kkRes.data.data || [];
        const pengajuan = pengajuanRes.data.data || [];
        const registrations = regRes.data.data || [];

        // Statistik
        setStats({
          penduduk: penduduk.length,
          kk: kk.length,
          pengajuan: pengajuan.length,
        });

        setPendingCount(registrations.length);

        // Sort 5 terbaru
        const fiveLatest = [...pengajuan]
          .sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
          )
          .slice(0, 5);

        setRecentSubmissions(fiveLatest);
      } catch (err) {
        setError("Gagal mengambil data dashboard. " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // ====================================================================
  // LOADING
  // ====================================================================
  if (loading)
    return (
      <div className="text-center p-8">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );

  // ====================================================================
  // ERROR
  // ====================================================================
  if (error)
    return (
      <div className="alert alert-error shadow-lg">
        <div>
          <span>{error}</span>
        </div>
      </div>
    );

  // ====================================================================
  // RENDER PAGE
  // ====================================================================
  return (
    <div className="p-0 space-y-8">
      {/* =============================================================== */}
      {/* HEADER SELAMAT DATANG */}
      {/* =============================================================== */}
      <div className="bg-gradient-to- from-blue-600 to-blue-700 p-8 shadow-md rounded-lg text-blue">
        <h1 className="text-4xl font-bold">
          Selamat Datang, {user?.name || "Admin"}!
        </h1>
        <p className="text-lg opacity-90 mt-2">
          Ini adalah ringkasan aktivitas di kelurahan Anda.
        </p>
      </div>

      {/* =============================================================== */}
      {/* LAYOUT UTAMA */}
      {/* =============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ============================================================= */}
        {/* KOLOM KIRI (AKTIVITAS TERBARU) */}
        {/* ============================================================= */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-semibold">Aktivitas Terbaru</h2>

          <div className="overflow-x-auto shadow-md rounded-lg">
            <table className="w-full border-collapse">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="p-3 text-left">Nama Pengaju</th>
                  <th className="p-3 text-left">Jenis Surat</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Aksi</th>
                </tr>
              </thead>

              <tbody>
                {recentSubmissions.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="text-center p-4 bg-white text-gray-600"
                    >
                      Belum ada pengajuan surat yang masuk.
                    </td>
                  </tr>
                ) : (
                  recentSubmissions.map((sub) => (
                    <tr
                      key={sub.id_pengajuan || sub.id}
                      className="border-b bg-white text-gray-700 hover:bg-gray-50"
                    >
                      <td className="p-3">
                        {sub.user?.penduduk?.nama ||
                          sub.user?.name ||
                          "Tidak diketahui"}
                      </td>

                      <td className="p-3">
                        {sub.jenis_layanan?.nama_layanan || "Tidak diketahui"}
                      </td>

                      <td className="p-3 text-center">
                        <StatusBadge status={sub.status} />
                      </td>

                      <td className="p-3 text-center">
                        <Link
                          to={`/admin/pengajuan/${
                            sub.id_pengajuan || sub.id
                          }`}
                          className="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
                        >
                          Detail
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Link
            to="/admin/pengajuan-surat"
            className="text-blue-600 hover:underline font-medium flex items-center gap-2"
          >
            Lihat Semua Pengajuan <FaArrowRight size={12} />
          </Link>
        </div>

        {/* ============================================================= */}
        {/* KOLOM KANAN (STATISTIK) */}
        {/* ============================================================= */}
        <div className="space-y-6">
          {/* NOTIFIKASI PENDING */}
          {pendingCount > 0 && (
            <Link to="/admin/verifikasi-warga">
              <div className="alert alert-warning shadow-lg hover:shadow-xl transition-shadow p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FaUserCheck size={20} />
                  <div>
                    <h3 className="font-bold">Pendaftaran Warga Pending!</h3>
                    <p className="text-xs">
                      Ada {pendingCount} warga baru menunggu persetujuan.
                    </p>
                  </div>
                </div>
                <FaArrowRight className="text-lg opacity-70" />
              </div>
            </Link>
          )}

          {/* RINGKASAN DATA */}
          <h2 className="text-2xl font-semibold">Ringkasan Data</h2>

          <div className="space-y-4">
            {/* CARD 1 */}
            <SummaryCard
              to="/admin/penduduk"
              count={stats.penduduk}
              title="Total Penduduk"
              icon={<FaUsers size={20} />}
              iconColor="bg-blue-100 text-blue-600"
            />

            {/* CARD 2 */}
            <SummaryCard
              to="/admin/kk"
              count={stats.kk}
              title="Total Kartu Keluarga"
              icon={<FaIdCard size={20} />}
              iconColor="bg-green-100 text-green-600"
            />

            {/* CARD 3 */}
            <SummaryCard
              to="/admin/pengajuan-surat"
              count={stats.pengajuan}
              title="Total Pengajuan"
              icon={<FaFileAlt size={20} />}
              iconColor="bg-yellow-100 text-yellow-600"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ======================================================================
// KOMPONEN SUMMARY CARD
// ======================================================================
const SummaryCard = ({ to, count, title, icon, iconColor }) => (
  <Link
    to={to}
    className="block p-4 bg-white shadow-md rounded-lg hover:shadow-lg transition-shadow"
  >
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-full ${iconColor}`}>{icon}</div>

        <div>
          <p className="text-xl font-bold text-gray-800">{count}</p>
          <p className="text-sm font-medium text-gray-500">{title}</p>
        </div>
      </div>

      <FaArrowRight className="text-gray-400" />
    </div>
  </Link>
);
