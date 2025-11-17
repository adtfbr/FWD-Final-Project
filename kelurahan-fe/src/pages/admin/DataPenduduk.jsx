// Lokasi file: src/pages/admin/DataPenduduk.jsx
// (PEROMBAKAN BESAR - Menyesuaikan form dengan validasi backend)

import { useState, useEffect, useRef } from "react";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import api from "../../services/api";

// --- STATE FORM AWAL (SESUAI VALIDASI BACKEND) ---
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // === MODAL ===
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPendudukId, setCurrentPendudukId] = useState(null);
  const [formData, setFormData] = useState(initialFormState);

  const modalRef = useRef(null);

  // === FETCH DATA (READ) ===
  const fetchDataPenduduk = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get("/penduduk");
      setPendudukList(response.data.data || []);
    } catch (err) {
      setError("Gagal mengambil data dari server. " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDataPenduduk();
  }, []);

  // === MODAL KONTROL (ANTI BUG) ===
  useEffect(() => {
    if (isModalOpen) modalRef.current?.showModal();
    else modalRef.current?.close();
  }, [isModalOpen]);

  // === HANDLING FORM ===
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetFormAndClose = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setFormData(initialFormState);
      setCurrentPendudukId(null);
      setError(null);
    }, 200);
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

  // === SUBMIT (CREATE / UPDATE) ===
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      if (currentPendudukId) {
        await api.put(`/penduduk/${currentPendudukId}`, formData);
      } else {
        await api.post("/penduduk", formData);
      }

      fetchDataPenduduk();
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
        fetchDataPenduduk();
      } catch (err) {
        setError("Gagal menghapus data. " + err.message);
      }
    }
  };

  // === LOADING ===
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

      {error && !isModalOpen && (
        <div className="alert alert-error shadow-lg mb-4">
          <div>
            <span>{error}</span>
          </div>
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
              <th className="p-3 text-left">Alamat</th>
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
                  <td className="p-3 text-left">{penduduk.alamat}</td>
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

      {/* ==================== MODAL ==================== */}
      <dialog
        ref={modalRef}
        id="crud_modal"
        className="modal"
        onClose={resetFormAndClose}
      >
        <div className="modal-box w-11/12 max-w-2xl bg-white p-6 rounded-xl shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-center">
              {currentPendudukId
                ? "Edit Data Penduduk"
                : "Tambah Data Penduduk Baru"}
            </h2>

            <button
              type="button"
              className="btn btn-sm btn-circle btn-ghost"
              onClick={resetFormAndClose}
            >
              ✕
            </button>
          </div>

          {error && isModalOpen && (
            <div className="alert alert-warning text-sm p-3 mb-4">
              <span>{error}</span>
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nama Lengkap"
              name="nama"
              value={formData.nama}
              handle={handleInputChange}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="NIK"
                name="nik"
                value={formData.nik}
                handle={handleInputChange}
                type="number"
                required
              />
              <Input
                label="ID KK"
                name="id_kk"
                value={formData.id_kk}
                handle={handleInputChange}
                type="number"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Tanggal Lahir"
                name="tanggal_lahir"
                value={formData.tanggal_lahir}
                handle={handleInputChange}
                type="date"
                required
              />

              <SelectGender
                value={formData.jenis_kelamin}
                handle={handleInputChange}
                required
              />
            </div>

            <TextArea
              label="Alamat"
              name="alamat"
              value={formData.alamat}
              handle={handleInputChange}
              required
            />

            <hr className="my-2" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Email (Opsional)"
                name="email"
                value={formData.email}
                handle={handleInputChange}
                type="email"
              />
              <Input
                label="Telepon (Opsional)"
                name="telepon"
                value={formData.telepon}
                handle={handleInputChange}
                type="tel"
              />
            </div>

            <FormButtons close={resetFormAndClose} />
          </form>
        </div>
      </dialog>
    </div>
  );
}

/* ============================================================= */
/* ======================= KOMPONEN ============================ */
/* ============================================================= */

function Input({ label, name, value, handle, type = "text", required = false }) {
  return (
    <div>
      <label className="block font-medium mb-1">{label}</label>

      <input
        type={type}
        name={name}
        value={value || ""}
        onChange={handle}
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
        value={value || ""}
        onChange={handle}
        rows={3}
        className="w-full p-2 border rounded-lg focus:ring focus:ring-blue-300"
        required={required}
      />
    </div>
  );
}

function SelectGender({ value, handle, required = false }) {
  return (
    <div>
      <label className="block font-medium mb-1">Jenis Kelamin</label>

      <select
        name="jenis_kelamin"
        value={value || ""}
        onChange={handle}
        className="w-full p-2 border rounded-lg"
        required={required}
      >
        <option value="">Pilih Jenis Kelamin</option>
        <option value="L">Laki-laki</option>
        <option value="P">Perempuan</option>
      </select>
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
