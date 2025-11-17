// Lokasi file: src/pages/user/FormPengajuan.jsx
// (Form Warga untuk F-P3)

import { useState, useEffect } from 'react';
import api from '../../services/api'; 
import { FaPaperPlane } from 'react-icons/fa';

export default function FormPengajuan() {
  // === STATES ===
  const [layananList, setLayananList] = useState([]); // Untuk dropdown
  const [idJenisLayanan, setIdJenisLayanan] = useState(''); // Pilihan dropdown
  const [keterangan, setKeterangan] = useState(''); // Isi textarea

  const [loading, setLoading] = useState(true); // Loading untuk dropdown
  const [submitLoading, setSubmitLoading] = useState(false); // Loading saat kirim
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // === 1. AMBIL DATA JENIS LAYANAN (untuk Dropdown) ===
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        // F-P3: Ambil daftar layanan yang DIBUAT ADMIN
        const response = await api.get('/jenis-layanan'); 
        setLayananList(response.data.data || []); 
      } catch (err) {
        setError("Gagal mengambil daftar layanan. " + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []); // Dijalankan sekali saat halaman dibuka

  // === 2. FUNGSI KIRIM PENGAJUAN (POST) ===
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitLoading(true);

    try {
      // F-P3: Kirim data pengajuan baru
      await api.post('/pengajuan-layanan', {
        id_jenis_layanan: idJenisLayanan,
        keterangan: keterangan,
      });
      
      // Jika sukses
      setSuccess('Pengajuan Anda berhasil terkirim! Silakan cek halaman "Status Pengajuan" untuk melihat progres.');
      // Kosongkan form
      setIdJenisLayanan('');
      setKeterangan('');

    } catch (err) {
      // Tangani error validasi
      if (err.response && err.response.data.errors) {
        const errors = err.response.data.errors;
        const firstErrorKey = Object.keys(errors)[0];
        const firstErrorMessage = errors[firstErrorKey][0];
        setError(firstErrorMessage);
      } else {
        setError("Gagal mengirim pengajuan. " + err.message);
      }
    } finally {
      setSubmitLoading(false);
    }
  };
  
  if (loading) return <div className="text-center p-8"><span className="loading loading-spinner loading-lg"></span></div>;

  return (
    <div className="p-0"> {/* Hapus padding 'p-6' agar card menempel */}
      <h1 className="text-3xl font-semibold mb-6">Buat Pengajuan Surat</h1>

      {/* Tampilkan error global (selain loading dropdown) */}
      {error && (
        <div className="alert alert-error shadow-lg mb-4">
          <div><span>{error}</span></div>
        </div>
      )}
      {/* Tampilkan pesan sukses */}
      {success && (
        <div className="alert alert-success shadow-lg mb-4">
          <div><span>{success}</span></div>
        </div>
      )}

      {/* --- FORM PENGAJUAN (Style Anda) --- */}
      <div className="bg-white p-6 shadow-md rounded-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* --- Dropdown Jenis Layanan --- */}
          <SelectLayanan 
            value={idJenisLayanan} 
            handle={(e) => setIdJenisLayanan(e.target.value)} 
            options={layananList}
            disabled={layananList.length === 0} // Disable jika admin belum isi
            required
          />

          {/* --- Textarea Keterangan --- */}
          <TextArea 
            label="Keterangan / Keperluan" 
            name="keterangan" 
            value={keterangan} 
            handle={(e) => setKeterangan(e.target.value)}
            placeholder="Contoh: Untuk keperluan mendaftar beasiswa..."
            required 
          />
          
          {/* --- Tombol Aksi --- */}
          <div className="flex justify-end mt-6">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              disabled={submitLoading}
            >
              {submitLoading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                <FaPaperPlane />
              )}
              Kirim Pengajuan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


/* =================================================================== */
/* == KOMPONEN BAWAAN (DARI FILE ANDA, UNTUK MENJAGA STYLE) == */
/* =================================================================== */

function SelectLayanan({ value, handle, options, disabled, required = false }) {
  return (
    <div>
      <label className="block font-medium mb-1">Jenis Layanan Surat</label>
      <select
        name="id_jenis_layanan"
        value={value || ''}
        onChange={handle}
        className="w-full p-2 border rounded-lg"
        required={required}
        disabled={disabled}
      >
        <option value="">
          {disabled ? "Admin belum mendaftarkan layanan" : "-- Pilih Jenis Surat --"}
        </option>
        {options.map(opt => (
          <option key={opt.id_jenis_layanan || opt.id} value={opt.id_jenis_layanan || opt.id}>
            {opt.nama_layanan}
          </option>
        ))}
      </select>
    </div>
  );
}

function TextArea({ label, name, value, handle, required = false, placeholder = "" }) {
  return (
    <div>
      <label className="block font-medium mb-1">{label}</label>
      <textarea
        name={name}
        value={value || ''}
        onChange={handle}
        className="w-full p-2 border rounded-lg focus:ring focus:ring-blue-300"
        required={required}
        placeholder={placeholder}
        rows={4}
      />
    </div>
  );
}