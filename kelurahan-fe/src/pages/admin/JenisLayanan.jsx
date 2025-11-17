// Lokasi file: src/pages/admin/JenisLayanan.jsx
// (CRUD LENGKAP - dengan modal Tambah & Edit)

import { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import api from '../../services/api'; 

// --- STATE FORM AWAL (SESUAI DATABASE) ---
const initialFormState = {
  nama_layanan: '',
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

  // === DATA FETCHING (READ) ===
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/jenis-layanan'); // API: GET /api/jenis-layanan
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

  // === FORM & MODAL HANDLERS ===
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const resetFormAndClose = () => {
    setIsModalOpen(false);
    setTimeout(() => { 
      setFormData(initialFormState);
      setCurrentLayananId(null);
      setError(null); 
    }, 200);
  };

  const handleOpenModal = (layanan = null) => {
    if (layanan) {
      // MODE EDIT
      setFormData({
        nama_layanan: layanan.nama_layanan,
      });
      setCurrentLayananId(layanan.id_jenis_layanan || layanan.id);
    } else {
      // MODE TAMBAH
      setFormData(initialFormState);
      setCurrentLayananId(null);
    }
    setIsModalOpen(true); 
  };

  // === CRUD OPERATIONS (CREATE, UPDATE, DELETE) ===
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); 
    
    try {
      if (currentLayananId) {
        // --- UPDATE (EDIT) ---
        await api.put(`/jenis-layanan/${currentLayananId}`, formData); 
      } else {
        // --- CREATE (TAMBAH) ---
        await api.post('/jenis-layanan', formData); 
      }
      
      fetchData(); // Ambil ulang data
      resetFormAndClose(); // Tutup modal jika sukses
      
    } catch (err) {
      if (err.response && err.response.data.errors) {
        const errors = err.response.data.errors;
        const firstErrorKey = Object.keys(errors)[0];
        const firstErrorMessage = errors[firstErrorKey][0];
        setError(firstErrorMessage); // Tampilkan pesan error spesifik
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
  
  // === RENDER LOADING & ERROR ===
  if (loading) return <div className="text-center p-8"><span className="loading loading-spinner loading-lg"></span></div>;

  return (
    <div className="p-6">

      {/* HEADER (Style Anda) */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold">Manajemen Jenis Layanan</h1>
        <button
          onClick={() => handleOpenModal()} // <-- Diubah untuk membuka modal
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

      {/* TABLE LIST (Style Anda - DITAMBAH TOMBOL EDIT) */}
      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="w-full border-collapse rounded-lg overflow-hidden">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="p-3 text-center">No</th>
              <th className="p-3 text-left">Nama Layanan</th>
              <th className="p-3 text-center">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {layananList.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center p-4 bg-white">
                    Belum ada jenis layanan yang terdaftar.
                  </td>
                </tr>
            ) : (
              layananList.map((layanan, index) => (
                <tr key={layanan.id_jenis_layanan || layanan.id} className="border-b bg-white text-gray-700 hover:bg-gray-50">
                  <td className="p-3 text-center">{index + 1}</td>
                  <td className="p-3 text-left">{layanan.nama_layanan}</td>
                  <td className="p-3 flex justify-center gap-2">
                  
                  {/* --- TOMBOL EDIT BARU --- */}
                    <button
                      onClick={() => handleOpenModal(layanan)}
                      className="px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 text-sm flex items-center gap-1"
                    >
                      <FaEdit /> Edit
                    </button>
                  {/* --- SELESAI --- */}

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

      {/* ----------------- MODAL TAMBAH/EDIT KK (Perbaikan Fokus) ----------------- */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center p-4 z-50
                    transition-all duration-200
                    ${isModalOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
      >
        <div 
          className={`bg-white w-full max-w-lg rounded-xl shadow-lg p-6
                      transition-all duration-300
                      ${isModalOpen ? 'scale-100' : 'scale-90'}`}
        >
          {/* Header Modal */}
          <h2 className="text-2xl font-semibold text-center mb-4">
            {currentLayananId ? 'Edit Jenis Layanan' : 'Tambah Jenis Layanan Baru'}
          </h2>
          
          {error && isModalOpen && (
            <div className="alert alert-warning text-sm p-3 mb-4">
              <span>{error}</span>
            </div>
          )}

          {/* Form Modal */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* --- HANYA SATU INPUT --- */}
            <Input 
              label="Nama Layanan" 
              name="nama_layanan" 
              value={formData.nama_layanan} 
              handle={handleInputChange} 
              placeholder="Contoh: Surat Keterangan Tidak Mampu"
              required 
            />
            
            <FormButtons close={resetFormAndClose} />
          </form>
        </div>
      </div>

    </div>
  );
}

/* =================================================================== */
/* == KOMPONEN BAWAAN (DARI FILE ANDA, UNTUK MENJAGA STYLE) == */
/* =================================================================== */

function Input({ label, name, value, handle, type = "text", required = false, placeholder = "" }) {
  return (
    <div>
      <label className="block font-medium mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value || ''}
        onChange={handle}
        className="w-full p-2 border rounded-lg focus:ring focus:ring-blue-300"
        required={required}
        placeholder={placeholder}
      />
    </div>
  );
}

function FormButtons({ close }) {
  return (
    <div className="flex justify-between mt-6">
      <button
        type="button"
        onClick={close}
        className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
      >
        Batal
      </button>

      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Simpan
      </button>
    </div>
  );
}