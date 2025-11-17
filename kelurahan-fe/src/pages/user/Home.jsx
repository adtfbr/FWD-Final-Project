// Lokasi file: src/pages/user/Home.jsx
// (Dashboard untuk Warga)

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../services/api.js';
import { FaFileAlt, FaCheckCircle, FaSpinner, FaTimesCircle, FaArrowRight } from 'react-icons/fa';

// --- Komponen Badge Status (dari file StatusPengajuan) ---
const StatusBadge = ({ status }) => {
  let colorClass = '';
  let icon = null;

  switch (status) {
    case 'Diajukan':
      colorClass = 'bg-yellow-100 text-yellow-800 border-yellow-300';
      icon = <FaFileAlt className="mr-1" />;
      break;
    case 'Diproses':
      colorClass = 'bg-blue-100 text-blue-800 border-blue-300';
      icon = <FaSpinner className="mr-1 animate-spin" />;
      break;
    case 'Selesai':
      colorClass = 'bg-green-100 text-green-800 border-green-300';
      icon = <FaCheckCircle className="mr-1" />;
      break;
    case 'Ditolak':
      colorClass = 'bg-red-100 text-red-800 border-red-300';
      icon = <FaTimesCircle className="mr-1" />;
      break;
    default:
      colorClass = 'bg-gray-100 text-gray-800 border-gray-300';
  }
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-semibold border inline-flex items-center ${colorClass}`}>
      {icon} {status}
    </span>
  );
};

export default function Home() {
  const { user } = useAuth(); // Ambil data Warga yang login
  const [latestSubmission, setLatestSubmission] = useState(null);
  const [loading, setLoading] = useState(true);

  const wargaName = user?.penduduk?.nama || user?.name || "Warga";

  useEffect(() => {
    const fetchLatestSubmission = async () => {
      try {
        setLoading(true);
        // Ambil SEMUA riwayat
        const response = await api.get('/pengajuan-layanan/riwayat-saya');
        const allSubmissions = response.data.data || [];

        // Sortir dari yang terbaru, dan ambil HANYA 1
        if (allSubmissions.length > 0) {
          const sorted = [...allSubmissions].sort((a, b) => 
            new Date(b.created_at) - new Date(a.created_at)
          );
          setLatestSubmission(sorted[0]); // Simpan hanya yang paling baru
        }
      } catch (err) {
        if (err.response?.status !== 404) {
          console.error("Gagal mengambil data riwayat:", err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLatestSubmission();
  }, []);

  return (
    <div className="p-0 space-y-8">
      <div className="bg-gradient-to- from-blue-600 to-blue-700 p-8 shadow-md rounded-lg text-blue">
        <h1 className="text-4xl font-bold">Selamat Datang, {wargaName}!</h1>
        <p className="text-lg opacity-90 mt-2">Ini adalah halaman layanan mandiri Anda.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-semibold">Aksi Cepat</h2>
          
          <Link 
            to="/pengajuan" 
            className="block p-8 bg-white shadow-md rounded-lg hover:shadow-lg transition-shadow text-center"
          >
            <FaFileAlt size={50} className="mx-auto text-blue-600 mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              Buat Pengajuan Surat Baru
            </h3>
            <p className="text-gray-500 mb-4">
              Ajukan Surat Keterangan Tidak Mampu (SKTM), Domisili, dan lainnya secara online.
            </p>
            <span className="font-semibold text-blue-600 flex items-center justify-center gap-2">
              Mulai Sekarang <FaArrowRight size={12} />
            </span>
          </Link>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <h2 className="text-2xl font-semibold">Status Pengajuan Terakhir</h2>
          
          <div className="bg-white p-6 shadow-md rounded-lg">
            {loading ? (
              <div className="text-center"><span className="loading loading-spinner"></span></div>
            ) : latestSubmission ? (
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  {latestSubmission.jenis_layanan?.nama_layanan}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Diajukan pada: {new Date(latestSubmission.created_at).toLocaleDateString('id-ID')}
                </p>
                <StatusBadge status={latestSubmission.status} />
                <Link 
                  to="/status" 
                  className="text-blue-600 hover:underline font-medium flex items-center gap-2 mt-4 text-sm"
                >
                  Lihat Semua Riwayat <FaArrowRight size={12} />
                </Link>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <p>Anda belum memiliki riwayat pengajuan.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}