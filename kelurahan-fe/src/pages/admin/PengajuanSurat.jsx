/* eslint-disable no-unused-vars */
// Lokasi file: src/pages/admin/PengajuanSurat.jsx
// (FIXED: Tombol Aksi Terlihat Jelas + Search Bar)

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaEye, FaSearch } from 'react-icons/fa';
import api from '../../services/api';
import { showErrorToast } from "../../utils/sweetalert";

const StatusBadge = ({ status }) => {
  const colors = {
    Diajukan: 'bg-yellow-100 text-yellow-800',
    Diproses: 'bg-blue-100 text-blue-800',
    Selesai: 'bg-green-100 text-green-800',
    Ditolak: 'bg-red-100 text-red-800',
  };
  return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[status] || 'bg-gray-100'}`}>{status}</span>;
};

export default function PengajuanSurat() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.get('/pengajuan-layanan');
        setSubmissions(response.data.data || []);
      } catch (err) {
        showErrorToast("Gagal mengambil data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredSubmissions = submissions.filter((sub) => {
    const term = searchTerm.toLowerCase();
    const namaWarga = sub.user?.penduduk?.nama?.toLowerCase() || sub.user?.name?.toLowerCase() || "";
    const nik = sub.user?.penduduk?.nik || "";
    const layanan = sub.jenis_layanan?.nama_layanan?.toLowerCase() || "";
    return namaWarga.includes(term) || nik.includes(term) || layanan.includes(term);
  });

  if (loading) return <div className="text-center p-8"><span className="loading loading-spinner loading-lg"></span></div>;

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <h1 className="text-3xl font-semibold">Daftar Pengajuan Surat</h1>
        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FaSearch className="text-gray-400" /></div>
          <input type="text" className="w-full pl-10 pr-4 py-2 border rounded-lg" placeholder="Cari Nama / Jenis Surat..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div className="overflow-x-auto shadow-md rounded-lg bg-white">
        <table className="w-full border-collapse">
          <thead className="bg-blue-600 text-white text-sm uppercase">
            <tr>
              <th className="p-3 text-center">No</th>
              <th className="p-3 text-left">Nama Pengaju</th>
              <th className="p-3 text-left">Jenis Layanan</th>
              <th className="p-3 text-left">Tanggal</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="text-gray-700 text-sm">
            {filteredSubmissions.length === 0 ? (
              <tr><td colSpan="6" className="text-center p-6">Data tidak ditemukan.</td></tr>
            ) : (
              filteredSubmissions.map((sub, index) => (
                <tr key={sub.id_pengajuan} className="border-b hover:bg-gray-50">
                  <td className="p-3 text-center">{index + 1}</td>
                  <td className="p-3 font-medium">
                    {sub.user?.penduduk?.nama || sub.user?.name}
                    <br/><span className="text-xs text-gray-500">{sub.user?.penduduk?.nik}</span>
                  </td>
                  <td className="p-3">{sub.jenis_layanan?.nama_layanan}</td>
                  <td className="p-3">{new Date(sub.tanggal_pengajuan).toLocaleDateString('id-ID')}</td>
                  <td className="p-3 text-center"><StatusBadge status={sub.status} /></td>
                  <td className="p-3 text-center">
                    {/* FIX TOMBOL DISINI: Gunakan class manual agar warna keluar */}
                    <Link
                      to={`/admin/pengajuan/${sub.id_pengajuan || sub.id}`}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm font-medium shadow-sm"
                    >
                      <FaEye /> Detail
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}