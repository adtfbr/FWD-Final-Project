// Lokasi file: src/layouts/UserLayout.jsx
// Layout khusus Warga — Konsisten dengan AdminLayout (Rapi & Modern)

import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Logo from "../components/Logo"; // Import Logo agar konsisten

import {
  FaHome,
  FaUserCircle,
  FaFileAlt,
  FaHistory,
  FaSignOutAlt,
} from "react-icons/fa";

// ======================================================================
// NAV ITEM — Link Sidebar (Gaya Sama dengan AdminLayout)
// ======================================================================
const NavItem = ({ to, icon, children }) => (
  <li>
    <NavLink
      to={to}
      end // Pastikan 'end' ada agar active state akurat
      className={({ isActive }) =>
        `flex items-center gap-3 p-3 rounded-xl text-[14px] font-medium transition-all
        ${
          isActive
            ? "bg-white text-blue-700 shadow-lg shadow-blue-900/20 translate-x-1"
            : "text-blue-100 hover:bg-blue-600 hover:text-white"
        }`
      }
    >
      {icon}
      {children}
    </NavLink>
  </li>
);

// ======================================================================
// USER LAYOUT
// ======================================================================
export default function UserLayout() {
  const { user, logout } = useAuth();

  // Ambil nama penduduk dari relasi user (hasil login)
  const wargaName = user?.penduduk?.nama || user?.name || "Warga";
  // Ambil inisial untuk avatar (Fallback 'W' jika nama kosong)
  const initial = (wargaName?.charAt(0) || "W").toUpperCase();

  return (
    <div className="flex h-screen bg-gray-100" data-theme="light">
      
      {/* =============================================================== */}
      {/* SIDEBAR (Warna & Struktur Mirip AdminLayout) */}
      {/* =============================================================== */}
      <aside className="w-72 h-full bg-linear-to-b from-blue-700 to-blue-900 text-white shadow-2xl flex flex-col z-20">

        {/* --- AREA LOGO (Header Sidebar) --- */}
        <div className="p-6 pb-2 flex justify-center border-b border-blue-600/50 bg-blue-800/30">
           {/* Gunakan variant white-bg agar logo terlihat jelas & konsisten */}
           <Logo className="h-20 w-auto" variant="white-bg" />
        </div>

        {/* --- PROFILE CARD (Avatar Simetris) --- */}
        <div className="p-6 flex flex-col items-center">
          <div className="avatar placeholder mb-3">
             {/* Avatar Bulat Sempurna & Teks di Tengah */}
             <div className="bg-blue-500 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-inner ring-2 ring-blue-300/50">
              <span className="text-3xl font-bold -translate-y-0.5">{initial}</span>
            </div>
          </div>
          <h2 className="text-base font-bold text-white text-center leading-tight px-2">
            {wargaName}
          </h2>
          <p className="text-xs text-blue-200 mt-1 bg-blue-600/50 px-3 py-0.5 rounded-full border border-blue-500/50">
            Warga Nagari
          </p>
        </div>

        {/* --- MENU NAVIGASI --- */}
        <div className="px-4 pb-4 flex-1 overflow-y-auto scrollbar-hide">
          <p className="text-xs font-bold text-blue-300 uppercase tracking-wider mb-2 pl-3 mt-2">
            Menu Warga
          </p>
          <ul className="space-y-1">
            {/* PASTIKAN PATH INI ABSOLUTE (diawali /) dan sesuai App.jsx */}
            <NavItem to="/" icon={<FaHome />}>Beranda</NavItem>
            <NavItem to="/profil" icon={<FaUserCircle />}>Profil Saya</NavItem>
          </ul>

          <p className="text-xs font-bold text-blue-300 uppercase tracking-wider mb-2 pl-3 mt-6">
            Layanan Surat
          </p>
          <ul className="space-y-1">
            <NavItem to="/pengajuan" icon={<FaFileAlt />}>Buat Pengajuan</NavItem>
            <NavItem to="/status" icon={<FaHistory />}>Riwayat Pengajuan</NavItem>
          </ul>
        </div>

        {/* --- LOGOUT BUTTON (Fixed Bottom) --- */}
        <div className="p-4 border-t border-blue-600/50 bg-blue-800/20">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-xl text-sm font-semibold text-red-100 bg-red-500/20 hover:bg-red-600 hover:text-white transition-all duration-200 border border-red-500/30 group"
          >
            <FaSignOutAlt className="group-hover:-translate-x-1 transition-transform" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* =============================================================== */}
      {/* KONTEN UTAMA */}
      {/* =============================================================== */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Header Putih Simpel */}
        <header className="bg-white shadow-sm px-8 py-4 z-10 flex justify-between items-center border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800">
            Portal Layanan Mandiri
          </h1>
          <div className="text-sm text-gray-500 hidden md:block">
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </header>

        {/* Area Konten Scrollable */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}