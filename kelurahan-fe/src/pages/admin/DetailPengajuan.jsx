// Lokasi file: src/pages/admin/DetailPengajuan.jsx
// (Dengan Aksi Visual yang Dinamis — versi rapi tanpa mengubah logika)

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import {
  FaCheck,
  FaTimes,
  FaSpinner,
  FaArrowLeft,
  FaFileAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaCogs
} from 'react-icons/fa';

// --- KOMPONEN: Visual Status ---
const VisualStatusDisplay = ({ status }) => {
  let icon, color, text;

  switch (status) {
    case 'Diproses':
      icon = <FaCogs className="text-5xl text-blue-500 animate-spin" style={{ animationDuration: '3s' }} />;
      color = 'bg-blue-50 border-blue-200';
      text = 'Pengajuan ini sedang dalam proses.';
      break;

    case 'Selesai':
      icon = <FaCheckCircle className="text-5xl text-green-500" />;
      color = 'bg-green-50 border-green-200';
      text = 'Pengajuan telah disetujui dan selesai.';
      break;

    case 'Ditolak':
      icon = <FaTimesCircle className="text-5xl text-red-500" />;
      color = 'bg-red-50 border-red-200';
      text = 'Pengajuan ini telah ditolak.';
      break;

    case 'Diajukan':
    default:
      icon = <FaFileAlt className="text-5xl text-yellow-500" />;
      color = 'bg-yellow-50 border-yellow-200';
      text = 'Menunggu validasi dan persetujuan.';
  }

  return (
    <div className={`p-6 rounded-lg border-t-4 ${color} flex items-center gap-4`}>
      <div className="flex-shrink-">{icon}</div>
      <div>
        <h3 className="text-lg font-bold text-gray-800">Status: {status}</h3>
        <p className="text-gray-600">{text}</p>
      </div>
    </div>
  );
};

export default function DetailPengajuan() {
  const { id } = useParams();

  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Fetch data detail
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(`/pengajuan-layanan/${id}`);
        setSubmission(response.data.data || null);
      } catch (err) {
        setError('Gagal mengambil data pengajuan. ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Update status
  const handleUpdateStatus = async (newStatus) => {
    setError(null);
    setSubmitLoading(true);

    try {
      await api.put(`/pengajuan-layanan/${id}/status`, { status: newStatus });
      setSubmission((prev) => ({ ...prev, status: newStatus }));
    } catch (err) {
      setError('Gagal update status: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) return <div className="text-center p-8"><span className="loading loading-spinner loading-lg"></span></div>;
  if (error) return <div className="alert alert-error shadow-lg"><div><span>{error}</span></div></div>;
  if (!submission) return <div className="alert alert-warning">Data pengajuan tidak ditemukan.</div>;

  const { user, jenis_layanan, keterangan, status, created_at } = submission;
  const namaPengaju = user?.penduduk?.nama || user?.name || 'Warga';
  const nikPengaju = user?.penduduk?.nik || 'NIK Tidak ada';

  const isFinalStatus = status === 'Selesai' || status === 'Ditolak';

  return (
    <div className="p-0">

      <Link
        to="/admin/pengajuan-surat"
        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center gap-2 w-max mb-4"
      >
        <FaArrowLeft /> Kembali ke Daftar
      </Link>

      <h1 className="text-3xl font-semibold mb-6">Detail Pengajuan Surat</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Kolom kiri */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white p-6 shadow-md rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Informasi Pengajuan</h2>
            <table className="w-full">
              <tbody>
                <tr className="border-b">
                  <td className="py-2 font-medium text-gray-500">Jenis Layanan</td>
                  <td className="py-2 font-bold">{jenis_layanan?.nama_layanan || 'N/A'}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-medium text-gray-500">Tanggal Diajukan</td>
                  <td className="py-2">{new Date(created_at).toLocaleString('id-ID')}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-white p-6 shadow-md rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Keterangan (dari Warga)</h2>
            <p className="text-gray-700 bg-gray-50 p-4 rounded-lg min-h-[100px]">
              {keterangan || '(Tidak ada keterangan)'}
            </p>
          </div>
        </div>

        {/* Kolom kanan */}
        <div className="space-y-4">
          <div className="bg-white p-6 shadow-md rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Data Pengaju</h2>
            <p className="text-lg font-bold">{namaPengaju}</p>
            <p className="text-gray-600">NIK: {nikPengaju}</p>
          </div>

          {/* Kartu aksi */}
          <div className="bg-white p-6 shadow-md rounded-lg">
            <h2 className="text-xl font-semibold mb-6">Status & Aksi Pengajuan</h2>

            <VisualStatusDisplay status={status} />

            <div className="divider my-6">Aksi yang Tersedia</div>

            {error && <div className="alert alert-warning text-sm p-2 mb-4"><span>{error}</span></div>}
            {submitLoading && <div className="text-center"><span className="loading loading-spinner"></span></div>}

            {!submitLoading && !isFinalStatus && (
              <div className="space-y-3">
                {status === 'Diajukan' && (
                  <button
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                    onClick={() => handleUpdateStatus('Diproses')}
                  >
                    <FaCogs /> Setujui & Proses
                  </button>
                )}

                {status === 'Diproses' && (
                  <button
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                    onClick={() => handleUpdateStatus('Selesai')}
                  >
                    <FaCheckCircle /> Tandai Selesai
                  </button>
                )}

                <button
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
                  onClick={() => handleUpdateStatus('Ditolak')}
                >
                  <FaTimes /> Tolak Pengajuan
                </button>
              </div>
            )}

            {!submitLoading && isFinalStatus && (
              <p className="text-center text-sm text-gray-500">
                Status pengajuan ini sudah final. Tidak ada aksi lebih lanjut.
              </p>
)}
 </div>
  {/* --- SELESAI KARTU AKSI --- */}
   </div> 
   </div>
        </div>
           );
           }