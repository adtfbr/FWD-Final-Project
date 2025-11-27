// Lokasi file: src/pages/admin/Dashboard.jsx
// (REVISI MODUL 2: Dashboard dengan Grafik Statistik Interaktif)

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
  FaChartPie,
  FaChartBar
} from "react-icons/fa";

// --- IMPORT RECHARTS ---
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// --- WARNA GRAFIK ---
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

// --- KOMPONEN BADGE STATUS ---
const StatusBadge = ({ status }) => {
  const colors = {
    Diajukan: "bg-yellow-100 text-yellow-800",
    Diproses: "bg-blue-100 text-blue-800",
    Selesai: "bg-green-100 text-green-800",
    Ditolak: "bg-red-100 text-red-800",
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[status] || "bg-gray-100 text-gray-800"}`}>
      {status}
    </span>
  );
};

export default function Dashboard() {
  const { user } = useAuth();

  // State Data Mentah
  const [stats, setStats] = useState({ penduduk: 0, kk: 0, pengajuan: 0 });
  const [pendingCount, setPendingCount] = useState(0);
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  
  // State Data Grafik
  const [genderData, setGenderData] = useState([]);
  const [serviceData, setServiceData] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [pendudukRes, kkRes, pengajuanRes, regRes] = await Promise.all([
          api.get("/penduduk?limit=all"), // Minta semua data
          api.get("/kk?limit=all"),       // Minta semua data
          api.get("/pengajuan-layanan"),
          api.get("/registrations"),
        ]);

        const penduduk = pendudukRes.data.data || [];
        const kk = kkRes.data.data || [];
        const pengajuan = pengajuanRes.data.data || [];
        const registrations = regRes.data.data || [];

        // 1. Set Statistik Angka
        setStats({
          penduduk: penduduk.length,
          kk: kk.length,
          pengajuan: pengajuan.length,
        });
        setPendingCount(registrations.length);

        // 2. Set Tabel Terbaru (5 data)
        const fiveLatest = [...pengajuan]
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 5);
        setRecentSubmissions(fiveLatest);

        // 3. OLAH DATA GRAFIK 1: Jenis Kelamin Penduduk
        const laki = penduduk.filter(p => p.jenis_kelamin === 'L').length;
        const perempuan = penduduk.filter(p => p.jenis_kelamin === 'P').length;
        setGenderData([
          { name: 'Laki-laki', value: laki },
          { name: 'Perempuan', value: perempuan },
        ]);

        // 4. OLAH DATA GRAFIK 2: Pengajuan per Jenis Layanan
        const serviceCounts = {};
        pengajuan.forEach(item => {
          const layananName = item.jenis_layanan?.nama_layanan || 'Lainnya';
          serviceCounts[layananName] = (serviceCounts[layananName] || 0) + 1;
        });

        // Transform ke format Recharts
        const serviceChartData = Object.keys(serviceCounts).map(key => ({
          name: key.length > 15 ? key.substring(0, 15) + '...' : key, // Potong nama jika kepanjangan
          jumlah: serviceCounts[key]
        }));
        setServiceData(serviceChartData);

      } catch (err) {
        setError("Gagal mengambil data dashboard. " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <div className="text-center p-8"><span className="loading loading-spinner loading-lg"></span></div>;
  if (error) return <div className="alert alert-error shadow-lg"><div><span>{error}</span></div></div>;

  return (
    <div className="space-y-8">
      
      {/* --- HEADER --- */}
      <div className="bg-linear-to-r from-blue-600 to-blue-800 p-8 rounded-2xl shadow-xl text-white">
        <h1 className="text-3xl font-bold">Selamat Datang, {user?.name || "Admin"}!</h1>
        <p className="text-blue-100 mt-2 text-lg">Berikut adalah ringkasan aktivitas pelayanan di kelurahan Anda.</p>
      </div>

      {/* --- NOTIFIKASI PENDING --- */}
      {pendingCount > 0 && (
        <Link to="/admin/verifikasi-warga">
          <div className="alert alert-warning shadow-lg cursor-pointer hover:bg-yellow-200 transition-colors border-none">
            <FaUserCheck size={24} />
            <div>
              <h3 className="font-bold text-lg">Verifikasi Dibutuhkan!</h3>
              <div className="text-sm">Ada {pendingCount} pendaftaran warga baru menunggu persetujuan Anda.</div>
            </div>
            <FaArrowRight />
          </div>
        </Link>
      )}

      {/* --- STATISTIK KARTU --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard to="/admin/penduduk" title="Total Penduduk" count={stats.penduduk} icon={<FaUsers />} color="bg-blue-500" />
        <StatCard to="/admin/kk" title="Total Kartu Keluarga" count={stats.kk} icon={<FaIdCard />} color="bg-emerald-500" />
        <StatCard to="/admin/pengajuan-surat" title="Total Pengajuan" count={stats.pengajuan} icon={<FaFileAlt />} color="bg-amber-500" />
      </div>

      {/* --- AREA GRAFIK --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Grafik 1: Komposisi Penduduk */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 min-w-0">
          <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
            <FaChartPie className="text-blue-500" /> Komposisi Penduduk
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  <Cell key="cell-0" fill="#3b82f6" /> {/* Laki: Biru */}
                  <Cell key="cell-1" fill="#ec4899" /> {/* Perempuan: Pink */}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grafik 2: Statistik Layanan */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 min-w-0">
          <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
            <FaChartBar className="text-green-500" /> Popularitas Layanan
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={serviceData} 
                layout="vertical" 
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="jumlah" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} label={{ position: 'right' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* --- TABEL TERBARU --- */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-700">Pengajuan Surat Terbaru</h3>
          <Link to="/admin/pengajuan-surat" className="text-sm text-blue-600 hover:underline font-medium">
            Lihat Semua
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-3">Nama Pengaju</th>
                <th className="px-6 py-3">Jenis Surat</th>
                <th className="px-6 py-3 text-center">Status</th>
                <th className="px-6 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {recentSubmissions.length === 0 ? (
                <tr><td colSpan="4" className="text-center py-6">Belum ada data.</td></tr>
              ) : (
                recentSubmissions.map((sub) => (
                  <tr key={sub.id_pengajuan || sub.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {sub.user?.penduduk?.nama || sub.user?.name || "Warga"}
                    </td>
                    <td className="px-6 py-4">
                      {sub.jenis_layanan?.nama_layanan}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <StatusBadge status={sub.status} />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link
                        to={`/admin/pengajuan/${sub.id_pengajuan || sub.id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
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
      </div>

    </div>
  );
}

// --- KOMPONEN KECIL: STAT CARD ---
const StatCard = ({ to, title, count, icon, color }) => (
  <Link to={to} className="block">
    <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-100 flex items-center justify-between group">
      <div>
        <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">{title}</p>
        <p className="text-3xl font-bold text-gray-800 mt-1 group-hover:text-blue-600 transition-colors">{count}</p>
      </div>
      <div className={`p-4 rounded-full text-white shadow-lg ${color} group-hover:scale-110 transition-transform`}>
        <span className="text-xl">{icon}</span>
      </div>
    </div>
  </Link>
);