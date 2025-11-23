// Lokasi file: src/pages/admin/DataKK.jsx
// (REVISI FINAL: Menggunakan Custom Overlay agar PASTI RATA TENGAH)

import { useState, useEffect } from 'react'; // Hapus useRef karena tidak dipakai lagi
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import api from '../../services/api'; 

// --- STATE FORM AWAL ---
const initialFormState = {
  no_kk: '',
  nama_kepala_keluarga: '',
  nik_kepala_keluarga: '', 
  alamat: '',
  rt: '',
  rw: '',
  kelurahan: '',
  kecamatan: '',
  kabupaten: '',
  provinsi: '',
  kode_pos: '',
  tanggal_terbit: '', 
  jumlah_anggota: '',
  status_keluarga: '', 
};

export default function DataKK() {
  // === STATES ===
  const [kkList, setKkList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- MODAL KONTROL ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentKkId, setCurrentKkId] = useState(null); 
  const [formData, setFormData] = useState(initialFormState);

  // === DATA FETCHING ===
  const fetchDataKk = async () => {
     try {
      setLoading(true);
      setError(null);
      const response = await api.get('/kk');
      setKkList(response.data.data || []); 
    } catch (err) {
      setError("Gagal mengambil data KK. " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDataKk();
  }, []);

  // === HANDLERS ===
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const resetFormAndClose = () => {
    setFormData(initialFormState);
    setCurrentKkId(null);
    setError(null); 
    setIsModalOpen(false); // Tutup modal
  };

  const handleOpenModal = (kk = null) => {
    if (kk) {
      // MODE EDIT
      setFormData({
        no_kk: kk.no_kk || '',
        nama_kepala_keluarga: kk.nama_kepala_keluarga || '',
        nik_kepala_keluarga: kk.nik_kepala_keluarga || kk.nik_kepala || '',
        alamat: kk.alamat || '',
        rt: kk.rt || '',
        rw: kk.rw || '',
        kelurahan: kk.kelurahan || '',
        kecamatan: kk.kecamatan || '',
        kabupaten: kk.kabupaten || '',
        provinsi: kk.provinsi || '',
        kode_pos: kk.kode_pos || '',
        tanggal_terbit: kk.tanggal_terbit || '',
        jumlah_anggota: kk.jumlah_anggota || '',
        status_keluarga: kk.status_keluarga || '',
      });
      setCurrentKkId(kk.id_kk || kk.id);
    } else {
      // MODE TAMBAH
      setFormData(initialFormState);
      setCurrentKkId(null);
    }
    setIsModalOpen(true); // Buka modal
  };

  // === CRUD OPERATIONS ===
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); 
    
    try {
      if (currentKkId) {
        await api.put(`/kk/${currentKkId}`, formData);
      } else {
        await api.post('/kk', formData);
      }
      
      fetchDataKk();
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
    if (window.confirm("Apakah Anda yakin ingin menghapus data KK ini?")) {
      try {
        await api.delete(`/kk/${id}`);
        fetchDataKk(); 
      } catch (err) {
        setError("Gagal menghapus data. Pastikan semua anggota keluarga sudah dihapus dari KK ini. " + err.message);
      }
    }
  };
  
  if (loading) return <div className="text-center p-8"><span className="loading loading-spinner loading-lg"></span></div>;

  return (
    <div className="p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold">Manajemen Kartu Keluarga (KK)</h1>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <FaPlus size={14} /> Tambah KK
        </button>
      </div>

      {/* Error Global (bukan di dalam modal) */}
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
              <th className="p-3 text-left">Nomor KK</th>
              <th className="p-3 text-left">Nama Kepala</th>
              <th className="p-3 text-left">NIK Kepala</th>
              <th className="p-3 text-left">Alamat</th>
              <th className="p-3 text-left">RT/RW</th>
              <th className="p-3 text-left">Kel/Desa</th>
              <th className="p-3 text-left">Kecamatan</th>
              <th className="p-3 text-left">Jumlah Anggota</th>
              <th className="p-3 text-center">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {kkList.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center p-4 bg-white">
                    Belum ada data KK. Silakan tambah data baru.
                  </td>
                </tr>
            ) : (
                kkList.map((kk, index) => (
              <tr key={kk.id_kk || kk.id} className="border-b bg-white text-gray-700 hover:bg-gray-50">
                <td className="p-3 text-center">{index + 1}</td>
                <td className="p-3 text-left">{kk.no_kk}</td>
                <td className="p-3 text-left">{kk.nama_kepala_keluarga}</td>
                <td className="p-3 text-left">{kk.nik_kepala_keluarga || kk.nik_kepala || '-'}</td>
                <td className="p-3 text-left">{kk.alamat}</td>
                <td className="p-3 text-left">{kk.rt}/{kk.rw}</td>
                <td className="p-3 text-left">{kk.kelurahan}</td>
                <td className="p-3 text-left">{kk.kecamatan}</td>
                <td className="p-3 text-left">{kk.jumlah_anggota || '-'}</td>
                <td className="p-3 flex justify-center gap-2">
                  <button
                    onClick={() => handleOpenModal(kk)}
                    className="px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 text-sm flex items-center gap-1"
                  >
                    <FaEdit /> Edit
                  </button>

                  <button
                    onClick={() => handleDelete(kk.id_kk || kk.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm flex items-center gap-1"
                  >
                    <FaTrash /> Hapus
                  </button>
                </td>
              </tr>
            ))) }
          </tbody>
        </table>
      </div>

      {/* ----------------- MODAL MANUAL (PASTI TENGAH) ----------------- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          
          {/* Container Form */}
          <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto animate-fade-in-up">
            
            {/* Tombol Close di Pojok Kanan Atas */}
            <button 
              type="button" 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold"
              onClick={resetFormAndClose}
            >
              ✕
            </button>

            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-gray-800">
                {currentKkId ? 'Edit Data Kartu Keluarga' : 'Tambah Kartu Keluarga Baru'}
              </h2>
              <p className="text-gray-500 text-sm mt-1">Lengkapi data di bawah ini dengan benar.</p>
            </div>
            
            {error && (
              <div className="alert alert-error mb-4 text-sm p-3 rounded-lg">
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Grid Layout untuk Form yang Lebih Rapi */}
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

              {/* Tombol Aksi */}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={resetFormAndClose}
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
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

/* =================================================================== */
/* == KOMPONEN BAWAAN (HELPER) == */
/* =================================================================== */

function Input({ label, name, value, handle, type = "text", required = false, placeholder = '' }) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label} {required && <span className="text-red-500">*</span>}</label>
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

function TextArea({ label, name, value, handle, required = false }) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label} {required && <span className="text-red-500">*</span>}</label>
      <textarea
        name={name}
        value={value || ''}
        onChange={handle}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white"
        required={required}
        rows={3}
      />
    </div>
  );
}