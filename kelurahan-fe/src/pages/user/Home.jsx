// Lokasi file: src/pages/user/Home.jsx
// (REVISI FINAL: Button Alignment Fix)

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../services/api.js';
import { FaFileAlt, FaNewspaper, FaBullhorn, FaHistory } from 'react-icons/fa';

const STORAGE_URL = 'http://127.0.0.1:8000/storage/';

export default function Home() {
  const { user } = useAuth();
  const [beritaList, setBeritaList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.get('/berita');
        setBeritaList(response.data.data || []);
      } catch (err) {
        console.error("Gagal load data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-linear-to-r from-blue-600 to-blue-800 p-10 rounded-2xl shadow-xl text-white flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-4xl font-bold">Halo, {user?.penduduk?.nama || user?.name}!</h1>
          <p className="text-blue-100 mt-2 text-lg max-w-xl leading-relaxed">
            Selamat datang di Portal Layanan Digital Kelurahan. Urus surat menyurat kini lebih mudah, cepat, dan transparan dari rumah.
          </p>
          
          {/* --- REVISI BAGIAN TOMBOL --- */}
          <div className="mt-8 flex flex-wrap gap-4">
            <Link 
              to="/pengajuan" 
              className="btn bg-white text-blue-700 hover:bg-gray-100 border-none shadow-lg font-bold px-6 h-12 flex items-center gap-2 rounded-lg"
            >
              <FaFileAlt /> Buat Pengajuan
            </Link>
            
            <Link 
              to="/status" 
              className="btn btn-outline text-white border-white hover:bg-white hover:text-blue-700 px-6 h-12 flex items-center gap-2 rounded-lg"
            >
              <FaHistory /> Cek Status
            </Link>
          </div>
          {/* --------------------------- */}

        </div>
        
        {/* Ilustrasi Background */}
        <div className="hidden md:block opacity-10 absolute -right-5 -bottom-10 transform rotate-12">
          <FaBullhorn size={250} />
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Kolom Kiri: Berita & Pengumuman */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <FaNewspaper className="text-blue-600" /> Berita & Pengumuman
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-10"><span className="loading loading-spinner loading-lg text-blue-500"></span></div>
          ) : beritaList.length === 0 ? (
            <div className="alert bg-blue-50 text-blue-900 border-blue-100 flex items-center gap-3">
              <FaBullhorn className="text-xl" />
              <span>Belum ada pengumuman terbaru dari kelurahan.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {beritaList.map((berita) => (
                <div key={berita.id_berita} className="card bg-white shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group flex flex-col h-full">
                  <figure className="h-48 bg-gray-100 relative overflow-hidden shrink-0">
                    {berita.gambar ? (
                      <img 
                        src={`${STORAGE_URL}${berita.gambar}`} 
                        alt={berita.judul} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-gray-300">
                        <FaNewspaper size={50} />
                      </div>
                    )}
                  </figure>
                  <div className="card-body p-5 flex flex-col grow">
                    <div className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">
                      {new Date(berita.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                    <h3 className="card-title text-lg font-bold text-gray-800 leading-snug mb-2">
                      {berita.judul}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-3 mb-0">
                      {berita.isi}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Kolom Kanan: Quick Access & Info */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <h3 className="font-bold text-gray-700 mb-4 border-b pb-2">Jam Operasional</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex justify-between"><span>Senin - Kamis</span> <span className="font-semibold text-gray-900">08:00 - 15:00</span></li>
              <li className="flex justify-between"><span>Jumat</span> <span className="font-semibold text-gray-900">08:00 - 11:00</span></li>
              <li className="flex justify-between text-red-500 font-medium"><span>Sabtu - Minggu</span> <span>Tutup</span></li>
            </ul>
          </div>

          <div className="bg-linear-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
            <h3 className="font-bold text-blue-800 mb-2">Butuh Bantuan?</h3>
            <p className="text-sm text-blue-700 mb-4 leading-relaxed">
              Jika mengalami kendala dalam pengajuan atau aplikasi, silakan hubungi petugas kami.
            </p>
            <button className="btn bg-green-500 hover:bg-green-600 text-white border-none w-full shadow-sm font-bold">
              Chat WhatsApp Petugas
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}