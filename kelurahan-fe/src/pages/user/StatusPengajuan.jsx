// Lokasi file: src/pages/user/StatusPengajuan.jsx
// (Dirapikan tanpa mengubah logika)

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaFileAlt,
} from 'react-icons/fa';

// --- Komponen Badge Status ---
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
    <span
      className={`px-3 py-1 rounded-full text-sm font-semibold border inline-flex items-center ${colorClass}`}
    >
      {icon} {status}
    </span>
  );
};

export default function StatusPengajuan() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch Riwayat
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.get('/pengajuan-layanan/riwayat-saya');
        setSubmissions(response.data.data || []);
      } catch (err) {
        setError('Gagal mengambil riwayat pengajuan. ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading)
    return (
      <div className="text-center p-8">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );

  if (error)
    return (
      <div className="alert alert-error shadow-lg">
        <div>
          <span>{error}</span>
        </div>
      </div>
    );

  return (
    <div className="p-0">
      <h1 className="text-3xl font-semibold mb-6">Riwayat & Status Pengajuan</h1>

      {submissions.length === 0 ? (
        <div className="bg-white p-10 shadow-md rounded-lg text-center">
          <FaFileAlt size={50} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">Belum Ada Riwayat</h2>
          <p className="text-gray-500 mb-6">Anda belum pernah mengajukan surat apapun.</p>
          <Link
            to="/pengajuan"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Buat Pengajuan Pertama Anda
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((sub) => (
            <div
              key={sub.id_pengajuan || sub.id}
              className="bg-white p-6 shadow-md rounded-lg flex flex-col sm:flex-row justify-between sm:items-center"
            >
              <div className="mb-4 sm:mb-0">
                <h2 className="text-xl font-bold text-gray-800">
                  {sub.jenis_layanan?.nama_layanan || 'N/A'}
                </h2>
                <p className="text-sm text-gray-500 mb-2">
                  Diajukan pada: {new Date(sub.created_at).toLocaleString('id-ID')}
                </p>
                <p className="text-gray-700 text-sm italic bg-gray-50 p-2 rounded">
                  "{sub.keterangan}"
                </p>
              </div>

              <div className="flex-shrink-">
                <StatusBadge status={sub.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}