// Lokasi file: src/pages/admin/DataKK.jsx
// (PEROMBAKAN BESAR - Menyesuaikan form dengan validasi backend)

import { useState, useEffect, useRef } from 'react';
import { FaEdit, FaTrash, FaPlus, FaIdCard } from 'react-icons/fa';
import api from '../../services/api'; 

// --- STATE FORM AWAL (SESUAI VALIDASI BACKEND) ---
const initialFormState = {
  no_kk: '',
  nama_kepala_keluarga: '',
  nik_kepala_keluarga: '', // NIK Kepala Keluarga
  alamat: '',
  rt: '',
  rw: '',
  kelurahan: '',
  kecamatan: '',
  kabupaten: '',
  provinsi: '',
  kode_pos: '',
  tanggal_terbit: '', // format YYYY-MM-DD
  jumlah_anggota: '',
  status_keluarga: '', // contoh: 'Kepala Keluarga', 'Anggota'
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

  const modalRef = useRef(null); // Ref untuk bug fokus

  // === DATA FETCHING (READ) ===
  const fetchDataKk = async () => {
     try {
      setLoading(true);
      setError(null);
      const response = await api.get('/kk'); // API: GET /api/kk
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

  // === KONTROL MODAL (Anti-bug kehilangan fokus) ===
  useEffect(() => {
    if (isModalOpen) {
      modalRef.current?.showModal();
    } else {
      modalRef.current?.close();
    }
  }, [isModalOpen]);

  // === FORM & MODAL HANDLERS ===
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const resetFormAndClose = () => {
    setIsModalOpen(false);
    setTimeout(() => { 
      setFormData(initialFormState);
      setCurrentKkId(null);
      setError(null); 
    }, 200);
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
    setIsModalOpen(true); 
  };

  // === CRUD OPERATIONS (CREATE, UPDATE, DELETE) ===
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); 
    
    try {
      if (currentKkId) {
        await api.put(`/kk/${currentKkId}`, formData); // API: PUT /api/kk/{id}
      } else {
        await api.post('/kk', formData); // API: POST /api/kk
      }
      
      fetchDataKk(); // Ambil ulang data KK
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
    if (window.confirm("Apakah Anda yakin ingin menghapus data KK ini?")) {
      try {
        await api.delete(`/kk/${id}`); // API: DELETE /api/kk/{id}
        fetchDataKk(); 
      } catch (err) {
        setError("Gagal menghapus data. Pastikan semua anggota keluarga sudah dihapus dari KK ini. " + err.message);
      }
    }
  };
  
  // === RENDER LOADING & ERROR ===
  if (loading) return <div className="text-center p-8"><span className="loading loading-spinner loading-lg"></span></div>;

  return (
    <div className="p-6">

      {/* HEADER (Style Anda) */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold">Manajemen Kartu Keluarga (KK)</h1>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <FaPlus size={14} /> Tambah KK
        </button>
      </div>

      {error && !isModalOpen && (
        <div className="alert alert-error shadow-lg mb-4">
          <div><span>{error}</span></div>
        </div>
      )}

      {/* TABLE LIST (Style Anda - Diperbarui) */}
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
              <th className="p-3 text-left">Kabupaten</th>
              <th className="p-3 text-left">Provinsi</th>
              <th className="p-3 text-left">Jumlah Anggota</th>
              <th className="p-3 text-left">Tanggal Terbit</th>
              <th className="p-3 text-center">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {kkList.length === 0 ? (
                <tr>
                  <td colSpan="13" className="text-center p-4 bg-white">
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
                <td className="p-3 text-left">{kk.kabupaten}</td>
                <td className="p-3 text-left">{kk.provinsi}</td>
                <td className="p-3 text-left">{kk.jumlah_anggota || '-'}</td>
                <td className="p-3 text-left">{kk.tanggal_terbit || '-'}</td>
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

      {/* ----------------- MODAL KITA (FORM SUDAH DIUPDATE) ----------------- */}
      <dialog 
        ref={modalRef} 
        id="crud_modal" 
        className="modal"
        onClose={resetFormAndClose}
      >
        <div className="modal-box w-11/12 max-w-4xl bg-white p-6 rounded-xl shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-center">
              {currentKkId ? 'Edit Data KK' : 'Tambah Data KK Baru'}
            </h2>
            <button type="button" className="btn btn-sm btn-circle btn-ghost" onClick={resetFormAndClose}>✕</button>
          </div>
          
          {error && isModalOpen && (
            <div className="alert alert-warning text-sm p-3 mb-4">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* --- INPUT BARU SESUAI VALIDASI BACKEND --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Nomor KK (16 Digit)" name="no_kk" value={formData.no_kk} handle={handleInputChange} type="number" required />
              <Input label="Nama Kepala Keluarga" name="nama_kepala_keluarga" value={formData.nama_kepala_keluarga} handle={handleInputChange} required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="NIK Kepala Keluarga" name="nik_kepala_keluarga" value={formData.nik_kepala_keluarga} handle={handleInputChange} type="number" required />
              <Input label="Tanggal Terbit (YYYY-MM-DD)" name="tanggal_terbit" value={formData.tanggal_terbit} handle={handleInputChange} type="date" />
            </div>

            <TextArea label="Alamat" name="alamat" value={formData.alamat} handle={handleInputChange} required />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Kelurahan / Desa" name="kelurahan" value={formData.kelurahan} handle={handleInputChange} required />
              <Input label="Kecamatan" name="kecamatan" value={formData.kecamatan} handle={handleInputChange} required />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input label="Kabupaten" name="kabupaten" value={formData.kabupaten} handle={handleInputChange} />
              <Input label="Provinsi" name="provinsi" value={formData.provinsi} handle={handleInputChange} />
              <Input label="Kode Pos" name="kode_pos" value={formData.kode_pos} handle={handleInputChange} type="number" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="RT" name="rt" value={formData.rt} handle={handleInputChange} type="number" required />
              <Input label="RW" name="rw" value={formData.rw} handle={handleInputChange} type="number" required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Jumlah Anggota" name="jumlah_anggota" value={formData.jumlah_anggota} handle={handleInputChange} type="number" />
              <Input label="Status Keluarga" name="status_keluarga" value={formData.status_keluarga} handle={handleInputChange} placeholder="Contoh: Kepala Keluarga" />
            </div>
            {/* --- SELESAI INPUT BARU --- */}

            <FormButtons close={resetFormAndClose} />
          </form>
        </div>
      </dialog>

    </div>
  );
}

/* =================================================================== */
/* == KOMPONEN BAWAAN (DARI FILE ANDA, UNTUK MENJAGA STYLE) == */
/* =================================================================== */

function Input({ label, name, value, handle, type = "text", required = false, placeholder = '' }) {
  return (
    <div>
      <label className="block font-medium mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value || ''}
        onChange={handle}
        placeholder={placeholder}
        className="w-full p-2 border rounded-lg focus:ring focus:ring-blue-300"
        required={required}
      />
    </div>
  );
}

function TextArea({ label, name, value, handle, required = false }) {
  return (
    <div>
      <label className="block font-medium mb-1">{label}</label>
      <textarea
        name={name}
        value={value || ''}
        onChange={handle}
        className="w-full p-2 border rounded-lg focus:ring focus:ring-blue-300"
        required={required}
        rows={3}
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