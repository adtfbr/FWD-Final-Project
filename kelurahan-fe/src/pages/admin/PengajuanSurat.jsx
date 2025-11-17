// Lokasi file: src/pages/admin/PengajuanSurat.jsx
// (Tampilan ADMIN: Tabel untuk memproses ajuan)

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaEye, FaFilter } from "react-icons/fa";
import api from "../../services/api";

// Komponen badge status
const StatusBadge = ({ status }) => {
  let colorClass = "";

  switch (status) {
    case "Diajukan":
      colorClass = "bg-yellow-400 text-yellow-900";
      break;
    case "Diproses":
      colorClass = "bg-blue-400 text-blue-900";
      break;
    case "Selesai":
      colorClass = "bg-green-500 text-white";
      break;
    case "Ditolak":
      colorClass = "bg-red-500 text-white";
      break;
    default:
      colorClass = "bg-gray-400 text-gray-900";
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colorClass}`}>
      {status}
    </span>
  );
};

export default function PengajuanSurat() {
  // === STATES ===
  const [submissionList, setSubmissionList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("Semua");

  // === FETCH DATA ===
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get("/pengajuan-layanan");
      setSubmissionList(response.data.data || []);
    } catch (err) {
      setError("Gagal mengambil data pengajuan. " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // === FILTERING ===
  const filteredList = submissionList.filter((item) => {
    if (filter === "Semua") return true;
    return item.status === filter;
  });

  // === LOADING & ERROR ===
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

  // === UI ===
  return (
    <div className="p-6">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-semibold">Manajemen Pengajuan Surat</h1>

        {/* FILTER STATUS */}
        <div className="flex items-center gap-2">
          <FaFilter className="text-gray-500" />
          <select
            className="select select-bordered select-sm"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="Semua">Semua Status</option>
            <option value="Diajukan">Diajukan</option>
            <option value="Diproses">Diproses</option>
            <option value="Selesai">Selesai</option>
            <option value="Ditolak">Ditolak</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="w-full border-collapse rounded-lg overflow-hidden">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="p-3 text-center">No</th>
              <th className="p-3 text-left">Nama Pengaju</th>
              <th className="p-3 text-left">Jenis Surat</th>
              <th className="p-3 text-left">Tanggal Pengajuan</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-center">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {filteredList.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center p-4 bg-white">
                  {filter === "Semua"
                    ? "Belum ada data pengajuan."
                    : `Tidak ada pengajuan dengan status "${filter}".`}
                </td>
              </tr>
            ) : (
              filteredList.map((submission, index) => (
                <tr
                  key={submission.id_pengajuan || submission.id}
                  className="border-b bg-white text-gray-700 hover:bg-gray-50"
                >
                  <td className="p-3 text-center">{index + 1}</td>

                  <td className="p-3 text-left">
                    {submission.user?.penduduk?.nama ||
                      submission.user?.name ||
                      "Warga (TBC)"}
                  </td>

                  <td className="p-3 text-left">
                    {submission.jenis_layanan?.nama_layanan || "Jenis (TBC)"}
                  </td>

                  <td className="p-3 text-left">
                    {new Date(submission.created_at).toLocaleDateString("id-ID")}
                  </td>

                  <td className="p-3 text-center">
                    <StatusBadge status={submission.status} />
                  </td>

                  <td className="p-3 flex justify-center">
                    <Link
                      to={`/admin/pengajuan/${submission.id_pengajuan || submission.id}`}
                      className="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm flex items-center gap-1"
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
