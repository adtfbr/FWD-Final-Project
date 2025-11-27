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
  FaUserCircle,
  FaListAlt,
  FaChartBar,
  FaNewspaper
} from "react-icons/fa";

const NavItem = ({ to, icon, children }) => (
  <li>
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 p-3 rounded-xl text-[15px] transition-all
        ${isActive ? "bg-white text-blue-700 font-semibold shadow-md" : "text-white/90 hover:bg-white/20"}`
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
    <div className="flex h-screen bg-base-200" data-theme="light">
      <aside className="w-72 h-full bg-blue-700 text-white shadow-xl flex flex-col p-6">
        <div className="flex flex-col items-center mb-8">
          <FaUserCircle size={70} className="drop-shadow-lg" />
          <h2 className="text-lg font-bold mt-2">{adminName}</h2>
          <p className="text-xs opacity-80">{user?.email}</p>
        </div>

        <div className="border-b border-white/20 mb-6"></div>

        <ul className="menu space-y-2 flex-1">
          <NavItem to="/admin/dashboard" icon={<FaTachometerAlt />}>Dashboard</NavItem>
          <NavItem to="/admin/penduduk" icon={<FaUsers />}>Data Penduduk</NavItem>
          <NavItem to="/admin/kk" icon={<FaIdCard />}>Data KK</NavItem>
          <NavItem to="/admin/pengajuan-surat" icon={<FaFileAlt />}>Pengajuan Surat</NavItem>
          <NavItem to="/admin/jenis-layanan" icon={<FaListAlt />}>Jenis Layanan</NavItem>
          <NavItem to="/admin/verifikasi-warga" icon={<FaCheckCircle />}>Verifikasi Warga</NavItem>
          <NavItem to="/admin/berita" icon={<FaNewspaper />}>Berita Desa</NavItem>
          <NavItem to="/admin/laporan" icon={<FaChartBar />}>Laporan</NavItem>
        </ul>

        <div className="pt-6 mt-auto border-t border-white/20">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 p-3 rounded-xl text-[15px] text-white/90 hover:bg-red-500/90 hover:text-white hover:shadow-md transition-all duration-200 group"
          >
            {/* Icon akan sedikit bergoyang saat hover */}
            <FaSignOutAlt className="group-hover:-translate-x-1 transition-transform" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-y-auto">
        <header className="bg-white shadow-md p-5 sticky top-0 z-10">
          <h1 className="text-2xl font-bold text-gray-700">
            Selamat Datang, {adminName}!
          </h1>
        </header>

        <main className="flex-1 p-6 lg:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
