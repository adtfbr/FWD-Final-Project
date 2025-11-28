import { Routes, Route, Navigate } from "react-router-dom";
import AdminRoute from "../components/AdminRoute";
import WargaRoute from "../components/WargaRoute";
import AdminLogin from "../pages/admin/AdminLogin";
import Dashboard from "../pages/admin/Dashboard";
import DataPenduduk from "../pages/admin/DataPenduduk";
import DataKK from "../pages/admin/DataKK";
import PengajuanSurat from "../pages/admin/PengajuanSurat";
import DetailPengajuan from "../pages/admin/DetailPengajuan";
import VerifikasiWarga from "../pages/admin/VerifikasiWarga";
import JenisLayanan from "../pages/admin/JenisLayanan";
import Laporan from "../pages/admin/Laporan";
import ManajemenBerita from "../pages/admin/ManajemenBerita";
import WargaLogin from "../pages/user/WargaLogin";
import Register from "../pages/user/Register";
import Home from "../pages/user/Home";
import Profil from "../pages/user/Profil";
import FormPengajuan from "../pages/user/FormPengajuan";
import StatusPengajuan from "../pages/user/StatusPengajuan";

export default function Router() {
  return (
    <Routes>
      <Route path="/login" element={<WargaLogin />} />
      <Route path="/register" element={<Register />} />
      <Route path="/admin/login" element={<AdminLogin />} />

      <Route element={<WargaRoute />}>
        <Route path="/home" element={<Home />} />
        <Route path="/pengajuan" element={<FormPengajuan />} />
        <Route path="/status" element={<StatusPengajuan />} />
        <Route path="/profil" element={<Profil />} />
      </Route>

      <Route path="/admin" element={<AdminRoute />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="penduduk" element={<DataPenduduk />} />
        <Route path="kk" element={<DataKK />} />
        <Route path="pengajuan-surat" element={<PengajuanSurat />} />
        <Route path="pengajuan/:id" element={<DetailPengajuan />} />
        <Route path="verifikasi-warga" element={<VerifikasiWarga />} />
        <Route path="jenis-layanan" element={<JenisLayanan />} />
        <Route path="berita" element={<ManajemenBerita />} />
        <Route path="laporan" element={<Laporan />} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}