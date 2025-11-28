/* eslint-disable react-hooks/exhaustive-deps */
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
  const [pendudukList, setPendudukList] = useState([]);
  const [kkList, setKkList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    last_page: 1,
    total: 0,
    from: 0,
    to: 0,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPendudukId, setCurrentPendudukId] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchData = async (page = 1, search = "") => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/penduduk?page=${page}&search=${search}`);
      const responseData = response.data.data;

      setPendudukList(responseData.data || []);
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

  const fetchKKList = async () => {
    try {
      const response = await api.get("/kk?limit=all");
      const dataKK = response.data.data;
      if (dataKK.data) {
        setKkList(dataKK.data);
      } else {
        setKkList(dataKK);
      }
    } catch (err) {
      console.error("Gagal load KK:", err);
    }
  };

  useEffect(() => {
    fetchData(1, "");
    fetchKKList();
  }, []);

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (currentPage !== 1) setCurrentPage(1);
      else fetchData(1, searchTerm);
    }, 500);
    return () => clearTimeout(delaySearch);
  }, [searchTerm]);

  useEffect(() => {
    fetchData(currentPage, searchTerm);
  }, [currentPage]);

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

      fetchData(currentPage, searchTerm);
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

  const handleDelete = async (id) => {
    const result = await showDeleteConfirmation();

    if (result.isConfirmed) {
      try {
        await api.delete(`/penduduk/${id}`);
        showSuccessToast("Data berhasil dihapus.");
        fetchData(currentPage, searchTerm);
      } catch (err) {
        const msg =
          err.response?.data?.message || "Gagal menghapus data. " + err.message;
        showErrorToast(msg);
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <h1 className="text-3xl font-semibold">Manajemen Data Penduduk</h1>

        <div className="flex w-full md:w-auto gap-3 items-center">
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Cari Nama / NIK..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 whitespace-nowrap shadow-md transition-all active:scale-95"
          >
            <FaPlus size={14} /> Tambah Penduduk
          </button>
        </div>
      </div>

      {error && !isModalOpen && (
        <div className="alert alert-error shadow-lg mb-4">
          <span>{error}</span>
        </div>
      )}

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
                <td colSpan="7" className="text-center p-8 text-gray-500 bg-white">
                  {searchTerm
                    ? `Data "${searchTerm}" tidak ditemukan.`
                    : "Belum ada data penduduk. Silakan tambah data baru."}
                </td>
              </tr>
            ) : (
              pendudukList.map((penduduk, index) => (
                <tr key={penduduk.id_penduduk || penduduk.id} className="border-b bg-white text-gray-700 hover:bg-gray-50">
                  <td className="p-3 text-center">{pagination.from + index}</td>
                  <td className="p-3 text-left font-medium">{penduduk.nama}</td>
                  <td className="p-3 text-left">{penduduk.nik}</td>
                  <td className="p-3 text-left">{penduduk.kk ? penduduk.kk.no_kk : "-"}</td>
                  <td className="p-3 truncate max-w-xs" title={penduduk.alamat}>{penduduk.alamat}</td>
                  <td className="p-3 text-center">{penduduk.jenis_kelamin}</td>
                  <td className="p-3 flex justify-center gap-2">
                    <ActionButton onClick={() => handleOpenModal(penduduk)} color="bg-yellow-500 hover:bg-yellow-600" icon={<FaEdit />} text="Edit" />
                    <ActionButton onClick={() => handleDelete(penduduk.id_penduduk || penduduk.id)} color="bg-red-600 hover:bg-red-700" icon={<FaTrash />} text="Hapus" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && pendudukList.length > 0 && (
        <PaginationControl
          pagination={pagination}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
      )}

      <PendudukFormModal
        isOpen={isModalOpen}
        onClose={resetFormAndClose}
        isEdit={!!currentPendudukId}
        formData={formData}
        kkList={kkList}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        loading={submitLoading}
      />
    </div>
  );
}

const ActionButton = ({ onClick, color, icon, text }) => (
  <button onClick={onClick} className={`px-3 py-1 text-white rounded-md text-sm flex items-center gap-1 transition-colors ${color}`}>
    {icon} {text}
  </button>
);

const PaginationControl = ({ pagination, currentPage, onPageChange }) => (
  <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
    <div className="text-xs text-gray-400 uppercase font-bold tracking-wider">
      Data {pagination.from}-{pagination.to} / {pagination.total}
    </div>
    <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-full border border-gray-200">
      <button
        className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm text-gray-600 hover:text-blue-600 disabled:opacity-50"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <FaChevronLeft size={12} />
      </button>
      <span className="px-3 text-sm font-semibold text-gray-600">{currentPage}</span>
      <button
        className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm text-gray-600 hover:text-blue-600 disabled:opacity-50"
        disabled={currentPage === pagination.last_page}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <FaChevronRight size={12} />
      </button>
    </div>
  </div>
);

const PendudukFormModal = ({ isOpen, onClose, isEdit, formData, kkList, handleInputChange, handleSubmit, loading }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto animate-fade-in-up">
        <button type="button" className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold" onClick={onClose}>✕</button>
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-gray-800">{isEdit ? "Edit Data Penduduk" : "Tambah Data Penduduk Baru"}</h2>
          <p className="text-gray-500 text-sm mt-1">Pastikan data sesuai KTP/KK.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <SelectKK kkList={kkList} value={formData.id_kk} handle={handleInputChange} required />
          <Input label="Nama Lengkap" name="nama" value={formData.nama} handle={handleInputChange} required />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input label="NIK (16 Digit)" name="nik" value={formData.nik} handle={handleInputChange} type="number" required />
            <SelectGender value={formData.jenis_kelamin} handle={handleInputChange} required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input label="Tanggal Lahir" name="tanggal_lahir" value={formData.tanggal_lahir} handle={handleInputChange} type="date" required />
            <Input label="Telepon (Opsional)" name="telepon" value={formData.telepon} handle={handleInputChange} type="tel" />
          </div>
          <TextArea label="Alamat Domisili" name="alamat" value={formData.alamat} handle={handleInputChange} required />
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
            <p className="text-xs text-blue-800 font-semibold mb-2">Akun Login (Opsional)</p>
            <Input label="Email (Untuk login warga)" name="email" value={formData.email} handle={handleInputChange} type="email" placeholder="Kosongkan jika tidak perlu" />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={onClose} className="px-5 py-2.5 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300">Batal</button>
            <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow-md" disabled={loading}>
              {loading ? <span className="loading loading-spinner loading-sm"></span> : "Simpan Data"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SelectKK = ({ kkList, value, handle, required = false }) => (
  <div className="w-full">
    <label className="block text-sm font-medium text-gray-700 mb-1.5">Pilih Kartu Keluarga (KK) {required && <span className="text-red-500">*</span>}</label>
    <select name="id_kk" value={value || ""} onChange={handle} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white" required={required}>
      <option value="">-- Pilih Nomor KK --</option>
      {kkList.length > 0 ? kkList.map((kk) => <option key={kk.id_kk} value={kk.id_kk}>{kk.no_kk} - {kk.nama_kepala_keluarga}</option>) : <option disabled>Data KK Kosong</option>}
    </select>
  </div>
);

const Input = ({ label, name, value, handle, type = "text", required = false, placeholder = "" }) => (
  <div className="w-full">
    <label className="block text-sm font-medium text-gray-700 mb-1.5">{label} {required && <span className="text-red-500">*</span>}</label>
    <input type={type} name={name} value={value || ""} onChange={handle} onWheel={(e) => type === 'number' && e.target.blur()} placeholder={placeholder} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-gray-50 focus:bg-white" required={required} />
  </div>
);

const TextArea = ({ label, name, value, handle, required = false }) => (
  <div className="w-full">
    <label className="block text-sm font-medium text-gray-700 mb-1.5">{label} {required && <span className="text-red-500">*</span>}</label>
    <textarea name={name} value={value || ""} onChange={handle} rows={2} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-gray-50 focus:bg-white" required={required} />
  </div>
);

const SelectGender = ({ value, handle, required = false }) => (
  <div className="w-full">
    <label className="block text-sm font-medium text-gray-700 mb-1.5">Jenis Kelamin {required && <span className="text-red-500">*</span>}</label>
    <select name="jenis_kelamin" value={value || ""} onChange={handle} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white" required={required}>
      <option value="">-- Pilih --</option>
      <option value="L">Laki-laki</option>
      <option value="P">Perempuan</option>
    </select>
  </div>
);