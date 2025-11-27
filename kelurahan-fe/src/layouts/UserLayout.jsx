// Lokasi file: src/layouts/UserLayout.jsx
// Layout khusus Warga — versi rapi, bersih, dan konsisten dengan AdminLayout

import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

import {
  FaHome,
  FaUserCircle,
  FaFileAlt,
  FaHistory,
  FaSignOutAlt,
} from "react-icons/fa";

// ======================================================================
// NAV ITEM — Link Sidebar
// ======================================================================
const NavItem = ({ to, icon, children }) => (
  <li>
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `flex items-center gap-3 p-3 rounded-xl text-[15px] transition-all
         ${
           isActive
             ? "bg-white text-blue-700 font-semibold shadow-md"
             : "text-white/90 hover:bg-white/20"
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

  return (
    <div className="flex h-screen bg-base-200" data-theme="light">
      {/* =============================================================== */}
      {/* SIDEBAR */}
      {/* =============================================================== */}
      <aside className="w-72 h-full bg-blue-700 text-white shadow-xl flex flex-col p-6">

        {/* PROFILE WARGA */}
        <div className="flex flex-col items-center mb-8">
          <FaUserCircle size={70} className="drop-shadow-lg" />
          <h2 className="text-lg font-bold mt-2">{wargaName}</h2>
          <p className="text-xs opacity-80">{user?.email}</p>
        </div>

        <div className="border-b border-white/20 mb-6"></div>

        {/* MENU NAVIGASI */}
        <ul className="menu space-y-2 flex-1">
          <NavItem to="/" icon={<FaHome />}>Home</NavItem>

          <NavItem to="/profil" icon={<FaUserCircle />}>
            Profil Saya
          </NavItem>

          <NavItem to="/pengajuan" icon={<FaFileAlt />}>
            Buat Pengajuan
          </NavItem>

          <NavItem to="/status" icon={<FaHistory />}>
            Status Pengajuan
          </NavItem>
        </ul>

        {/* LOGOUT BUTTON (Fixed Bottom) */}
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

      {/* =============================================================== */}
      {/* KONTEN UTAMA */}
      {/* =============================================================== */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <header className="bg-white shadow-md p-5 sticky top-0 z-10">
          <h1 className="text-2xl font-bold text-gray-700">
            Portal Layanan Mandiri
          </h1>
        </header>

        <main className="flex-1 p-6 lg:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
