/* eslint-disable no-unused-vars */
// Lokasi file: src/pages/admin/ManajemenBerita.jsx
// (FIXED: Error Handling 422 Lebih Detail & Tombol Hapus Jelas)

import { useState, useEffect } from "react";
import { FaTrash, FaPlus, FaNewspaper, FaSearch } from "react-icons/fa";
import api from "../../services/api";
import { showSuccessToast, showErrorToast, showDeleteConfirmation } from "../../utils/sweetalert";

const STORAGE_URL = 'http://127.0.0.1:8000/storage/';

export default function ManajemenBerita() {
  const [beritaList, setBeritaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // State Modal & Form
  const [isModalOpen, setIsModalOpen] = useState(false);
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
    setIsModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError(null);

    const data = new FormData();
    data.append("judul", formData.judul);
    data.append("isi", formData.isi);
    if (gambarFile) data.append("gambar", gambarFile);

    try {
      await api.post("/berita", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      fetchBerita();
      resetFormAndClose();
    } catch (err) {
      setError("Gagal memposting berita. " + err.message);
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
            <input type="text" className="w-full pl-10 pr-4 py-2 border rounded-lg" placeholder="Cari Judul..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 whitespace-nowrap">
            <FaPlus size={14} /> Posting Berita
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBerita.length === 0 ? (
          <div className="col-span-full text-center py-10 bg-white rounded-lg shadow text-gray-500 border border-dashed">Belum ada berita.</div>
        ) : (
          filteredBerita.map((berita) => (
            <div key={berita.id_berita} className="card bg-white shadow-md border hover:shadow-xl transition-all flex flex-col h-full">
              <figure className="h-48 w-full bg-gray-100 relative">
                {berita.gambar ? (
                  <img src={`${STORAGE_URL}${berita.gambar}`} alt={berita.judul} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-gray-300"><FaNewspaper size={50} /></div>
                )}
              </figure>
              <div className="card-body p-5 flex-1">
                <h2 className="card-title text-lg font-bold leading-snug text-gray-800">{berita.judul}</h2>
                <p className="text-xs text-gray-400 mb-2">{new Date(berita.created_at).toLocaleDateString("id-ID")}</p>
                <p className="text-sm text-gray-600 line-clamp-3">{berita.isi}</p>
                
                {/* TOMBOL HAPUS DIPINDAH KESINI AGAR JELAS */}
                <div className="card-actions justify-end mt-4 pt-4 border-t">
                  <button 
                    onClick={() => handleDelete(berita.id_berita)} 
                    className="btn btn-sm btn-outline btn-error flex items-center gap-2"
                  >
                    <FaTrash /> Hapus Berita
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl p-6 relative animate-fade-in-up">
            
            <button onClick={resetFormAndClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl">✕</button>
            
            <h2 className="text-2xl font-bold mb-1 text-center text-gray-800">Buat Pengumuman</h2>
            <p className="text-center text-gray-500 text-sm mb-6">Bagikan informasi terbaru kepada warga.</p>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Input Judul */}
              <div>
                <label className="block font-medium mb-1 text-gray-700">Judul Berita</label>
                <input 
                  name="judul" 
                  value={formData.judul} 
                  onChange={handleInputChange} 
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                  placeholder="Contoh: Jadwal Imunisasi Balita" 
                  required 
                />
              </div>

              {/* Input Isi */}
              <div>
                <label className="block font-medium mb-1 text-gray-700">Isi Berita</label>
                <textarea 
                  name="isi" 
                  value={formData.isi} 
                  onChange={handleInputChange} 
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-32" 
                  placeholder="Tulis isi pengumuman di sini..." 
                  required
                ></textarea>
              </div>

              {/* Input Gambar (Dipercantik) */}
              <div>
                <label className="block font-medium mb-1 text-gray-700">Gambar Utama (Opsional)</label>
                <input 
                  type="file" 
                  onChange={handleFileChange} 
                  className="file-input file-input-bordered w-full bg-gray-50" 
                  accept="image/*" 
                />
                <span className="text-xs text-gray-400 mt-1 block">Format: JPG, PNG (Max 2MB)</span>
              </div>

              {/* Tombol Aksi (Diperbaiki Layoutnya) */}
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button 
                  type="button" 
                  onClick={resetFormAndClose} 
                  className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-md transition-all flex items-center gap-2" 
                  disabled={submitLoading}
                >
                  {submitLoading ? <span className="loading loading-spinner loading-sm"></span> : "Posting Berita"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}