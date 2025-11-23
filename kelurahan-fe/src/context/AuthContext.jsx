// src/context/AuthContext.jsx
import { createContext, useState, useContext } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('authUser');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  
  const navigate = useNavigate(); 

  // --- FUNGSI LOGIN GENERIK (UTAMA) ---
  const handleLogin = async (email, password, expectedRole) => {
    try {
      const response = await api.post('/login', { email, password });
      const { token, user: userData } = response.data.data;

      if (!token) throw new Error("Token tidak diterima dari server");

      // Validasi Role
      if (userData.role !== expectedRole) {
        throw new Error(`Akun ini bukan akun ${expectedRole}.`);
      }

      // Simpan Data
      localStorage.setItem('authToken', token);
      localStorage.setItem('authUser', JSON.stringify(userData));
      setUser(userData);
      
      return userData;

    } catch (error) {
      console.error(`Login ${expectedRole} gagal:`, error);
      localStorage.removeItem('authToken'); // Bersihkan jika gagal
      
      // Error Handling Spesifik
      if (error.response) {
        if (error.response.status === 403) throw new Error("Akun Anda sedang menunggu verifikasi atau non-aktif.");
        if (error.response.status === 401) throw new Error("Email atau password salah.");
        throw new Error(error.response.data.message || "Terjadi kesalahan pada server.");
      }
      throw error;
    }
  };

  // Wrapper untuk Petugas
  const loginPetugas = (email, password) => handleLogin(email, password, 'petugas');

  // Wrapper untuk Warga
  const loginWarga = (email, password) => handleLogin(email, password, 'warga');

  // --- FUNGSI REGISTER ---
  const registerWarga = async (formData) => {
    try {
      await api.post('/register', formData);
      return true;
    } catch (error) {
      if (error.response && error.response.data.errors) {
        const errors = error.response.data.errors;
        const firstError = Object.values(errors)[0][0];
        throw new Error(firstError);
      }
      throw new Error("Registrasi gagal. Silakan coba lagi.");
    }
  };

  // --- FUNGSI LOGOUT ---
  const logout = async () => {
    const userRole = user?.role; 
    try {
      await api.post('/logout'); 
    } catch (error) {
      console.error("Error logout server:", error);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      setUser(null);
      
      if (userRole === 'petugas') navigate('/admin/login');
      else navigate('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loginPetugas, loginWarga, logout, registerWarga }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);