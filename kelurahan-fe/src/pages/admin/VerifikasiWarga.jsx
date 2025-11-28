import { useState, useEffect } from 'react';
import api from '../../services/api';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { showSuccessToast, showErrorToast } from "../../utils/sweetalert";
import Swal from 'sweetalert2';

const VerifikasiWarga = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/registrations');
      setPendingUsers(response.data.data || []);
    } catch (err) {
      setError("Gagal mengambil data pendaftar: " + err.message);
      showErrorToast("Gagal memuat data pendaftar.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const handleApprove = async (id) => {
    const result = await Swal.fire({
      title: 'Setujui Pendaftaran?',
      text: "Warga ini akan mendapatkan akses login.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10B981',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Ya, Setujui!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        await api.put(`/registrations/${id}/approve`);
        setPendingUsers(pendingUsers.filter(user => user.id_user !== id));
        showSuccessToast("Pendaftaran warga berhasil disetujui.");
      } catch (err) {
        showErrorToast("Gagal menyetujui: " + err.message);
      }
    }
  };

  const handleReject = async (id) => {
    const result = await Swal.fire({
      title: 'Tolak Pendaftaran?',
      text: "Data pendaftaran ini akan dihapus permanen.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Ya, Tolak & Hapus',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/registrations/${id}/reject`);
        setPendingUsers(pendingUsers.filter(user => user.id_user !== id));
        showSuccessToast("Pendaftaran berhasil ditolak dan dihapus.");
      } catch (err) {
        showErrorToast("Gagal menolak: " + err.message);
      }
    }
  };

  if (loading) return <div className="text-center p-8"><span className="loading loading-spinner loading-lg"></span></div>;

  if (error) return (
    <div className="p-6">
      <div className="alert alert-error shadow-lg"><div><span>{error}</span></div></div>
    </div>
  );

  return (
    <div className="p-6">
      <h1 className="text-3xl font-semibold mb-6">Verifikasi Pendaftaran Warga</h1>

      <div className="overflow-x-auto shadow-md rounded-lg bg-white">
        <table className="w-full border-collapse rounded-lg overflow-hidden">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="p-3 text-left">Nama Lengkap (dari Penduduk)</th>
              <th className="p-3 text-left">NIK (dari Penduduk)</th>
              <th className="p-3 text-left">Email Pendaftaran</th>
              <th className="p-3 text-left">Tanggal Daftar</th>
              <th className="p-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {pendingUsers.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center p-8 bg-white text-gray-500">
                  <div className="flex flex-col items-center gap-2">
                    <FaCheck size={40} className="text-green-200" />
                    <span>Tidak ada pendaftaran warga yang menunggu persetujuan.</span>
                  </div>
                </td>
              </tr>
            ) : (
              pendingUsers.map((user) => (
                <tr key={user.id_user} className="border-b bg-white text-gray-700 hover:bg-gray-50 transition-colors">
                  <td className="p-3 text-left font-medium">
                    {user.penduduk?.nama || <span className="text-red-400 italic">(Data Penduduk Tdk Ditemukan)</span>}
                  </td>
                  <td className="p-3 text-left">{user.penduduk?.nik || '-'}</td>
                  <td className="p-3 text-left text-blue-600">{user.email}</td>
                  <td className="p-3 text-left">{new Date(user.created_at).toLocaleDateString('id-ID')}</td>
                  <td className="p-3 text-center flex justify-center gap-2">
                    <button
                      className="px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 hover:shadow-md transition-all flex items-center gap-1 text-sm font-medium"
                      onClick={() => handleApprove(user.id_user)}
                      title="Setujui Pendaftaran"
                    >
                      <FaCheck /> Setujui
                    </button>
                    <button
                      className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 hover:shadow-md transition-all flex items-center gap-1 text-sm font-medium"
                      onClick={() => handleReject(user.id_user)}
                      title="Tolak Pendaftaran"
                    >
                      <FaTimes /> Tolak
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VerifikasiWarga;