// Lokasi file: src/pages/user/Home.jsx
// (REVISI FINAL: Button Alignment Fix + Modal Detail Berita)

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../services/api.js';
import { FaFileAlt, FaNewspaper, FaBullhorn, FaHistory, FaTimes } from 'react-icons/fa';

const STORAGE_URL = 'http://127.0.0.1:8000/storage/';

export default function Home() {
  const { user } = useAuth();
  const [beritaList, setBeritaList] = useState([]);
  const [loading, setLoading] = useState(true);

  // State Modal Detail Berita
  const [selectedBerita, setSelectedBerita] = useState(null);

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
        </div>
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
                <div 
                  key={berita.id_berita} 
                  className="card bg-white shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group flex flex-col h-full cursor-pointer"
                  onClick={() => setSelectedBerita(berita)} // Buka Modal saat diklik
                >
                  <figure className="h-100 bg-gray-100 relative overflow-hidden shrink-0">
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
                    <h3 className="card-title text-lg font-bold text-gray-800 leading-snug mb-2 group-hover:text-blue-600 transition-colors">
                      {berita.judul}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-3 mb-0">
                      {berita.isi}
                    </p>
                    <div className="mt-4 pt-4 border-t text-xs text-blue-500 font-semibold uppercase tracking-wider">
                      Baca Selengkapnya &rarr;
                    </div>
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

      {/* --- MODAL DETAIL BERITA --- */}
      {selectedBerita && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden animate-fade-in-up max-h-[90vh] flex flex-col">
            
            {/* Header Gambar */}
            <div className="relative h-100 bg-gray-200 shrink-0">
              {selectedBerita.gambar ? (
                <img 
                  src={`${STORAGE_URL}${selectedBerita.gambar}`} 
                  alt={selectedBerita.judul} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full text-gray-400">
                  <FaNewspaper size={60} />
                </div>
              )}
              <button 
                onClick={() => setSelectedBerita(null)}
                className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
              >
                <FaTimes size={20} />
              </button>
            </div>

            {/* Konten Berita (Scrollable) */}
            <div className="p-8 overflow-y-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-2 leading-tight">
                {selectedBerita.judul}
              </h2>
              <div className="text-sm text-gray-500 mb-6 flex items-center gap-2">
                <span>{new Date(selectedBerita.created_at).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                <span>•</span>
                <span>Oleh: Admin Kelurahan</span>
              </div>
              
              <div className="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
                {selectedBerita.isi}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-50 border-t flex justify-end">
              <button 
                onClick={() => setSelectedBerita(null)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-md transition-all"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}