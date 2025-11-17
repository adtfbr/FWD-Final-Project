// Lokasi file: src/App.jsx (Router utama aplikasi)

import { Routes, Route, Navigate } from "react-router-dom";

// Layouts & Route Guards
import AdminLayout from "./layouts/AdminLayout.jsx";
import UserLayout from "./layouts/UserLayout.jsx";
import AdminRoute from "./components/AdminRoute.jsx";
import WargaRoute from "./components/WargaRoute.jsx";

// --- Halaman Admin ---
import AdminLogin from "./pages/admin/AdminLogin.jsx";
import Dashboard from "./pages/admin/Dashboard.jsx";
import DataPenduduk from "./pages/admin/DataPenduduk.jsx";
import DataKK from "./pages/admin/DataKK.jsx";
import PengajuanSurat from "./pages/admin/PengajuanSurat.jsx";
import VerifikasiWarga from "./pages/admin/VerifikasiWarga.jsx";
import Laporan from "./pages/admin/Laporan.jsx";
// import DetailPengajuan from "./pages/admin/DetailPengajuan.jsx";

// --- Halaman Warga ---
import WargaLogin from "./pages/user/WargaLogin.jsx";
import Register from "./pages/user/Register.jsx";
import Home from "./pages/user/Home.jsx";
import Profil from "./pages/user/Profil.jsx";
import FormPengajuan from "./pages/user/FormPengajuan.jsx";
import StatusPengajuan from "./pages/user/StatusPengajuan.jsx";

function App() {
  return (
    <Routes>

      {/* ================================
          RUTE PUBLIK (BISA DIAKSES SIAPAPUN)
      ================================= */}
      <Route path="/login" element={<WargaLogin />} />
      <Route path="/register" element={<Register />} />
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* ================================
          RUTE ADMIN (DILINDUNGI AdminRoute)
      ================================= */}
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="penduduk" element={<DataPenduduk />} />
          <Route path="kk" element={<DataKK />} />
          <Route path="pengajuan-surat" element={<PengajuanSurat />} />
          {/* <Route path="pengajuan/:id" element={<DetailPengajuan />} /> */}
          <Route path="verifikasi-warga" element={<VerifikasiWarga />} />
          <Route path="laporan" element={<Laporan />} />

          {/* Redirect /admin → /admin/dashboard */}
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>
      </Route>

      {/* ================================
          RUTE WARGA (DILINDUNGI WargaRoute)
      ================================= */}
      <Route element={<WargaRoute />}>
        <Route path="/" element={<UserLayout />}>
          <Route path="home" element={<Home />} />
          <Route path="profil" element={<Profil />} />
          <Route path="pengajuan" element={<FormPengajuan />} />
          <Route path="status" element={<StatusPengajuan />} />

          {/* Redirect / → /home */}
          <Route index element={<Navigate to="home" replace />} />
        </Route>
      </Route>

      {/* ================================
          FALLBACK ROUTE
          Jika tidak ada yang cocok
      ================================= */}
      <Route path="*" element={<Navigate to="/login" replace />} />

    </Routes>
  );
}

export default App;
