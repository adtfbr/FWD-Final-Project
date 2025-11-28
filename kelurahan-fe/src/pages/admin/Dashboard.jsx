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

const COLORS = ["#3b82f6", "#ec4899", "#10b981", "#f59e0b", "#8b5cf6"];

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

const StatCard = ({ to, title, count, icon, color }) => (
  <Link to={to} className="block group">
    <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 flex items-center justify-between transform hover:-translate-y-1">
      <div>
        <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">{title}</p>
        <p className="text-3xl font-bold text-gray-800 mt-2 group-hover:text-blue-600 transition-colors">{count}</p>
      </div>
      <div className={`p-4 rounded-full text-white shadow-lg ${color} group-hover:scale-110 transition-transform duration-300`}>
        <span className="text-xl">{icon}</span>
      </div>
    </div>
  </Link>
);

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ penduduk: 0, kk: 0, pengajuan: 0 });
  const [pendingCount, setPendingCount] = useState(0);
  const [recentSubmissions, setRecentSubmissions] = useState([]);
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
          api.get("/penduduk?limit=all"),
          api.get("/kk?limit=all"),
          api.get("/pengajuan-layanan"),
          api.get("/registrations"),
        ]);

        const penduduk = pendudukRes.data.data || [];
        const kk = kkRes.data.data || [];
        const pengajuan = pengajuanRes.data.data || [];
        const registrations = regRes.data.data || [];

        setStats({
          penduduk: penduduk.length,
          kk: kk.length,
          pengajuan: pengajuan.length,
        });
        setPendingCount(registrations.length);

        const fiveLatest = [...pengajuan]
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 5);
        setRecentSubmissions(fiveLatest);

        const laki = penduduk.filter(p => p.jenis_kelamin === 'L').length;
        const perempuan = penduduk.filter(p => p.jenis_kelamin === 'P').length;
        setGenderData([
          { name: 'Laki-laki', value: laki },
          { name: 'Perempuan', value: perempuan },
        ]);

        const serviceCounts = {};
        pengajuan.forEach(item => {
          const layananName = item.jenis_layanan?.nama_layanan || 'Lainnya';
          serviceCounts[layananName] = (serviceCounts[layananName] || 0) + 1;
        });

        const serviceChartData = Object.keys(serviceCounts).map(key => ({
          name: key.length > 15 ? key.substring(0, 15) + '...' : key,
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <span className="loading loading-spinner loading-lg text-blue-600"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error shadow-lg rounded-xl">
        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in pb-8">
      <div className="bg-linear-to-r from-blue-700 to-blue-900 p-6 md:p-8 rounded-2xl shadow-xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <FaChartPie size={150} />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold relative z-10">Selamat Datang, {user?.name || "Admin"}!</h1>
        <p className="text-blue-100 mt-2 text-sm md:text-lg relative z-10">Berikut adalah ringkasan aktivitas pelayanan di kelurahan Anda.</p>
      </div>

      {pendingCount > 0 && (
        <Link to="/admin/verifikasi-warga">
          <div className="alert alert-warning shadow-lg cursor-pointer hover:bg-yellow-200 transition-colors border-none flex items-center gap-4 p-4 rounded-xl mb-3">
            <FaUserCheck size={24} />
            <div className="flex-1">
              <h3 className="font-bold text-lg">Verifikasi Dibutuhkan!</h3>
              <div className="text-sm">Ada {pendingCount} pendaftaran warga baru menunggu persetujuan Anda.</div>
            </div>
            <FaArrowRight />
          </div>
        </Link>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard to="/admin/penduduk" title="Total Penduduk" count={stats.penduduk} icon={<FaUsers />} color="bg-blue-500" />
        <StatCard to="/admin/kk" title="Total Kartu Keluarga" count={stats.kk} icon={<FaIdCard />} color="bg-emerald-500" />
        <StatCard to="/admin/pengajuan-surat" title="Total Pengajuan" count={stats.pengajuan} icon={<FaFileAlt />} color="bg-amber-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 min-w-0 flex flex-col">
          <h3 className="text-lg font-bold text-gray-700 mb-6 flex items-center gap-2 border-b pb-2">
            <FaChartPie className="text-blue-500" /> Komposisi Penduduk
          </h3>
          <div className="h-64 md:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle"/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 min-w-0 flex flex-col">
          <h3 className="text-lg font-bold text-gray-700 mb-6 flex items-center gap-2 border-b pb-2">
            <FaChartBar className="text-green-500" /> Popularitas Layanan
          </h3>
          <div className="h-64 md:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={serviceData} 
                layout="vertical" 
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={120} tick={{fontSize: 12, fill: '#4b5563'}} />
                <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="jumlah" fill="#10b981" radius={[0, 4, 4, 0]} barSize={24} label={{ position: 'right', fill: '#4b5563', fontSize: 12 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="text-lg font-bold text-gray-700">Pengajuan Surat Terbaru</h3>
          <Link to="/admin/pengajuan-surat" className="text-sm text-blue-600 hover:underline font-medium hover:text-blue-700 transition-colors">
            Lihat Semua
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Nama Pengaju</th>
                <th className="px-6 py-4">Jenis Surat</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {recentSubmissions.length === 0 ? (
                <tr><td colSpan="4" className="text-center py-8 text-gray-400">Belum ada pengajuan surat terbaru.</td></tr>
              ) : (
                recentSubmissions.map((sub) => (
                  <tr key={sub.id_pengajuan || sub.id} className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                          {(sub.user?.penduduk?.nama || sub.user?.name || "W").charAt(0)}
                        </div>
                        {sub.user?.penduduk?.nama || sub.user?.name || "Warga"}
                      </div>
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
                        className="text-blue-600 hover:text-blue-800 font-medium hover:underline bg-blue-50 px-3 py-1 rounded-md transition-colors"
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