// Lokasi file: src/pages/admin/DataPenduduk.jsx
// (REVISI FINAL: Server-side Pagination & Search)

import { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaPlus, FaSearch, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import api from "../../services/api";
import { showSuccessToast, showErrorToast, showDeleteConfirmation } from "../../utils/sweetalert";

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
  const [kkList, setKkList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State Pagination & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    last_page: 1,
    total: 0,
    from: 0,
    to: 0
  });

  // Modal & Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPendudukId, setCurrentPendudukId] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [submitLoading, setSubmitLoading] = useState(false);

  // === FETCH DATA (SERVER SIDE) ===
  const fetchData = async (page = 1, search = "") => {
    try {
      setLoading(true);
      
      // Request ke backend dengan parameter page & search
      const [pendudukRes, kkRes] = await Promise.all([
        api.get(`/penduduk?page=${page}&search=${search}`),
        api.get("/kk?per_page=all") // Ambil semua KK untuk dropdown (opsional: bisa dibuat search terpisah jika KK ribuan)
      ]);

      const responseData = pendudukRes.data.data; // Struktur Laravel Paginate
      
      setPendudukList(responseData.data || []);
      setPagination({
        last_page: responseData.last_page,
        total: responseData.total,
        from: responseData.from,
        to: responseData.to
      });
      
      // Untuk dropdown KK, backend KKController perlu disesuaikan jika ingin 'all', 
      // tapi sementara kita pakai data pagination default KK (10 data) atau sebaiknya buat endpoint khusus 'list-kk'
      // Untuk amannya saat ini kita ambil data data dari response paginasi default KK (hanya 10).
      // *Catatan: Idealnya buat endpoint khusus /api/list-kk-all di backend tanpa pagination untuk dropdown*
      setKkList(kkRes.data.data.data || []); 

    } catch (err) {
      showErrorToast("Gagal mengambil data. " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Efek untuk memanggil data saat Page atau Search berubah
  // Menggunakan teknik 'Debounce' sederhana untuk search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData(currentPage, searchTerm);
    }, 500); // Tunggu 500ms setelah user berhenti mengetik

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchTerm]);

  // Reset ke halaman 1 jika melakukan pencarian baru
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); 
  };

  // === HANDLERS ===
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetFormAndClose = () => {
    setFormData(initialFormState);
    setCurrentPendudukId(null);
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
      fetchData(currentPage, searchTerm); // Refresh data halaman saat ini
      resetFormAndClose();
    } catch (err) {
      if (err.response?.data?.errors) {
        showErrorToast(Object.values(err.response.data.errors)[0][0]);
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
        showErrorToast("Gagal menghapus data. " + err.message);
      }
    }
  };

  return (
    <div className="p-6">
      {/* HEADER & SEARCH */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <h1 className="text-3xl font-semibold text-gray-800">Manajemen Data Penduduk</h1>

        <div className="flex w-full md:w-auto gap-3 items-center">
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="Cari Nama / NIK..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <button onClick={() => handleOpenModal()} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 whitespace-nowrap">
            <FaPlus size={14} /> Tambah Penduduk
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto shadow-md rounded-lg bg-white">
        <table className="w-full text-sm text-left text-gray-600">
          <thead className="text-xs text-white uppercase bg-blue-600">
            <tr>
              <th className="px-6 py-3 text-center">No</th>
              <th className="px-6 py-3">Nama</th>
              <th className="px-6 py-3">NIK</th>
              <th className="px-6 py-3">No. KK</th>
              <th className="px-6 py-3">Alamat</th>
              <th className="px-6 py-3 text-center">L/P</th>
              <th className="px-6 py-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
                <tr><td colSpan="7" className="text-center py-8"><span className="loading loading-spinner loading-lg"></span></td></tr>
            ) : pendudukList.length === 0 ? (
              <tr><td colSpan="7" className="text-center py-8 text-gray-500 bg-white">Data tidak ditemukan.</td></tr>
            ) : (
              pendudukList.map((penduduk, index) => (
                <tr key={penduduk.id_penduduk} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 text-center">{(currentPage - 1) * 10 + index + 1}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{penduduk.nama}</td>
                  <td className="px-6 py-4">{penduduk.nik}</td>
                  <td className="px-6 py-4">{penduduk.kk?.no_kk || '-'}</td>
                  <td className="px-6 py-4 truncate max-w-xs" title={penduduk.alamat}>{penduduk.alamat}</td>
                  <td className="px-6 py-4 text-center">{penduduk.jenis_kelamin}</td>
                  <td className="px-6 py-4 flex justify-center gap-2">
                    <button onClick={() => handleOpenModal(penduduk)} className="btn btn-sm btn-warning text-white"><FaEdit /></button>
                    <button onClick={() => handleDelete(penduduk.id_penduduk)} className="btn btn-sm btn-error text-white"><FaTrash /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION CONTROL */}
      {!loading && pendudukList.length > 0 && (
        <div className="flex justify-between items-center mt-4 px-2">
            <span className="text-sm text-gray-500">
                Menampilkan {pagination.from} - {pagination.to} dari {pagination.total} data
            </span>
            <div className="join shadow-sm">
                <button 
                    className="join-item btn btn-sm btn-outline bg-white" 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                >
                    <FaChevronLeft />
                </button>
                <button className="join-item btn btn-sm btn-outline bg-white pointer-events-none">
                    Halaman {currentPage}
                </button>
                <button 
                    className="join-item btn btn-sm btn-outline bg-white" 
                    disabled={currentPage === pagination.last_page}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                >
                    <FaChevronRight />
                </button>
            </div>
        </div>
      )}

      {/* MODAL FORM (PASTI TENGAH) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto animate-fade-in-up">
            <button onClick={resetFormAndClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold">✕</button>
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-gray-800">{currentPendudukId ? "Edit Data Penduduk" : "Tambah Data Penduduk Baru"}</h2>
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
                <Input label="Telepon" name="telepon" value={formData.telepon} handle={handleInputChange} type="tel" />
              </div>
              <TextArea label="Alamat Domisili" name="alamat" value={formData.alamat} handle={handleInputChange} required />
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                <p className="text-xs text-blue-800 font-semibold mb-2">Akun Login (Opsional)</p>
                <Input label="Email (Untuk login warga)" name="email" value={formData.email} handle={handleInputChange} type="email" placeholder="Kosongkan jika tidak perlu" />
              </div>
              <FormButtons close={resetFormAndClose} loading={submitLoading} />
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ... (Helper Components Sama Seperti Sebelumnya)
function SelectKK({ kkList, value, handle, required = false }) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1.5">Pilih Kartu Keluarga (KK) {required && <span className="text-red-500">*</span>}</label>
      <select name="id_kk" value={value || ""} onChange={handle} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none bg-white" required={required}>
        <option value="">-- Pilih Nomor KK --</option>
        {kkList.length > 0 ? kkList.map((kk) => <option key={kk.id_kk} value={kk.id_kk}>{kk.no_kk} - {kk.nama_kepala_keluarga}</option>) : <option disabled>Data KK Kosong</option>}
      </select>
    </div>
  );
}
// (Komponen Input, TextArea, SelectGender, FormButtons sama persis dengan sebelumnya, tidak saya tulis ulang agar tidak kepanjangan)
function Input({ label, name, value, handle, type = "text", required, placeholder }) { return (<div className="w-full"><label className="block text-sm font-medium text-gray-700 mb-1.5">{label} {required && <span className="text-red-500">*</span>}</label><input type={type} name={name} value={value || ""} onChange={handle} placeholder={placeholder} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none bg-gray-50 focus:bg-white" required={required} /></div>); }
function TextArea({ label, name, value, handle, required }) { return (<div className="w-full"><label className="block text-sm font-medium text-gray-700 mb-1.5">{label} {required && <span className="text-red-500">*</span>}</label><textarea name={name} value={value || ""} onChange={handle} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none bg-gray-50 focus:bg-white" required={required} rows={2} /></div>); }
function SelectGender({ value, handle, required }) { return (<div className="w-full"><label className="block text-sm font-medium text-gray-700 mb-1.5">Jenis Kelamin {required && <span className="text-red-500">*</span>}</label><select name="jenis_kelamin" value={value || ""} onChange={handle} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none bg-white" required={required}><option value="">-- Pilih --</option><option value="L">Laki-laki</option><option value="P">Perempuan</option></select></div>); }
function FormButtons({ close, loading }) { return (<div className="flex justify-end gap-3 mt-6"><button type="button" onClick={close} className="px-5 py-2.5 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300">Batal</button><button type="submit" className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow-md" disabled={loading}>{loading ? "Menyimpan..." : "Simpan Data"}</button></div>); }