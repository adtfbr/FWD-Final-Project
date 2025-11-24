/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
// Lokasi file: src/pages/admin/DetailPengajuan.jsx
// (VERSI FINAL FIX: Direct Link Download + SweetAlert)

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { 
  FaCheckCircle, 
  FaTimesCircle, 
  FaArrowLeft, 
  FaFileAlt, 
  FaCogs, 
  FaDownload, 
  FaTimes,
  FaFileUpload,
  FaExternalLinkAlt // Icon baru untuk indikator link keluar
} from 'react-icons/fa';
import Swal from 'sweetalert2'; 
import { showSuccessToast, showErrorToast } from "../../utils/sweetalert";

// Pastikan URL ini sesuai backend kamu
const STORAGE_URL = 'http://127.0.0.1:8000/storage/';

export default function DetailPengajuan() {
  const { id } = useParams();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [adminFile, setAdminFile] = useState(null);
  // State 'downloading' dihapus karena kita pakai direct link browser

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/pengajuan-layanan/${id}`);
      setSubmission(response.data.data || null);
    } catch (err) {
      showErrorToast('Gagal mengambil data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  // --- KOMPONEN FILE VIEWER (MODIFIKASI: DIRECT LINK) ---
  const FileViewer = ({ label, filePath }) => {
    if (!filePath) return (
      <div className="p-4 rounded border border-dashed border-gray-300 text-gray-400 text-sm bg-gray-50">
        Tidak ada file {label.toLowerCase()}.
      </div>
    );
    
    // Buat URL lengkap
    const fullUrl = `${STORAGE_URL}${filePath}`;
    const isImage = filePath.match(/\.(jpeg|jpg|gif|png)$/i);

    return (
      <div className="mt-3">
        <p className="text-sm font-semibold text-gray-700 mb-2">{label}</p>
        <div className="p-3 rounded-lg border bg-white shadow-sm">
          {isImage ? (
            <div className="relative group">
                <img 
                  src={fullUrl} 
                  alt={label} 
                  className="max-w-full h-auto max-h-64 rounded object-contain mx-auto border" 
                />
                {/* Ganti Button dengan Tag A (Direct Link) */}
                <a 
                    href={fullUrl}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="absolute top-2 right-2 bg-white/90 p-2 rounded-full shadow-md hover:bg-white text-gray-700 hover:text-blue-600 transition-colors"
                    title="Buka / Download Gambar"
                >
                    <FaDownload />
                </a>
                
                {/* Tombol Overlay "Klik untuk memperbesar" */}
                <a 
                  href={fullUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="absolute inset-0 flex items-center justify-center bg-black/50 .opacity-0 group-hover:opacity-100 transition-opacity text-white font-medium rounded opacity-0"
                >
                  <FaExternalLinkAlt className="mr-2"/> Lihat Full Size
                </a>
            </div>
          ) : (
            // Ganti Button dengan Tag A (Direct Link untuk Dokumen)
            <a 
                href={fullUrl}
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 w-full bg-blue-50 rounded border border-blue-100 hover:bg-blue-100 text-blue-700 transition-colors text-left group"
            >
                <FaFileAlt className="text-2xl group-hover:scale-110 transition-transform" />
                <span className="font-medium underline">Buka / Download Dokumen (PDF)</span>
            </a>
          )}
        </div>
      </div>
    );
  };

  // --- SWEETALERT CUSTOM (TETAP DIPERTAHANKAN) ---
  const confirmAndUpdate = async (newStatus) => {
    let confirmTitle = "Konfirmasi";
    let confirmText = `Ubah status menjadi "${newStatus}"?`;
    let confirmColor = "#3085d6";
    let confirmIcon = "question";

    if (newStatus === 'Ditolak') {
        confirmTitle = "Tolak Pengajuan?";
        confirmText = "Warga akan menerima notifikasi bahwa pengajuan ditolak.";
        confirmColor = "#d33"; 
        confirmIcon = "warning";
    } else if (newStatus === 'Selesai') {
        confirmTitle = "Selesaikan Pengajuan?";
        confirmText = adminFile 
            ? "File surat hasil yang Anda upload akan dikirim ke warga." 
            : "PERINGATAN: Anda belum mengupload file surat hasil. Yakin ingin menyelesaikan?";
        confirmColor = "#10b981"; 
        confirmIcon = adminFile ? "question" : "warning";
    } else if (newStatus === 'Diproses') {
        confirmTitle = "Proses Pengajuan?";
        confirmText = "Status akan berubah menjadi 'Diproses'.";
        confirmColor = "#3b82f6"; 
    }

    const result = await Swal.fire({
        title: confirmTitle,
        text: confirmText,
        icon: confirmIcon,
        showCancelButton: true,
        confirmButtonColor: confirmColor,
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Ya, Lanjutkan',
        cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
        handleUpdateStatus(newStatus);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    setSubmitLoading(true);
    const formData = new FormData();
    formData.append('status', newStatus);
    formData.append('_method', 'PUT'); 
    
    if (newStatus === 'Selesai' && adminFile) {
      formData.append('file_surat_hasil', adminFile);
    }

    try {
      await api.post(`/pengajuan-layanan/${id}/status`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      await fetchData();
      setAdminFile(null);
      showSuccessToast(`Status berhasil diubah ke ${newStatus}`);

    } catch (err) {
      showErrorToast('Gagal update status: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitLoading(false);
    }
  };

  // --- Helper Visual Status ---
  const VisualStatusDisplay = ({ status }) => {
    let icon, color, text;
    switch (status) {
        case 'Diproses': icon = <FaCogs className="text-5xl text-blue-500 animate-spin" />; color = 'bg-blue-50 border-blue-200'; text = 'Pengajuan ini sedang diproses oleh petugas.'; break;
        case 'Selesai': icon = <FaCheckCircle className="text-5xl text-green-500" />; color = 'bg-green-50 border-green-200'; text = 'Pengajuan telah disetujui dan selesai.'; break;
        case 'Ditolak': icon = <FaTimesCircle className="text-5xl text-red-500" />; color = 'bg-red-50 border-red-200'; text = 'Pengajuan ini telah ditolak.'; break;
        default: icon = <FaFileAlt className="text-5xl text-yellow-500" />; color = 'bg-yellow-50 border-yellow-200'; text = 'Menunggu validasi dan persetujuan petugas.';
    }
    return <div className={`p-6 rounded-lg border-t-4 ${color} flex items-center gap-4 shadow-sm`}><div className="shrink-0">{icon}</div><div><h3 className="text-lg font-bold text-gray-800">Status: {status}</h3><p className="text-gray-600 text-sm">{text}</p></div></div>;
  };

  if (loading) return <div className="text-center p-8"><span className="loading loading-spinner loading-lg"></span></div>;
  if (!submission) return <div className="alert alert-warning">Data pengajuan tidak ditemukan.</div>;

  const { user, jenis_layanan, keterangan, status, created_at, file_persyaratan, file_surat_hasil } = submission;
  const namaPengaju = user?.penduduk?.nama || user?.name || 'Warga';
  const nikPengaju = user?.penduduk?.nik || '-';
  const isFinalStatus = status === 'Selesai' || status === 'Ditolak';

  return (
    <div className="p-0">
      <Link to="/admin/pengajuan-surat" className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center gap-2 w-max mb-4 shadow-sm transition-colors"><FaArrowLeft /> Kembali</Link>
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">Detail Pengajuan Surat</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Kiri: Info */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 shadow-md rounded-lg border border-gray-100">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Informasi Pengajuan</h2>
            <table className="w-full mb-4 text-sm">
              <tbody>
                <tr className="border-b"><td className="py-3 text-gray-500 w-1/3">Jenis Layanan</td><td className="py-3 font-bold text-gray-800">{jenis_layanan?.nama_layanan}</td></tr>
                <tr className="border-b"><td className="py-3 text-gray-500">Tanggal Pengajuan</td><td className="py-3 font-medium text-gray-800">{new Date(created_at).toLocaleString('id-ID')}</td></tr>
              </tbody>
            </table>
            
            <div className="mb-4">
                <h3 className="font-medium text-gray-700 mb-2 text-sm">Keterangan Warga:</h3>
                <p className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm text-gray-600 italic">"{keterangan || 'Tidak ada keterangan tambahan.'}"</p>
            </div>
            
            <div className="pt-4 border-t">
                <FileViewer label="Dokumen Persyaratan (KTP / Pengantar)" filePath={file_persyaratan} />
            </div>
          </div>
          
          {file_surat_hasil && (
            <div className="bg-white p-6 shadow-md rounded-lg border-l-4 border-green-500">
                <h2 className="text-xl font-bold text-green-700 mb-2 flex items-center gap-2"><FaCheckCircle /> Surat Hasil (Selesai)</h2>
                <p className="text-sm text-gray-500 mb-4">Surat ini telah diterbitkan dan dapat didownload oleh warga.</p>
                <FileViewer label="File Surat Resmi" filePath={file_surat_hasil} />
            </div>
          )}
        </div>

        {/* Kanan: Aksi */}
        <div className="space-y-6">
          <div className="bg-white p-6 shadow-md rounded-lg border border-gray-100">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Data Pengaju</h2>
            <div className="space-y-1">
                <p className="text-lg font-bold text-gray-900">{namaPengaju}</p>
                <p className="text-sm text-gray-500 font-mono bg-gray-100 w-max px-2 py-1 rounded">NIK: {nikPengaju}</p>
                <p className="text-xs text-gray-400 mt-2">{user?.email}</p>
            </div>
          </div>

          <div className="bg-white p-6 shadow-md rounded-lg border border-gray-100">
            <h2 className="text-xl font-semibold mb-6 text-gray-800">Status & Aksi</h2>
            <VisualStatusDisplay status={status} />
            
            <div className="divider my-6 text-gray-400 text-sm">Panel Kontrol Admin</div>
            
            {!isFinalStatus ? (
              <div className="space-y-4">
                {/* Tombol Proses */}
                {status === 'Diajukan' && (
                  <button 
                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 font-bold shadow-md transition-all hover:scale-[1.02]" 
                    onClick={() => confirmAndUpdate('Diproses')} 
                    disabled={submitLoading}
                  >
                    {submitLoading ? <span className="loading loading-spinner"></span> : <><FaCogs /> Verifikasi & Proses</>}
                  </button>
                )}

                {/* Form Upload & Selesai */}
                {status === 'Diproses' && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <label className="block text-sm font-bold text-blue-800 mb-2 .flex items-center gap-2">
                        <FaFileUpload /> Upload Surat Hasil
                    </label>
                    <input 
                        type="file" 
                        className="file-input file-input-bordered file-input-sm w-full mb-3 bg-white" 
                        onChange={(e) => setAdminFile(e.target.files[0])}
                        accept=".pdf,.jpg,.jpeg,.png" 
                    />
                    <button 
                        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 font-bold shadow-md transition-all hover:scale-[1.02]" 
                        onClick={() => confirmAndUpdate('Selesai')} 
                        disabled={submitLoading}
                    >
                      {submitLoading ? <span className="loading loading-spinner"></span> : <><FaCheckCircle /> Selesai & Kirim</>}
                    </button>
                    {!adminFile && <p className="text-xs text-blue-400 mt-2 text-center">*Disarankan upload file sebelum selesai.</p>}
                  </div>
                )}

                {/* Tombol Tolak */}
                <button 
                    className="w-full px-4 py-2 bg-white text-red-600 border border-red-200 rounded-lg hover:bg-red-50 flex items-center justify-center gap-2 font-medium transition-colors mt-2" 
                    onClick={() => confirmAndUpdate('Ditolak')} 
                    disabled={submitLoading}
                >
                  <FaTimes /> Tolak Pengajuan
                </button>
              </div>
            ) : (
              <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200 text-gray-500 text-sm">
                Pengajuan ini telah ditutup dan tidak dapat diubah lagi.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}