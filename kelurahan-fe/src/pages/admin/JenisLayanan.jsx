// Lokasi file: src/pages/admin/JenisLayanan.jsx
// (REVISI FINAL: Modal Rata Tengah, Desain Konsisten, +Field Deskripsi)

import { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import api from '../../services/api'; 

// --- STATE FORM AWAL ---
const initialFormState = {
  nama_layanan: '',
  deskripsi: '', // Ditambahkan agar sesuai backend
};

export default function JenisLayanan() {
  // === STATES ===
  const [layananList, setLayananList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- MODAL KONTROL ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentLayananId, setCurrentLayananId] = useState(null); 
  const [formData, setFormData] = useState(initialFormState);

  // === DATA FETCHING ===
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/jenis-layanan'); 
      setLayananList(response.data.data || []); 
    } catch (err) {
      setError("Gagal mengambil data. " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // === HANDLERS ===
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const resetFormAndClose = () => {
    setFormData(initialFormState);
    setCurrentLayananId(null);
    setError(null); 
    setIsModalOpen(false);
  };

  const handleOpenModal = (layanan = null) => {
    if (layanan) {
      // MODE EDIT
      setFormData({
        nama_layanan: layanan.nama_layanan,
        deskripsi: layanan.deskripsi || '',
      });
      setCurrentLayananId(layanan.id_jenis_layanan || layanan.id);
    } else {
      // MODE TAMBAH
      setFormData(initialFormState);
      setCurrentLayananId(null);
    }
    setIsModalOpen(true); 
  };

  // === CRUD OPERATIONS ===
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); 
    
    try {
      if (currentLayananId) {
        await api.put(`/jenis-layanan/${currentLayananId}`, formData); 
      } else {
        await api.post('/jenis-layanan', formData); 
      }
      
      fetchData(); 
      resetFormAndClose(); 
      
    } catch (err) {
      if (err.response && err.response.data.errors) {
        const errors = err.response.data.errors;
        const firstErrorKey = Object.keys(errors)[0];
        const firstErrorMessage = errors[firstErrorKey][0];
        setError(firstErrorMessage); 
      } else {
        setError("Gagal menyimpan data. " + err.message);
      }
    }
  };

  const handleDelete = async (id) => {
    setError(null); 
    if (window.confirm("Yakin ingin menghapus jenis layanan ini?")) {
      try {
        await api.delete(`/jenis-layanan/${id}`); 
        fetchData(); 
      } catch (err) {
        setError("Gagal menghapus data. " + err.message);
      }
    }
  };
  
  if (loading) return <div className="text-center p-8"><span className="loading loading-spinner loading-lg"></span></div>;

  return (
    <div className="p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold">Manajemen Jenis Layanan</h1>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <FaPlus size={14} /> Tambah Layanan
        </button>
      </div>

      {error && !isModalOpen && (
        <div className="alert alert-error shadow-lg mb-4">
          <div><span>{error}</span></div>
        </div>
      )}

      {/* TABLE LIST */}
      <div className="overflow-x-auto shadow-md rounded-lg">
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
            {layananList.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center p-4 bg-white">
                    Belum ada jenis layanan yang terdaftar.
                  </td>
                </tr>
            ) : (
              layananList.map((layanan, index) => (
                <tr key={layanan.id_jenis_layanan || layanan.id} className="border-b bg-white text-gray-700 hover:bg-gray-50">
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
                      <FaEdit /> Edit
                    </button>

                    <button
                      onClick={() => handleDelete(layanan.id_jenis_layanan || layanan.id)}
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

      {/* ----------------- MODAL (LAYOUT RAPI & TENGAH) ----------------- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl p-6 relative animate-fade-in-up">
            
            {/* Tombol Close */}
            <button 
              type="button" 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold"
              onClick={resetFormAndClose}
            >
              ✕
            </button>

            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-gray-800">
                {currentLayananId ? 'Edit Jenis Layanan' : 'Tambah Jenis Layanan Baru'}
              </h2>
              <p className="text-gray-500 text-sm mt-1">Kelola jenis surat yang tersedia untuk warga.</p>
            </div>
            
            {error && (
              <div className="alert alert-error mb-4 text-sm p-3 rounded-lg">
                <span>{error}</span>
              </div>
            )}

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
              
              <FormButtons close={resetFormAndClose} />
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

/* =================================================================== */
/* == KOMPONEN HELPER (Style Konsisten dengan Halaman Lain) == */
/* =================================================================== */

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
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white"
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
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white"
        required={required}
      />
    </div>
  );
}

function FormButtons({ close }) {
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
      >
        Simpan Data
      </button>
    </div>
  );
}