/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaEye,
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
  no_kk: "",
  nama_kepala_keluarga: "",
  nik_kepala_keluarga: "",
  alamat: "",
  rt: "",
  rw: "",
  kelurahan: "",
  kecamatan: "",
  kabupaten: "",
  provinsi: "",
  kode_pos: "",
  tanggal_terbit: "",
  jumlah_anggota: "",
  status_keluarga: "",
};

export default function DataKK() {
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
  const [currentKkId, setCurrentKkId] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedKK, setSelectedKK] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchDataKk = async (page = 1, search = "") => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/kk?page=${page}&search=${search}`);
      const responseData = response.data.data;

      setKkList(responseData.data || []);
      setPagination({
        last_page: responseData.last_page,
        total: responseData.total,
        from: responseData.from,
        to: responseData.to,
      });
    } catch (err) {
      const msg = "Gagal mengambil data KK. " + err.message;
      setError(msg);
      showErrorToast(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDataKk(1, "");
  }, []);

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (currentPage !== 1) setCurrentPage(1);
      else fetchDataKk(1, searchTerm);
    }, 500);
    return () => clearTimeout(delaySearch);
  }, [searchTerm]);

  useEffect(() => {
    fetchDataKk(currentPage, searchTerm);
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
    setCurrentKkId(null);
    setError(null);
    setIsModalOpen(false);
  };

  const handleOpenModal = (kk = null) => {
    if (kk) {
      setFormData({
        no_kk: kk.no_kk || "",
        nama_kepala_keluarga: kk.nama_kepala_keluarga || "",
        nik_kepala_keluarga: kk.nik_kepala_keluarga || kk.nik_kepala || "",
        alamat: kk.alamat || "",
        rt: kk.rt || "",
        rw: kk.rw || "",
        kelurahan: kk.kelurahan || "",
        kecamatan: kk.kecamatan || "",
        kabupaten: kk.kabupaten || "",
        provinsi: kk.provinsi || "",
        kode_pos: kk.kode_pos || "",
        tanggal_terbit: kk.tanggal_terbit || "",
        jumlah_anggota: kk.jumlah_anggota || "",
        status_keluarga: kk.status_keluarga || "",
      });
      setCurrentKkId(kk.id_kk || kk.id);
    } else {
      setFormData(initialFormState);
      setCurrentKkId(null);
    }
    setIsModalOpen(true);
  };

  const handleShowDetail = async (id) => {
    try {
      setDetailLoading(true);
      setIsDetailModalOpen(true);
      const response = await api.get(`/kk/${id}`);
      setSelectedKK(response.data.data);
    } catch (err) {
      showErrorToast("Gagal memuat detail KK: " + err.message);
      setIsDetailModalOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedKK(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    try {
      if (currentKkId) {
        await api.put(`/kk/${currentKkId}`, formData);
        showSuccessToast("Data KK berhasil diperbarui!");
      } else {
        await api.post("/kk", formData);
        showSuccessToast("Data KK berhasil ditambahkan!");
      }
      fetchDataKk(currentPage, searchTerm);
      resetFormAndClose();
    } catch (err) {
      const msg = err.response?.data?.errors
        ? Object.values(err.response.data.errors)[0][0]
        : "Gagal menyimpan data. " + err.message;
      showErrorToast(msg);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await showDeleteConfirmation();
    if (result.isConfirmed) {
      try {
        await api.delete(`/kk/${id}`);
        showSuccessToast("Data KK berhasil dihapus.");
        fetchDataKk(currentPage, searchTerm);
      } catch (err) {
        showErrorToast(err.response?.data?.message || "Gagal menghapus data.");
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <h1 className="text-3xl font-semibold">Manajemen Kartu Keluarga (KK)</h1>

        <div className="flex w-full md:w-auto gap-3 items-center">
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="Cari Kepala Keluarga / No KK..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 whitespace-nowrap shadow-md transition-all active:scale-95"
          >
            <FaPlus size={14} /> Tambah KK
          </button>
        </div>
      </div>

      {error && !isModalOpen && (
        <div className="alert alert-error shadow-lg mb-4">
          <span>{error}</span>
        </div>
      )}

      <div className="overflow-x-auto shadow-md rounded-lg bg-white">
        <table className="w-full border-collapse rounded-lg overflow-hidden">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="p-3 text-center">No</th>
              <th className="p-3 text-left">Nomor KK</th>
              <th className="p-3 text-left">Nama Kepala</th>
              <th className="p-3 text-left">Alamat</th>
              <th className="p-3 text-left">RT/RW</th>
              <th className="p-3 text-left">Kel/Desa</th>
              <th className="p-3 text-left">Jml Anggota</th>
              <th className="p-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="text-center p-8">
                  <span className="loading loading-spinner loading-lg text-blue-500"></span>
                </td>
              </tr>
            ) : kkList.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center p-8 text-gray-500 bg-white">
                  {searchTerm ? `Data "${searchTerm}" tidak ditemukan.` : "Belum ada data KK. Silakan tambah data baru."}
                </td>
              </tr>
            ) : (
              kkList.map((kk, index) => (
                <tr key={kk.id_kk || kk.id} className="border-b bg-white text-gray-700 hover:bg-gray-50">
                  <td className="p-3 text-center">{pagination.from + index}</td>
                  <td className="p-3 text-left font-medium">{kk.no_kk}</td>
                  <td className="p-3 text-left">{kk.nama_kepala_keluarga}</td>
                  <td className="p-3 text-left truncate max-w-xs">{kk.alamat}</td>
                  <td className="p-3 text-left">{kk.rt}/{kk.rw}</td>
                  <td className="p-3 text-left">{kk.kelurahan}</td>
                  <td className="p-3 text-left">{kk.penduduks_count ?? 0}</td>
                  <td className="p-3 flex justify-center gap-2">
                    <ActionButton onClick={() => handleShowDetail(kk.id_kk || kk.id)} color="bg-blue-500 hover:bg-blue-600" icon={<FaEye />} />
                    <ActionButton onClick={() => handleOpenModal(kk)} color="bg-yellow-500 hover:bg-yellow-600" icon={<FaEdit />} />
                    <ActionButton onClick={() => handleDelete(kk.id_kk || kk.id)} color="bg-red-600 hover:bg-red-700" icon={<FaTrash />} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && kkList.length > 0 && (
        <PaginationControl
          pagination={pagination}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
      )}

      <KKFormModal
        isOpen={isModalOpen}
        onClose={resetFormAndClose}
        isEdit={!!currentKkId}
        formData={formData}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        loading={submitLoading}
      />

      <KKDetailModal
        isOpen={isDetailModalOpen}
        onClose={closeDetailModal}
        data={selectedKK}
        loading={detailLoading}
      />
    </div>
  );
}

// --- SUB COMPONENTS ---

const ActionButton = ({ onClick, color, icon }) => (
  <button onClick={onClick} className={`px-3 py-1 text-white rounded-md text-sm flex items-center gap-1 transition-colors ${color}`}>
    {icon}
  </button>
);

const PaginationControl = ({ pagination, currentPage, onPageChange }) => (
  <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
    <div className="text-xs text-gray-400 uppercase font-bold tracking-wider">
      Data {pagination.from}-{pagination.to} / {pagination.total}
    </div>
    <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-full border border-gray-200">
      <button
        className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm text-gray-600 hover:text-blue-600 disabled:opacity-50 disabled:shadow-none"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <FaChevronLeft size={12} />
      </button>
      <span className="px-3 text-sm font-semibold text-gray-600">{currentPage}</span>
      <button
        className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm text-gray-600 hover:text-blue-600 disabled:opacity-50 disabled:shadow-none"
        disabled={currentPage === pagination.last_page}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <FaChevronRight size={12} />
      </button>
    </div>
  </div>
);

const KKFormModal = ({ isOpen, onClose, isEdit, formData, handleInputChange, handleSubmit, loading }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto animate-fade-in-up">
        <button type="button" className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold" onClick={onClose}>✕</button>
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-gray-800">{isEdit ? "Edit Data Kartu Keluarga" : "Tambah Kartu Keluarga Baru"}</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input label="Nomor KK (16 Digit)" name="no_kk" value={formData.no_kk} handle={handleInputChange} type="number" required />
            <Input label="Nama Kepala Keluarga" name="nama_kepala_keluarga" value={formData.nama_kepala_keluarga} handle={handleInputChange} required />
            <Input label="NIK Kepala Keluarga" name="nik_kepala_keluarga" value={formData.nik_kepala_keluarga} handle={handleInputChange} type="number" required />
            <Input label="Tanggal Terbit" name="tanggal_terbit" value={formData.tanggal_terbit} handle={handleInputChange} type="date" />
          </div>
          <TextArea label="Alamat Lengkap" name="alamat" value={formData.alamat} handle={handleInputChange} required />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex gap-3">
              <Input label="RT" name="rt" value={formData.rt} handle={handleInputChange} type="number" required />
              <Input label="RW" name="rw" value={formData.rw} handle={handleInputChange} type="number" required />
            </div>
            <Input label="Kode Pos" name="kode_pos" value={formData.kode_pos} handle={handleInputChange} type="number" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input label="Kelurahan / Desa" name="kelurahan" value={formData.kelurahan} handle={handleInputChange} required />
            <Input label="Kecamatan" name="kecamatan" value={formData.kecamatan} handle={handleInputChange} required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input label="Kabupaten / Kota" name="kabupaten" value={formData.kabupaten} handle={handleInputChange} />
            <Input label="Provinsi" name="provinsi" value={formData.provinsi} handle={handleInputChange} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input label="Jumlah Anggota" name="jumlah_anggota" value={formData.jumlah_anggota} handle={handleInputChange} type="number" />
            <Input label="Status Keluarga" name="status_keluarga" value={formData.status_keluarga} handle={handleInputChange} placeholder="Contoh: Kepala Keluarga" />
          </div>
          <hr className="border-gray-200 my-4" />
          <div className="flex justify-end gap-3">
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

const KKDetailModal = ({ isOpen, onClose, data, loading }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-5xl rounded-xl shadow-2xl p-0 overflow-hidden animate-fade-in-up max-h-[90vh] flex flex-col">
        <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
          <h2 className="text-xl font-bold flex items-center gap-2"><FaEye /> Detail Kartu Keluarga</h2>
          <button onClick={onClose} className="text-white/80 hover:text-white text-2xl">&times;</button>
        </div>
        <div className="p-6 overflow-y-auto">
          {loading ? (
            <div className="text-center py-10"><span className="loading loading-spinner loading-lg text-blue-600"></span></div>
          ) : data ? (
            <>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div><p className="text-gray-500">Nomor KK</p><p className="font-bold text-lg text-gray-800">{data.no_kk}</p></div>
                <div><p className="text-gray-500">Kepala Keluarga</p><p className="font-bold text-lg text-gray-800">{data.nama_kepala_keluarga}</p></div>
                <div><p className="text-gray-500">Alamat</p><p className="font-bold text-gray-800">{data.alamat}, RT {data.rt}/RW {data.rw}</p></div>
              </div>
              <h3 className="font-bold text-lg mb-3 text-gray-700 border-b pb-2">Daftar Anggota Keluarga</h3>
              {data.penduduks?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead className="bg-gray-100 text-gray-700">
                      <tr>
                        <th className="p-3 text-left border">No</th>
                        <th className="p-3 text-left border">NIK</th>
                        <th className="p-3 text-left border">Nama Lengkap</th>
                        <th className="p-3 text-center border">L/P</th>
                        <th className="p-3 text-left border">Tanggal Lahir</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.penduduks.map((p, idx) => (
                        <tr key={p.id_penduduk} className="border hover:bg-gray-50">
                          <td className="p-3 border text-center">{idx + 1}</td>
                          <td className="p-3 border">{p.nik}</td>
                          <td className="p-3 border font-medium">{p.nama}</td>
                          <td className="p-3 border text-center">{p.jenis_kelamin}</td>
                          <td className="p-3 border">{p.tanggal_lahir ? new Date(p.tanggal_lahir).toLocaleDateString("id-ID") : "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-gray-500">Belum ada anggota keluarga yang terdaftar.</div>
              )}
            </>
          ) : (
            <p className="text-center text-red-500">Gagal memuat data detail.</p>
          )}
        </div>
        <div className="p-4 border-t flex justify-end bg-gray-50">
          <button onClick={onClose} className="px-5 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">Tutup</button>
        </div>
      </div>
    </div>
  );
};

const Input = ({ label, name, value, handle, type = "text", required = false, placeholder = "" }) => (
  <div className="w-full">
    <label className="block text-sm font-medium text-gray-700 mb-1.5">{label} {required && <span className="text-red-500">*</span>}</label>
    <input
      type={type}
      name={name}
      value={value || ""}
      onChange={handle}
      onWheel={(e) => type === 'number' && e.target.blur()}
      placeholder={placeholder}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-gray-50 focus:bg-white transition-all"
      required={required}
    />
  </div>
);

const TextArea = ({ label, name, value, handle, required = false }) => (
  <div className="w-full">
    <label className="block text-sm font-medium text-gray-700 mb-1.5">{label} {required && <span className="text-red-500">*</span>}</label>
    <textarea
      name={name}
      value={value || ""}
      onChange={handle}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-gray-50 focus:bg-white transition-all"
      required={required}
      rows={3}
    />
  </div>
);