// Lokasi file: src/components/AdminRoute.jsx
// "Satpam" untuk Admin

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 
import AdminLayout from '../layouts/AdminLayout'; 

const AdminRoute = () => {
  const { user } = useAuth(); // Cek dari 'otak'

  // Cek: Apakah user ada DAN rolenya 'petugas'?
  if (user && user.role === 'petugas') {
    // Jika ya, izinkan akses ke layout admin
    return <AdminLayout />;
  }

  // Jika tidak, tendang ke halaman login admin
  return <Navigate to="/admin/login" replace />;
};

export default AdminRoute;