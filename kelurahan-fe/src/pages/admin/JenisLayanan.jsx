// Lokasi file: src/pages/admin/JenisLayanan.jsx
// (REVISI FINAL: Search Bar + SweetAlert + Modal Tengah)

import { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaPlus, FaSearch } from 'react-icons/fa'; // Tambah FaSearch
import api from '../../services/api'; 
import { showSuccessToast, showErrorToast, showDeleteConfirmation } from "../../utils/sweetalert";

// --- STATE FORM AWAL ---
const initialFormState = {
  nama_layanan: '',
  deskripsi: '', 
};

export default function JenisLayanan() {
  // === STATES ===
  const [layananList, setLayananList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State Pencarian
  const [searchTerm, setSearchTerm] = useState("");

  // --- MODAL KONTROL ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentLayananId, setCurrentLayananId] = useState(null); 
  const [formData, setFormData] = useState(initialFormState);
  const [submitLoading, setSubmitLoading] = useState(false);

  // === DATA FETCHING ===
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/jenis-layanan'); 
      setLayananList(response.data.data || []); 
    } catch (err) {
      showErrorToast("Gagal mengambil data. " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- FILTER PENCARIAN ---
  const filteredLayanan = layananList.filter((item) =>
    item.nama_layanan.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // === HANDLERS ===
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const resetFormAndClose = () => {
    setFormData(initialFormState);
    setCurrentLayananId(null);
    setIsModalOpen(false);
  };

  const handleOpenModal = (layanan = null) => {
    if (layanan) {
      setFormData({
        nama_layanan: layanan.nama_layanan,
        deskripsi: layanan.deskripsi || '',
      });
      setCurrentLayananId(layanan.id_jenis_layanan || layanan.id);
    } else {
      setFormData(initialFormState);
      setCurrentLayananId(null);
    }
    setIsModalOpen(true); 
  };

  // === SUBMIT (SWEETALERT) ===
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    
    try {
      if (currentLayananId) {
        await api.put(`/jenis-layanan/${currentLayananId}`, formData); 
        showSuccessToast("Layanan berhasil diperbarui!");
      } else {
        await api.post('/jenis-layanan', formData); 
        showSuccessToast("Layanan berhasil ditambahkan!");
      }
      
      fetchData(); 
      resetFormAndClose(); 
    } catch (err) {
      if (err.response && err.response.data.errors) {
        const firstError = Object.values(err.response.data.errors)[0][0];
        showErrorToast(firstError);
      } else {
        showErrorToast("Gagal menyimpan data. " + err.message);
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  // === DELETE (SWEETALERT) ===
  const handleDelete = async (id) => {
    const result = await showDeleteConfirmation("Menghapus layanan ini mungkin mempengaruhi riwayat pengajuan.");
    
    if (result.isConfirmed) {
      try {
        await api.delete(`/jenis-layanan/${id}`); 
        showSuccessToast("Layanan berhasil dihapus.");
        fetchData(); 
      } catch (err) {
        showErrorToast("Gagal menghapus data. " + err.message);
      }
    }
  };
  
  if (loading) return <div className="text-center p-8"><span className="loading loading-spinner loading-lg"></span></div>;

  return (
    <div className="p-6">

      {/* HEADER DENGAN SEARCH BAR */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <h1 className="text-3xl font-semibold">Manajemen Jenis Layanan</h1>
        
        <div className="flex w-full md:w-auto gap-3 items-center">
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Cari Nama Layanan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 whitespace-nowrap"
          >
            <FaPlus size={14} /> Tambah Layanan
          </button>
        </div>
      </div>

      {/* TABLE LIST */}
      <div className="overflow-x-auto shadow-md rounded-lg bg-white">
        <table className="w-full border-collapse rounded-lg overflow-hidden">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="p-3 text-center">No</th>
              <th className="p-3 text-left">Nama Layanan</th>
              <th className="p-3 text-left">Deskripsi</th>
              <th className="p-3 text-center">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {filteredLayanan.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center p-8 text-gray-500">
                    {searchTerm ? "Layanan tidak ditemukan." : "Belum ada jenis layanan yang terdaftar."}
                  </td>
                </tr>
            ) : (
              filteredLayanan.map((layanan, index) => (
                <tr key={layanan.id_jenis_layanan || layanan.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 text-center">{index + 1}</td>
                  <td className="p-3 text-left font-medium">{layanan.nama_layanan}</td>
                  <td className="p-3 text-left text-gray-500 text-sm truncate max-w-xs">
                    {layanan.deskripsi || '-'}
                  </td>
                  <td className="p-3 flex justify-center gap-2">
                    <button
                      onClick={() => handleOpenModal(layanan)}
                      className="px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 text-sm flex items-center gap-1"
                    >
                      <FaEdit />
                    </button>

                    <button
                      onClick={() => handleDelete(layanan.id_jenis_layanan || layanan.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm flex items-center gap-1"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ----------------- MODAL (LAYOUT RAPI & TENGAH) ----------------- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl p-6 relative animate-fade-in-up">
            
            <button 
              type="button" 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold"
              onClick={resetFormAndClose}
            >✕</button>

            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-gray-800">
                {currentLayananId ? 'Edit Jenis Layanan' : 'Tambah Jenis Layanan Baru'}
              </h2>
              <p className="text-gray-500 text-sm mt-1">Kelola jenis surat yang tersedia untuk warga.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input 
                label="Nama Layanan" 
                name="nama_layanan" 
                value={formData.nama_layanan} 
                handle={handleInputChange} 
                placeholder="Contoh: Surat Keterangan Usaha"
                required 
              />

              <TextArea 
                label="Deskripsi Singkat" 
                name="deskripsi" 
                value={formData.deskripsi} 
                handle={handleInputChange} 
                placeholder="Penjelasan singkat tentang layanan ini..."
              />
              
              <FormButtons close={resetFormAndClose} loading={submitLoading} />
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// --- KOMPONEN HELPER ---
function Input({ label, name, value, handle, type = "text", required = false, placeholder = "" }) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value || ''}
        onChange={handle}
        placeholder={placeholder}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-gray-50 focus:bg-white"
        required={required}
      />
    </div>
  );
}

function TextArea({ label, name, value, handle, required = false, placeholder = "" }) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        name={name}
        value={value || ''}
        onChange={handle}
        placeholder={placeholder}
        rows={3}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-gray-50 focus:bg-white"
        required={required}
      />
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
        {loading ? <span className="loading loading-spinner loading-sm"></span> : "Simpan Data"}
      </button>
    </div>
  );
}