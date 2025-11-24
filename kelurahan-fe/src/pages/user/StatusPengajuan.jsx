// Lokasi file: src/pages/user/StatusPengajuan.jsx
// (REVISI FINAL: Fix CORS Download & Layout Tombol)

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaFileAlt,
  FaDownload,
  FaEye
} from 'react-icons/fa';

// URL Storage hanya untuk VIEW (Lihat), bukan download via Axios
const STORAGE_URL = 'http://127.0.0.1:8000/storage/';

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

export default function StatusPengajuan() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [downloadingId, setDownloadingId] = useState(null);

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

  // --- FUNGSI DOWNLOAD VIA API (SOLUSI CORS) ---
  const handleDownload = async (filePath, fileName, id) => {
    try {
      setDownloadingId(id);
      
      // Panggil endpoint API Laravel kita, bukan file statis langsung
      const response = await api.get('/file/download', {
        params: { path: filePath }, // Kirim path file sebagai query param
        responseType: 'blob',       // Penting: Minta respon binary
      });

      // Buat link download virtual
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Gunakan nama file yang diinginkan
      const downloadName = fileName || 'dokumen-surat.pdf';
      link.setAttribute('download', downloadName);
      
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

    } catch (err) {
      console.error("Gagal download:", err);
      alert("Gagal mendownload file. Kemungkinan file tidak ditemukan di server.");
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) return <div className="text-center p-8"><span className="loading loading-spinner loading-lg"></span></div>;
  if (error) return <div className="alert alert-error shadow-lg"><div><span>{error}</span></div></div>;

  return (
    <div className="p-0">
      <h1 className="text-3xl font-semibold mb-6">Riwayat & Status Pengajuan</h1>

      {submissions.length === 0 ? (
        <div className="bg-white p-10 shadow-md rounded-lg text-center">
          <FaFileAlt size={50} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">Belum Ada Riwayat</h2>
          <p className="text-gray-500 mb-6">Anda belum pernah mengajukan surat apapun.</p>
          <Link to="/pengajuan" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Buat Pengajuan Pertama Anda
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((sub) => (
            <div
              key={sub.id_pengajuan || sub.id}
              className="bg-white p-6 shadow-md rounded-lg flex flex-col lg:flex-row gap-6"
            >
              {/* Info Kiri (Flexible) */}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <h2 className="text-xl font-bold text-gray-800">
                    {sub.jenis_layanan?.nama_layanan || 'Jenis Layanan'}
                  </h2>
                  <StatusBadge status={sub.status} />
                </div>
                
                <div className="text-sm text-gray-500 mb-3">
                  Diajukan pada: <span className="font-medium text-gray-700">{new Date(sub.created_at).toLocaleString('id-ID')}</span>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-gray-700 text-sm italic">
                  "{sub.keterangan || '-'}"
                </div>

                {sub.file_persyaratan && (
                  <a 
                    href={`${STORAGE_URL}${sub.file_persyaratan}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 mt-3 w-max font-medium"
                  >
                    <FaEye /> Lihat File Persyaratan Saya
                  </a>
                )}
              </div>

              {/* Area Tombol Kanan (Fixed Width & Center Alignment) */}
              <div className="shrink-0 lg:w-56 flex flex-col justify-center items-end gap-2 border-t lg:border-t-0 lg:border-l lg:pl-6 pt-4 lg:pt-0 border-gray-100">
                
                {/* Logic Tombol: Hanya muncul jika Selesai & File Ada */}
                {sub.status === 'Selesai' ? (
                  sub.file_surat_hasil ? (
                    <button
                      onClick={() => handleDownload(
                        sub.file_surat_hasil, 
                        `Surat-${sub.jenis_layanan?.nama_layanan}.pdf`, 
                        sub.id_pengajuan || sub.id
                      )}
                      disabled={downloadingId === (sub.id_pengajuan || sub.id)}
                      className="btn bg-green-600 hover:bg-green-700 text-white w-full shadow-sm border-none flex items-center justify-center gap-2 normal-case text-sm h-10 min-h-0"
                    >
                      {downloadingId === (sub.id_pengajuan || sub.id) ? (
                        <>
                          <span className="loading loading-spinner loading-xs"></span>
                          Mengunduh...
                        </>
                      ) : (
                        <>
                          <FaDownload /> Download Surat
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="w-full text-center py-2 bg-gray-100 rounded text-xs text-gray-500 border">
                      File belum diupload petugas
                    </div>
                  )
                ) : null}

                {/* Pesan Status Lain */}
                {sub.status === 'Diajukan' && (
                   <span className="text-xs text-gray-400 font-medium bg-gray-100 px-3 py-1 rounded-full">
                     Menunggu Verifikasi
                   </span>
                )}
                {sub.status === 'Diproses' && (
                   <span className="text-xs text-blue-600 font-medium bg-blue-50 px-3 py-1 rounded-full animate-pulse">
                     Sedang Dikerjakan...
                   </span>
                )}
                 {sub.status === 'Ditolak' && (
                   <span className="text-xs text-red-600 font-medium bg-red-50 px-3 py-1 rounded-full">
                     Pengajuan Ditolak
                   </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}