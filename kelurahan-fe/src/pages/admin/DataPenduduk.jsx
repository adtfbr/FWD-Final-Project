// Lokasi file: src/pages/admin/DataPenduduk.jsx
// (REVISI FINAL: Dropdown KK Otomatis + Modal Rata Tengah)

import { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import api from "../../services/api";

// --- STATE FORM AWAL ---
const initialFormState = {
  id_kk: "", // Ini nanti diisi lewat Dropdown
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
  const [kkList, setKkList] = useState([]); // State untuk menyimpan opsi KK
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // === MODAL KONTROL ===
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPendudukId, setCurrentPendudukId] = useState(null);
  const [formData, setFormData] = useState(initialFormState);

  // === FETCH DATA UTAMA (PENDUDUK & KK) ===
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Kita ambil data Penduduk DAN data KK sekaligus menggunakan Promise.all
      const [pendudukRes, kkRes] = await Promise.all([
        api.get("/penduduk"),
        api.get("/kk")
      ]);

      setPendudukList(pendudukRes.data.data || []);
      setKkList(kkRes.data.data || []); // Simpan data KK ke state

    } catch (err) {
      setError("Gagal mengambil data. " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Jalankan saat pertama kali load
  useEffect(() => {
    fetchData();
  }, []);

  // === HANDLERS ===
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetFormAndClose = () => {
    setFormData(initialFormState);
    setCurrentPendudukId(null);
    setError(null);
    setIsModalOpen(false);
  };

  const handleOpenModal = (penduduk = null) => {
    if (penduduk) {
      // MODE EDIT
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
      // MODE TAMBAH
      setFormData(initialFormState);
      setCurrentPendudukId(null);
    }
    setIsModalOpen(true);
  };

  // === SUBMIT ===
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      if (currentPendudukId) {
        await api.put(`/penduduk/${currentPendudukId}`, formData);
      } else {
        await api.post("/penduduk", formData);
      }

      fetchData(); // Refresh data setelah simpan
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

  // === DELETE ===
  const handleDelete = async (id) => {
    setError(null);
    if (window.confirm("Apakah Anda yakin ingin menghapus data ini?")) {
      try {
        await api.delete(`/penduduk/${id}`);
        fetchData();
      } catch (err) {
        setError("Gagal menghapus data. " + err.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="text-center p-8">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold">Manajemen Data Penduduk</h1>

        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <FaPlus size={14} /> Tambah Penduduk
        </button>
      </div>

      {/* Error Global */}
      {error && !isModalOpen && (
        <div className="alert alert-error shadow-lg mb-4">
          <div><span>{error}</span></div>
        </div>
      )}

      {/* TABLE */}
      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="w-full border-collapse overflow-hidden rounded-lg">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="p-3 text-center">No</th>
              <th className="p-3 text-left">Nama</th>
              <th className="p-3 text-left">NIK</th>
              <th className="p-3 text-left">No. KK</th> {/* Diganti dari Alamat agar lebih relevan */}
              <th className="p-3 text-center">L/P</th>
              <th className="p-3 text-center">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {pendudukList.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center p-4 bg-white">
                  Belum ada data penduduk. Silakan tambah data baru.
                </td>
              </tr>
            ) : (
              pendudukList.map((penduduk, index) => (
                <tr
                  key={penduduk.id_penduduk || penduduk.id}
                  className="border-b bg-white text-gray-700 hover:bg-gray-50"
                >
                  <td className="p-3 text-center">{index + 1}</td>
                  <td className="p-3 text-left">{penduduk.nama}</td>
                  <td className="p-3 text-left">{penduduk.nik}</td>
                  {/* Tampilkan Nomor KK dari relasi, bukan ID */}
                  <td className="p-3 text-left">
                    {penduduk.kk ? penduduk.kk.no_kk : '-'}
                  </td>
                  <td className="p-3 text-center">
                    {penduduk.jenis_kelamin}
                  </td>

                  <td className="p-3 flex justify-center gap-2">
                    <button
                      onClick={() => handleOpenModal(penduduk)}
                      className="px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 text-sm flex items-center gap-1"
                    >
                      <FaEdit /> Edit
                    </button>

                    <button
                      onClick={() =>
                        handleDelete(penduduk.id_penduduk || penduduk.id)
                      }
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

      {/* ==================== MODAL MANUAL (PASTI TENGAH) ==================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto animate-fade-in-up">
            
            <button 
              type="button" 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold"
              onClick={resetFormAndClose}
            >
              ✕
            </button>

            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-gray-800">
                {currentPendudukId ? "Edit Data Penduduk" : "Tambah Data Penduduk Baru"}
              </h2>
              <p className="text-gray-500 text-sm mt-1">Pastikan data sesuai KTP/KK.</p>
            </div>

            {error && (
              <div className="alert alert-error mb-4 text-sm p-3 rounded-lg">
                <span>{error}</span>
              </div>
            )}

            {/* FORM */}
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* --- REVISI BAGIAN INI: DROPDOWN KK --- */}
              <SelectKK
                kkList={kkList} // Kirim data KK ke komponen Select
                value={formData.id_kk}
                handle={handleInputChange}
                required
              />
              {/* ------------------------------------ */}

              <Input
                label="Nama Lengkap"
                name="nama"
                value={formData.nama}
                handle={handleInputChange}
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input
                  label="NIK (16 Digit)"
                  name="nik"
                  value={formData.nik}
                  handle={handleInputChange}
                  type="number"
                  required
                />
                
                <SelectGender
                  value={formData.jenis_kelamin}
                  handle={handleInputChange}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input
                  label="Tanggal Lahir"
                  name="tanggal_lahir"
                  value={formData.tanggal_lahir}
                  handle={handleInputChange}
                  type="date"
                  required
                />
                <Input
                  label="Telepon (Opsional)"
                  name="telepon"
                  value={formData.telepon}
                  handle={handleInputChange}
                  type="tel"
                />
              </div>

              <TextArea
                label="Alamat Domisili"
                name="alamat"
                value={formData.alamat}
                handle={handleInputChange}
                required
              />

              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                <p className="text-xs text-blue-800 font-semibold mb-2">Akun Login (Opsional)</p>
                <Input
                  label="Email (Untuk login warga)"
                  name="email"
                  value={formData.email}
                  handle={handleInputChange}
                  type="email"
                  placeholder="Kosongkan jika tidak perlu"
                />
              </div>

              <FormButtons close={resetFormAndClose} />
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================= */
/* ======================= KOMPONEN ============================ */
/* ============================================================= */

// --- KOMPONEN BARU: SelectKK ---
// Menampilkan No KK + Nama Kepala Keluarga agar mudah dipilih
function SelectKK({ kkList, value, handle, required = false }) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        Pilih Kartu Keluarga (KK) {required && <span className="text-red-500">*</span>}
      </label>
      <select
        name="id_kk"
        value={value || ""}
        onChange={handle}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
        required={required}
      >
        <option value="">-- Pilih Nomor KK --</option>
        {kkList.length > 0 ? (
          kkList.map((kk) => (
            <option key={kk.id_kk} value={kk.id_kk}>
              {kk.no_kk} - {kk.nama_kepala_keluarga}
            </option>
          ))
        ) : (
          <option disabled>Data KK Kosong (Input KK dulu)</option>
        )}
      </select>
    </div>
  );
}

function Input({ label, name, value, handle, type = "text", required = false, placeholder = "" }) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value || ""}
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
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        name={name}
        value={value || ""}
        onChange={handle}
        rows={2}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white"
        required={required}
      />
    </div>
  );
}

function SelectGender({ value, handle, required = false }) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        Jenis Kelamin {required && <span className="text-red-500">*</span>}
      </label>
      <select
        name="jenis_kelamin"
        value={value || ""}
        onChange={handle}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
        required={required}
      >
        <option value="">-- Pilih --</option>
        <option value="L">Laki-laki</option>
        <option value="P">Perempuan</option>
      </select>
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