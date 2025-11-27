// Lokasi file: src/layouts/AdminLayout.jsx

import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import {
  FaTachometerAlt,
  FaUsers,
  FaIdCard,
  FaFileAlt,
  FaCheckCircle,
  FaSignOutAlt,
  FaUserCircle, // Ini bisa dihapus jika tidak dipakai di bagian bawah
  FaListAlt,
  FaChartBar,
  FaNewspaper
} from "react-icons/fa";
import Logo from "../components/Logo"; 

const NavItem = ({ to, icon, children }) => (
  <li>
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 p-3 rounded-xl text-[14px] font-medium transition-all
        ${isActive ? "bg-white text-blue-700 shadow-lg shadow-blue-900/20 translate-x-1" : "text-blue-100 hover:bg-blue-600 hover:text-white"}`
      }
    >
      {icon}
      {children}
    </NavLink>
  </li>
);

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const adminName = user?.name || "Petugas Admin";

  return (
    <div className="flex h-screen bg-gray-100" data-theme="light">
      
      {/* SIDEBAR */}
      <aside className="w-72 h-full bg-linear-to-b from-blue-800 to-blue-900 text-white shadow-2xl flex flex-col z-20">
        
        {/* --- AREA LOGO (Header Sidebar) --- */}
        <div className="p-6 pb-2 flex justify-center border-b border-blue-700/50 bg-blue-900/30">
           {/* Gunakan variant white-bg agar logo kotak terlihat rapi di background biru */}
           <Logo className="h-20 w-auto" variant="white-bg" />
        </div>

        {/* PROFILE CARD */}
        <div className="p-6 flex flex-col items-center">
          <div className="avatar placeholder mb-3">
            {/* PERBAIKAN DISINI: Tambahkan 'h-16 flex items-center justify-center' */}
            <div className="bg-blue-600 text-blue-100 rounded-full w-16 h-16 flex items-center justify-center shadow-inner ring-2 ring-blue-400/50">
              <span className="text-3xl font-bold -translate-y-0.5">{adminName.charAt(0)}</span>
            </div>
          </div>
          <h2 className="text-base font-bold text-white text-center leading-tight">{adminName}</h2>
          <p className="text-xs text-blue-300 mt-1 bg-blue-800/50 px-3 py-0.5 rounded-full border border-blue-700">Administrator</p>
        </div>

        {/* MENU */}
        <div className="px-4 pb-4 flex-1 overflow-y-auto scrollbar-hide">
          <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2 pl-3 mt-2">Menu Utama</p>
          <ul className="space-y-1">
            <NavItem to="/admin/dashboard" icon={<FaTachometerAlt />}>Dashboard</NavItem>
            <NavItem to="/admin/pengajuan-surat" icon={<FaFileAlt />}>Pengajuan Surat</NavItem>
            <NavItem to="/admin/verifikasi-warga" icon={<FaCheckCircle />}>Verifikasi Warga</NavItem>
          </ul>

          <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2 pl-3 mt-6">Data Master</p>
          <ul className="space-y-1">
            <NavItem to="/admin/penduduk" icon={<FaUsers />}>Data Penduduk</NavItem>
            <NavItem to="/admin/kk" icon={<FaIdCard />}>Data Kartu Keluarga</NavItem>
            <NavItem to="/admin/jenis-layanan" icon={<FaListAlt />}>Jenis Layanan</NavItem>
          </ul>

          <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2 pl-3 mt-6">Informasi & Laporan</p>
          <ul className="space-y-1">
            <NavItem to="/admin/berita" icon={<FaNewspaper />}>Berita Desa</NavItem>
            <NavItem to="/admin/laporan" icon={<FaChartBar />}>Laporan Statistik</NavItem>
          </ul>
        </div>

        {/* LOGOUT */}
        <div className="p-4 border-t border-blue-700/50 bg-blue-900/20">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-xl text-sm font-semibold text-red-100 bg-red-600/20 hover:bg-red-600 hover:text-white transition-all duration-200 border border-red-500/30"
          >
            <FaSignOutAlt />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* KONTEN UTAMA */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm px-8 py-4 z-10 flex justify-between items-center border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800">
            Sistem Informasi Nagari
          </h1>
          <div className="text-sm text-gray-500">
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8 overflow-y-auto bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}