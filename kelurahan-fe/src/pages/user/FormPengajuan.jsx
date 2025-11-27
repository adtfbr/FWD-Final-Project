/* eslint-disable no-unused-vars */
// Lokasi file: src/pages/user/FormPengajuan.jsx
import { useState, useEffect } from 'react';
import api from '../../services/api'; 
import { FaPaperPlane, FaFileUpload } from 'react-icons/fa';
// Import SweetAlert Helper
import { showSuccessToast, showErrorToast } from "../../utils/sweetalert";

export default function FormPengajuan() {
  const [layananList, setLayananList] = useState([]); 
  const [idJenisLayanan, setIdJenisLayanan] = useState(''); 
  const [keterangan, setKeterangan] = useState(''); 
  const [filePersyaratan, setFilePersyaratan] = useState(null);

  const [loading, setLoading] = useState(true); 
  const [submitLoading, setSubmitLoading] = useState(false); 

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.get('/jenis-layanan'); 
        setLayananList(response.data.data || []); 
      } catch (err) {
        showErrorToast("Gagal mengambil layanan.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleFileChange = (e) => {
    setFilePersyaratan(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    const formData = new FormData();
    formData.append('id_jenis_layanan', idJenisLayanan);
    formData.append('keterangan', keterangan);
    if (filePersyaratan) {
      formData.append('file_persyaratan', filePersyaratan);
    }

    try {
      await api.post('/pengajuan-layanan', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Ganti success state dengan SweetAlert
      showSuccessToast('Pengajuan berhasil dikirim!');
      
      // Reset Form
      setIdJenisLayanan('');
      setKeterangan('');
      setFilePersyaratan(null);
      document.getElementById('fileInput').value = "";

    } catch (err) {
      if (err.response?.data?.errors) {
        const msg = Object.values(err.response.data.errors)[0][0];
        showErrorToast(msg);
      } else {
        showErrorToast("Gagal mengirim pengajuan. " + err.message);
      }
    } finally {
      setSubmitLoading(false);
    }
  };
  
  if (loading) return <div className="text-center p-8"><span className="loading loading-spinner loading-lg"></span></div>;

  return (
    <div className="p-0">
      <h1 className="text-3xl font-semibold mb-6">Buat Pengajuan Surat</h1>

      <div className="bg-white p-6 shadow-md rounded-lg">
        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div>
            <label className="block font-medium mb-1">Jenis Layanan Surat</label>
            <select
              value={idJenisLayanan} 
              onChange={(e) => setIdJenisLayanan(e.target.value)} 
              className="w-full p-2 border rounded-lg bg-white"
              required
            >
              <option value="">-- Pilih Jenis Surat --</option>
              {layananList.map(opt => (
                <option key={opt.id_jenis_layanan} value={opt.id_jenis_layanan}>{opt.nama_layanan}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium mb-1">Upload Persyaratan (KTP/Pengantar)</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50 hover:bg-gray-100 transition">
                <input 
                    id="fileInput"
                    type="file" 
                    onChange={handleFileChange} 
                    className="hidden" 
                    accept=".pdf,.jpg,.jpeg,.png"
                    required
                />
                <label htmlFor="fileInput" className="cursor-pointer flex flex-col items-center justify-center">
                    <FaFileUpload className="text-3xl text-gray-400 mb-2" />
                    <span className="text-blue-600 font-medium">Klik untuk upload file</span>
                    <span className="text-xs text-gray-500 mt-1">Format: PDF, JPG, PNG (Max 2MB)</span>
                    {filePersyaratan && (
                        <div className="mt-3 badge badge-primary p-3">
                            {filePersyaratan.name}
                        </div>
                    )}
                </label>
            </div>
          </div>

          <div>
            <label className="block font-medium mb-1">Keterangan / Keperluan</label>
            <textarea
              value={keterangan} 
              onChange={(e) => setKeterangan(e.target.value)}
              className="w-full p-2 border rounded-lg focus:ring focus:ring-blue-300"
              required 
              rows={4}
              placeholder="Contoh: Untuk keperluan mendaftar beasiswa..."
            />
          </div>
          
          <div className="flex justify-end mt-6">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-md"
              disabled={submitLoading}
            >
              {submitLoading ? <span className="loading loading-spinner loading-sm"></span> : <><FaPaperPlane /> Kirim Pengajuan</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}