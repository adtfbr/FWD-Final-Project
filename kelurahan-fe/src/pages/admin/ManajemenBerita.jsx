/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { FaTrash, FaPlus, FaNewspaper, FaSearch, FaEdit } from "react-icons/fa";
import api from "../../services/api";
import { showSuccessToast, showErrorToast, showDeleteConfirmation } from "../../utils/sweetalert";

const STORAGE_URL = 'http://127.0.0.1:8000/storage/';

export default function ManajemenBerita() {
  const [beritaList, setBeritaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBeritaId, setCurrentBeritaId] = useState(null);
  const [formData, setFormData] = useState({ judul: "", isi: "" });
  const [gambarFile, setGambarFile] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchBerita = async () => {
    try {
      setLoading(true);
      const response = await api.get("/berita");
      setBeritaList(response.data.data || []);
    } catch (err) {
      showErrorToast("Gagal mengambil berita.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBerita();
  }, []);

  const filteredBerita = beritaList.filter((item) =>
    item.judul.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setGambarFile(e.target.files[0]);
  };

  const resetFormAndClose = () => {
    setFormData({ judul: "", isi: "" });
    setGambarFile(null);
    setCurrentBeritaId(null);
    setIsModalOpen(false);
  };

  const handleOpenModal = (berita = null) => {
    if (berita) {
      setFormData({
        judul: berita.judul,
        isi: berita.isi,
      });
      setCurrentBeritaId(berita.id_berita);
    } else {
      setFormData({ judul: "", isi: "" });
      setCurrentBeritaId(null);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    const data = new FormData();
    data.append("judul", formData.judul);
    data.append("isi", formData.isi);
    
    if (gambarFile) {
      data.append("gambar", gambarFile);
    }

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };

    try {
      if (currentBeritaId) {
        data.append("_method", "PUT");
        await api.post(`/berita/${currentBeritaId}`, data, config);
        showSuccessToast("Berita berhasil diperbarui!");
      } else {
        await api.post("/berita", data, config);
        showSuccessToast("Berita berhasil diposting!");
      }

      fetchBerita();
      resetFormAndClose();
    } catch (err) {
      console.error("Error Detail:", err.response);
      
      if (err.response && err.response.data && err.response.data.errors) {
        const errors = err.response.data.errors;
        const firstErrorKey = Object.keys(errors)[0];
        const firstErrorMessage = errors[firstErrorKey][0];
        showErrorToast(firstErrorMessage);
      } else if (err.response && err.response.data && err.response.data.message) {
        showErrorToast(err.response.data.message);
      } else {
        showErrorToast("Gagal menyimpan berita. Pastikan ukuran gambar di bawah 2MB.");
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await showDeleteConfirmation("Berita akan dihapus permanen.");
    if (result.isConfirmed) {
      try {
        await api.delete(`/berita/${id}`);
        fetchBerita();
        showSuccessToast("Berita berhasil dihapus.");
      } catch (err) {
        showErrorToast("Gagal menghapus berita.");
      }
    }
  };

  if (loading) return <div className="text-center p-8"><span className="loading loading-spinner loading-lg"></span></div>;

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <h1 className="text-3xl font-semibold">Manajemen Berita</h1>
        <div className="flex w-full md:w-auto gap-3 items-center">
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FaSearch className="text-gray-400" /></div>
            <input 
              type="text" 
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
              placeholder="Cari Judul..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
          <button onClick={() => handleOpenModal()} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 whitespace-nowrap shadow-md transition-all active:scale-95">
            <FaPlus size={14} /> Posting Berita
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBerita.length === 0 ? (
          <div className="col-span-full text-center py-10 bg-white rounded-lg shadow text-gray-500 border border-dashed">
            {searchTerm ? "Berita tidak ditemukan." : "Belum ada berita yang diposting."}
          </div>
        ) : (
          filteredBerita.map((berita) => (
            <BeritaCard 
              key={berita.id_berita} 
              berita={berita} 
              onEdit={() => handleOpenModal(berita)} 
              onDelete={() => handleDelete(berita.id_berita)} 
            />
          ))
        )}
      </div>

      <BeritaFormModal
        isOpen={isModalOpen}
        onClose={resetFormAndClose}
        isEdit={!!currentBeritaId}
        formData={formData}
        handleInputChange={handleInputChange}
        handleFileChange={handleFileChange}
        handleSubmit={handleSubmit}
        loading={submitLoading}
      />
    </div>
  );
}

const BeritaCard = ({ berita, onEdit, onDelete }) => (
  <div className="card bg-white shadow-md border hover:shadow-xl transition-all flex flex-col h-full rounded-xl overflow-hidden group">
    <figure className="h-48 w-full bg-gray-100 relative overflow-hidden">
      {berita.gambar ? (
        <img 
          src={`${STORAGE_URL}${berita.gambar}`} 
          alt={berita.judul} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
          onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x400?text=No+Image"; }}
        />
      ) : (
        <div className="flex items-center justify-center w-full h-full text-gray-300 bg-gray-50"><FaNewspaper size={50} /></div>
      )}
    </figure>
    <div className="card-body p-5 flex-1 flex flex-col">
      <h2 className="card-title text-lg font-bold leading-snug text-gray-800 line-clamp-2" title={berita.judul}>{berita.judul}</h2>
      <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
        {new Date(berita.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}
      </p>
      <p className="text-sm text-gray-600 line-clamp-3 mb-4 flex-1">{berita.isi}</p>
      
      <div className="card-actions justify-end mt-auto pt-4 border-t flex gap-2">
        <button 
          onClick={onEdit} 
          className="px-3 py-1.5 text-sm bg-yellow-50 text-yellow-600 border border-yellow-200 rounded-lg hover:bg-yellow-100 flex items-center gap-2 transition-colors"
        >
          <FaEdit /> Edit
        </button>
        <button 
          onClick={onDelete} 
          className="px-3 py-1.5 text-sm bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 flex items-center gap-2 transition-colors"
        >
          <FaTrash /> Hapus
        </button>
      </div>
    </div>
  </div>
);

const BeritaFormModal = ({ isOpen, onClose, isEdit, formData, handleInputChange, handleFileChange, handleSubmit, loading }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl p-6 relative animate-fade-in-up max-h-[90vh] overflow-y-auto">
        
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold">✕</button>
        
        <h2 className="text-2xl font-bold mb-1 text-center text-gray-800">
          {isEdit ? "Edit Berita" : "Buat Pengumuman"}
        </h2>
        <p className="text-center text-gray-500 text-sm mb-6">
          {isEdit ? "Perbarui informasi berita." : "Bagikan informasi terbaru kepada warga."}
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block font-medium mb-1 text-gray-700">Judul Berita</label>
            <input 
              name="judul" 
              value={formData.judul} 
              onChange={handleInputChange} 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
              placeholder="Contoh: Jadwal Imunisasi Balita" 
              required 
            />
          </div>

          <div>
            <label className="block font-medium mb-1 text-gray-700">Isi Berita</label>
            <textarea 
              name="isi" 
              value={formData.isi} 
              onChange={handleInputChange} 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-32 transition-all" 
              placeholder="Tulis isi pengumuman di sini..." 
              required
            ></textarea>
          </div>

          <div>
            <label className="block font-medium mb-1 text-gray-700">
              {isEdit ? "Ganti Gambar (Opsional)" : "Gambar Utama (Opsional)"}
            </label>
            <input 
              type="file" 
              onChange={handleFileChange} 
              className="file-input file-input-bordered w-full bg-gray-50 border-gray-300" 
              accept="image/*" 
            />
            <span className="text-xs text-gray-400 mt-1 block">Format: JPG, PNG (Max 2MB)</span>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
            >
              Batal
            </button>
            <button 
              type="submit" 
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-md transition-all flex items-center gap-2" 
              disabled={loading}
            >
              {loading ? <span className="loading loading-spinner loading-sm"></span> : (isEdit ? "Simpan Perubahan" : "Posting Berita")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};