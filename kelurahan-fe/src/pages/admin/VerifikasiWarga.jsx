// Lokasi file: src/pages/admin/VerifikasiWarga.jsx
// (Dengan Perbaikan .map() error dan `id_user`)

import { useState, useEffect } from 'react';
import api from '../../services/api'; 
import { FaCheck, FaTimes } from 'react-icons/fa';

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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const handleApprove = async (id) => { 
    if (!window.confirm("Setujui pendaftaran warga ini?")) return;
    try {
      await api.put(`/registrations/${id}/approve`);
      setPendingUsers(pendingUsers.filter(user => user.id_user !== id));
    } catch (err) {
      setError("Gagal menyetujui: " + err.message);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Tolak dan hapus pendaftaran ini?")) return;
    try {
      await api.delete(`/registrations/${id}/reject`);
      setPendingUsers(pendingUsers.filter(user => user.id_user !== id));
    } catch (err) {
      setError("Gagal menolak: " + err.message);
    }
  };

  if (loading) return <div className="text-center p-8"><span className="loading loading-spinner loading-lg"></span></div>;
  if (error) return <div className="alert alert-error shadow-lg"><div><span>{error}</span></div></div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-semibold mb-6">Verifikasi Pendaftaran Warga</h1>

      <div className="overflow-x-auto shadow-md rounded-lg">
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
                <td colSpan="5" className="text-center p-4 bg-white">
                  Tidak ada pendaftaran warga yang menunggu persetujuan.
                </td>
              </tr>
            ) : (
              pendingUsers.map((user) => (
                <tr key={user.id_user} className="border-b bg-white text-gray-700 hover:bg-gray-50">
                  <td className="p-3 text-left">
                    {user.penduduk?.nama || '(Data Penduduk Tdk Ditemukan)'}
                  </td>
                  <td className="p-3 text-left">{user.penduduk?.nik || '(NIK Tdk Ditemukan)'}</td>
                  <td className="p-3 text-left">{user.email}</td>
                  <td className="p-3 text-left">{new Date(user.created_at).toLocaleDateString('id-ID')}</td>
                  <td className="p-3 text-center space-x-2">
                    <button 
                      className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm flex items-center gap-1"
                      onClick={() => handleApprove(user.id_user)}
                    >
                      <FaCheck /> Setujui
                    </button>
                    <button 
                      className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm flex items-center gap-1"
                      onClick={() => handleReject(user.id_user)}
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