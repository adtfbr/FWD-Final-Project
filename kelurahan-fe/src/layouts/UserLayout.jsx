import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Logo from "../components/Logo";

import {
  FaHome,
  FaUserCircle,
  FaFileAlt,
  FaHistory,
  FaSignOutAlt,
  FaBars,
  FaTimes
} from "react-icons/fa";

const NavItem = ({ to, icon, children, onClick }) => (
  <li>
    <NavLink
      to={to}
      end
      onClick={onClick}
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

export default function UserLayout() {
  const { user, logout } = useAuth();
  const wargaName = user?.penduduk?.nama || user?.name || "Warga";
  const initial = (wargaName?.charAt(0) || "W").toUpperCase();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100 font-sans" data-theme="light">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40 w-72 bg-linear-to-b from-blue-700 to-blue-900 text-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="relative p-6 pb-4 flex justify-center items-center border-b border-blue-600/50 bg-blue-800/30">
           <Logo className="h-16 w-auto" variant="white-bg" />
           <button
             onClick={() => setIsSidebarOpen(false)}
             className="absolute right-4 top-1/2 -translate-y-1/2 lg:hidden text-white/80 hover:text-white p-2"
           >
             <FaTimes size={24} />
           </button>
        </div>

        <div className="p-6 flex flex-col items-center">
          <div className="avatar placeholder mb-3">
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

        <div className="px-4 pb-4 flex-1 overflow-y-auto scrollbar-hide">
          <p className="text-xs font-bold text-blue-300 uppercase tracking-wider mb-2 pl-3 mt-2">
            Menu Warga
          </p>
          <ul className="space-y-1">
            <NavItem to="/home" icon={<FaHome />} onClick={() => setIsSidebarOpen(false)}>Beranda</NavItem>
            <NavItem to="/profil" icon={<FaUserCircle />} onClick={() => setIsSidebarOpen(false)}>Profil Saya</NavItem>
          </ul>

          <p className="text-xs font-bold text-blue-300 uppercase tracking-wider mb-2 pl-3 mt-6">
            Layanan Surat
          </p>
          <ul className="space-y-1">
            <NavItem to="/pengajuan" icon={<FaFileAlt />} onClick={() => setIsSidebarOpen(false)}>Buat Pengajuan</NavItem>
            <NavItem to="/status" icon={<FaHistory />} onClick={() => setIsSidebarOpen(false)}>Riwayat Pengajuan</NavItem>
          </ul>
        </div>

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

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white shadow-sm px-6 py-4 z-10 flex justify-between items-center border-b border-gray-200">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden text-gray-600 hover:text-blue-600 focus:outline-none transition-colors"
            >
              <FaBars size={24} />
            </button>

            <h1 className="text-xl font-bold text-gray-800 truncate">
              Portal Layanan
            </h1>
          </div>

          <div className="text-sm text-gray-500 hidden sm:block">
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto bg-gray-50 scroll-smooth">
          <Outlet />
        </main>
      </div>
    </div>
  );
}