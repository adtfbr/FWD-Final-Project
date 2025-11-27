// Lokasi file: src/pages/admin/DataPenduduk.jsx
// (REVISI FINAL: Server-side Pagination & Search)

import { useState, useEffect } from "react";
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import api from "../../services/api";
import {
  showSuccessToast,
  showErrorToast,
  showDeleteConfirmation,
} from "../../utils/sweetalert";

// --- STATE FORM AWAL ---
const initialFormState = {
  id_kk: "",
  nik: "",
  nama: "",
  alamat: "",
  jenis_kelamin: "",
  tanggal_lahir: "",
  email: "",
  telepon: "",
};

export default function DataPenduduk() {
  // === STATES ===
  const [pendudukList, setPendudukList] = useState([]);
  const [kkList, setKkList] = useState([]); // List KK untuk dropdown
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State Pagination & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    last_page: 1,
    total: 0,
    from: 0,
    to: 0,
  });

  // === MODAL KONTROL ===
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPendudukId, setCurrentPendudukId] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [submitLoading, setSubmitLoading] = useState(false);

  // === FETCH DATA (SERVER SIDE PAGINATION) ===
  const fetchData = async (page = 1, search = "") => {
    try {
      setLoading(true);
      setError(null);

      // Request data penduduk dengan parameter page & search
      const response = await api.get(`/penduduk?page=${page}&search=${search}`);
      const responseData = response.data.data; // Objek pagination Laravel

      // Simpan list penduduk (ada di dalam properti .data)
      setPendudukList(responseData.data || []);

      // Simpan meta data pagination
      setPagination({
        last_page: responseData.last_page,
        total: responseData.total,
        from: responseData.from,
        to: responseData.to,
      });
    } catch (err) {
      const msg = "Gagal mengambil data. " + err.message;
      setError(msg);
      showErrorToast(msg);
    } finally {
      setLoading(false);
    }
  };

  // === FETCH DATA KK (UNTUK DROPDOWN) ===
  const fetchKKList = async () => {
    try {
      const response = await api.get("/kk"); // Catatan: Ini mengambil page 1 dari KK
      const dataKK = response.data.data;
      // Handle jika backend KK juga mengembalikan pagination
      if (dataKK.data) {
        setKkList(dataKK.data);
      } else {
        setKkList(dataKK); // Fallback jika backend mengembalikan array langsung
      }
    } catch (err) {
      console.error("Gagal load KK:", err);
    }
  };

  // Efek Pertama Kali Load
  useEffect(() => {
    fetchData(1, "");
    fetchKKList();
  }, []);

  // Efek Search Debounce (Mencegah request berlebihan saat mengetik)
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      // Reset ke halaman 1 setiap kali search berubah
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchData(1, searchTerm);
      }
    }, 500); // Tunggu 500ms

    return () => clearTimeout(delaySearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  // Efek Ganti Halaman
  useEffect(() => {
    fetchData(currentPage, searchTerm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  // === HANDLERS ===
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.last_page) {
      setCurrentPage(newPage);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetFormAndClose = () => {
    setFormData(initialFormState);
    setCurrentPendudukId(null);
    setError(null);
    setIsModalOpen(false);
  };

  const handleOpenModal = (penduduk = null) => {
    if (penduduk) {
      setFormData({
        id_kk: penduduk.id_kk || "",
        nik: penduduk.nik || "",
        nama: penduduk.nama || "",
        alamat: penduduk.alamat || "",
        jenis_kelamin: penduduk.jenis_kelamin || "",
        tanggal_lahir: penduduk.tanggal_lahir || "",
        email: penduduk.email || "",
        telepon: penduduk.telepon || "",
      });
      setCurrentPendudukId(penduduk.id_penduduk || penduduk.id);
    } else {
      setFormData(initialFormState);
      setCurrentPendudukId(null);
    }
    setIsModalOpen(true);
  };

  // === SUBMIT ===
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    try {
      if (currentPendudukId) {
        await api.put(`/penduduk/${currentPendudukId}`, formData);
        showSuccessToast("Data penduduk berhasil diperbarui!");
      } else {
        await api.post("/penduduk", formData);
        showSuccessToast("Data penduduk berhasil ditambahkan!");
      }

      fetchData(currentPage, searchTerm); // Refresh halaman saat ini
      resetFormAndClose();
    } catch (err) {
      if (err.response && err.response.data.errors) {
        const errors = err.response.data.errors;
        const firstErrorKey = Object.keys(errors)[0];
        const firstErrorMessage = errors[firstErrorKey][0];
        showErrorToast(firstErrorMessage);
      } else {
        showErrorToast("Gagal menyimpan data. " + err.message);
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  // === DELETE ===
  const handleDelete = async (id) => {
    const result = await showDeleteConfirmation();

    if (result.isConfirmed) {
      try {
        await api.delete(`/penduduk/${id}`);
        showSuccessToast("Data berhasil dihapus.");
        fetchData(currentPage, searchTerm); // Refresh data
      } catch (err) {
        const msg =
          err.response?.data?.message || "Gagal menghapus data. " + err.message;
        showErrorToast(msg);
      }
    }
  };

  return (
    <div className="p-6">
      {/* HEADER DENGAN SEARCH BAR */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <h1 className="text-3xl font-semibold">Manajemen Data Penduduk</h1>

        <div className="flex w-full md:w-auto gap-3 items-center">
          {/* Input Pencarian */}
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Cari Nama / NIK..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 whitespace-nowrap"
          >
            <FaPlus size={14} /> Tambah Penduduk
          </button>
        </div>
      </div>

      {error && !isModalOpen && (
        <div className="alert alert-error shadow-lg mb-4">
          <div>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* TABLE */}
      <div className="overflow-x-auto shadow-md rounded-lg bg-white">
        <table className="w-full border-collapse overflow-hidden rounded-lg">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="p-3 text-center">No</th>
              <th className="p-3 text-left">Nama</th>
              <th className="p-3 text-left">NIK</th>
              <th className="p-3 text-left">No. KK</th>
              <th className="p-3 text-left">Alamat</th>
              <th className="p-3 text-center">L/P</th>
              <th className="p-3 text-center">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center p-8">
                  <span className="loading loading-spinner loading-lg text-blue-500"></span>
                </td>
              </tr>
            ) : pendudukList.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  className="text-center p-8 text-gray-500 bg-white"
                >
                  {searchTerm
                    ? `Data "${searchTerm}" tidak ditemukan.`
                    : "Belum ada data penduduk. Silakan tambah data baru."}
                </td>
              </tr>
            ) : (
              pendudukList.map((penduduk, index) => (
                <tr
                  key={penduduk.id_penduduk || penduduk.id}
                  className="border-b bg-white text-gray-700 hover:bg-gray-50"
                >
                  {/* Hitung nomor urut berdasarkan halaman */}
                  <td className="p-3 text-center">{pagination.from + index}</td>
                  <td className="p-3 text-left font-medium">{penduduk.nama}</td>
                  <td className="p-3 text-left">{penduduk.nik}</td>
                  <td className="p-3 text-left">
                    {penduduk.kk ? penduduk.kk.no_kk : "-"}
                  </td>
                  <td className="p-3 truncate max-w-xs" title={penduduk.alamat}>
                    {penduduk.alamat}
                  </td>
                  <td className="p-3 text-center">{penduduk.jenis_kelamin}</td>

                  <td className="p-3 flex justify-center gap-2">
                    <button
                      onClick={() => handleOpenModal(penduduk)}
                      className="px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 text-sm flex items-center gap-1"
                    >
                      <FaEdit /> Edit
                    </button>

                    <button
                      onClick={() =>
                        handleDelete(penduduk.id_penduduk || penduduk.id)
                      }
                      className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm flex items-center gap-1"
                    >
                      <FaTrash /> Hapus
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION CONTROL - MINIMALIST */}
      {!loading && pendudukList.length > 0 && (
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
          {/* Info text */}
          <div className="text-xs text-gray-400 uppercase font-bold tracking-wider">
            Data {pagination.from}-{pagination.to} / {pagination.total}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-full border border-gray-200">
            <button
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all disabled:shadow-none disabled:bg-transparent disabled:text-gray-300"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              <FaChevronLeft size={12} />
            </button>

            <span className="px-3 text-sm font-semibold text-gray-600">
              {currentPage}
            </span>

            <button
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all disabled:shadow-none disabled:bg-transparent disabled:text-gray-300"
              disabled={currentPage === pagination.last_page}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              <FaChevronRight size={12} />
            </button>
          </div>
        </div>
      )}

      {/* ==================== MODAL MANUAL ==================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto animate-fade-in-up">
            <button
              type="button"
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold"
              onClick={resetFormAndClose}
            >
              ✕
            </button>

            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-gray-800">
                {currentPendudukId
                  ? "Edit Data Penduduk"
                  : "Tambah Data Penduduk Baru"}
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Pastikan data sesuai KTP/KK.
              </p>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <SelectKK
                kkList={kkList}
                value={formData.id_kk}
                handle={handleInputChange}
                required
              />

              <Input
                label="Nama Lengkap"
                name="nama"
                value={formData.nama}
                handle={handleInputChange}
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input
                  label="NIK (16 Digit)"
                  name="nik"
                  value={formData.nik}
                  handle={handleInputChange}
                  type="number"
                  required
                />

                <SelectGender
                  value={formData.jenis_kelamin}
                  handle={handleInputChange}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input
                  label="Tanggal Lahir"
                  name="tanggal_lahir"
                  value={formData.tanggal_lahir}
                  handle={handleInputChange}
                  type="date"
                  required
                />
                <Input
                  label="Telepon (Opsional)"
                  name="telepon"
                  value={formData.telepon}
                  handle={handleInputChange}
                  type="tel"
                />
              </div>

              <TextArea
                label="Alamat Domisili"
                name="alamat"
                value={formData.alamat}
                handle={handleInputChange}
                required
              />

              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                <p className="text-xs text-blue-800 font-semibold mb-2">
                  Akun Login (Opsional)
                </p>
                <Input
                  label="Email (Untuk login warga)"
                  name="email"
                  value={formData.email}
                  handle={handleInputChange}
                  type="email"
                  placeholder="Kosongkan jika tidak perlu"
                />
              </div>

              <FormButtons close={resetFormAndClose} loading={submitLoading} />
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ... (Komponen Helper SelectKK, Input, TextArea, SelectGender, FormButtons tetap sama seperti sebelumnya)

function SelectKK({ kkList, value, handle, required = false }) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        Pilih Kartu Keluarga (KK){" "}
        {required && <span className="text-red-500">*</span>}
      </label>
      <select
        name="id_kk"
        value={value || ""}
        onChange={handle}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
        required={required}
      >
        <option value="">-- Pilih Nomor KK --</option>
        {kkList.length > 0 ? (
          kkList.map((kk) => (
            <option key={kk.id_kk} value={kk.id_kk}>
              {kk.no_kk} - {kk.nama_kepala_keluarga}
            </option>
          ))
        ) : (
          <option disabled>Data KK Kosong / Gagal Memuat</option>
        )}
      </select>
    </div>
  );
}

function Input({
  label,
  name,
  value,
  handle,
  type = "text",
  required = false,
  placeholder = "",
}) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value || ""}
        onChange={handle}
        placeholder={placeholder}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white"
        required={required}
      />
    </div>
  );
}

function TextArea({ label, name, value, handle, required = false }) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        name={name}
        value={value || ""}
        onChange={handle}
        rows={2}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white"
        required={required}
      />
    </div>
  );
}

function SelectGender({ value, handle, required = false }) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        Jenis Kelamin {required && <span className="text-red-500">*</span>}
      </label>
      <select
        name="jenis_kelamin"
        value={value || ""}
        onChange={handle}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
        required={required}
      >
        <option value="">-- Pilih --</option>
        <option value="L">Laki-laki</option>
        <option value="P">Perempuan</option>
      </select>
    </div>
  );
}

function FormButtons({ close, loading }) {
  return (
    <div className="flex justify-end gap-3 mt-6">
      <button
        type="button"
        onClick={close}
        className="px-5 py-2.5 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
      >
        Batal
      </button>

      <button
        type="submit"
        className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow-md transition-all hover:scale-[1.02]"
        disabled={loading}
      >
        {loading ? (
          <span className="loading loading-spinner loading-sm"></span>
        ) : (
          "Simpan Data"
        )}
      </button>
    </div>
  );
}
