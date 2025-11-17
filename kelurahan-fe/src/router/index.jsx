// Lokasi file: src/router/index.jsx
// (Router FINAL - Menambahkan rute Detail Pengajuan)

import { Routes, Route, Navigate } from "react-router-dom";

// Route Guards (Satpam)
import AdminRoute from "../components/AdminRoute";
import WargaRoute from "../components/WargaRoute";

// --- Halaman Admin ---
import AdminLogin from "../pages/admin/AdminLogin";
import Dashboard from "../pages/admin/Dashboard";
import DataPenduduk from "../pages/admin/DataPenduduk";
import DataKK from "../pages/admin/DataKK";
import PengajuanSurat from "../pages/admin/PengajuanSurat";
import DetailPengajuan from "../pages/admin/DetailPengajuan"; // <-- 1. IMPORT BARU
import VerifikasiWarga from "../pages/admin/VerifikasiWarga";
import JenisLayanan from "../pages/admin/JenisLayanan";
import Laporan from "../pages/admin/Laporan";

// --- Halaman Warga ---
import WargaLogin from "../pages/user/WargaLogin";
import Register from "../pages/user/Register";
import Home from "../pages/user/Home";
import Profil from "../pages/user/Profil";
import FormPengajuan from "../pages/user/FormPengajuan";
import StatusPengajuan from "../pages/user/StatusPengajuan";

export default function Router() {
  return (
    <Routes>

      {/* ================================== */}
      {/* RUTE PUBLIK (Siapapun bisa akses)  */}
      {/* ================================== */}
      <Route path="/login" element={<WargaLogin />} />
      <Route path="/register" element={<Register />} />
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* ================================== */}
      {/* RUTE WARGA (Dijaga oleh WargaRoute) */}
      {/* ================================== */}
      <Route element={<WargaRoute />}>
        <Route path="/" element={<Home />} />
        <Route path="/pengajuan" element={<FormPengajuan />} />
        <Route path="/status" element={<StatusPengajuan />} />
        <Route path="/profil" element={<Profil />} />
      </Route>

      {/* ================================== */}
      {/* RUTE ADMIN (Dijaga oleh AdminRoute) */}
      {/* ================================== */}
      <Route path="/admin" element={<AdminRoute />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="penduduk" element={<DataPenduduk />} />
        <Route path="kk" element={<DataKK />} />
        <Route path="pengajuan-surat" element={<PengajuanSurat />} />
        
        {/* 2. TAMBAHKAN RUTE DINAMIS INI */}
        <Route path="pengajuan/:id" element={<DetailPengajuan />} />

        <Route path="verifikasi-warga" element={<VerifikasiWarga />} />
        <Route path="jenis-layanan" element={<JenisLayanan />} />
        <Route path="laporan" element={<Laporan />} />

        {/* Redirect /admin → /admin/dashboard */}
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* ================================== */}
      {/* Fallback Route (404 otomatis redirect) */}
      {/* ================================== */}
      <Route path="*" element={<Navigate to="/login" replace />} />

    </Routes>
  );
}