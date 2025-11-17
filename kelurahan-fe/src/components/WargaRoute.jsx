// Lokasi file: src/components/WargaRoute.jsx
// "Satpam" untuk Warga

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserLayout from '../layouts/UserLayout'; 

const WargaRoute = () => {
  const { user } = useAuth(); // Cek dari 'otak'

  // Cek: Apakah user ada DAN rolenya 'warga'?
  if (user && user.role === 'warga') {
    // Jika ya, izinkan akses ke layout warga
    return <UserLayout />;
  }

  // Jika tidak, tendang ke halaman login warga
  return <Navigate to="/login" replace />;
};

export default WargaRoute;