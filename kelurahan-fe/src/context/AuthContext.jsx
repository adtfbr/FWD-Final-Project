// Lokasi file: src/context/AuthContext.jsx
// KODE FINAL (Sesuai dengan respons API Anda)

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

  // --- FUNGSI UNTUK ADMIN/PETUGAS ---
  const loginPetugas = async (email, password) => {
    try {
      // Panggil /login
      const response = await api.post('/login', { email, password });

      // === INI ADALAH PERBAIKANNYA ===
      // Ambil objek 'data' dari dalam respons
      const responseData = response.data.data;
      
      // Sekarang ambil 'token' dan 'user' dari 'responseData'
      const { token, user } = responseData;
      // === SELESAI PERBAIKAN ===

      if (!token) {
        throw new Error("Token tidak diterima dari server");
      }

      // Cek Role
      if (user.role !== 'petugas') {
        throw new Error("Akun ini bukan akun petugas.");
      }

      // Simpan ke localStorage dan state
      localStorage.setItem('authToken', token);
      localStorage.setItem('authUser', JSON.stringify(user));
      setUser(user);
      
      return user;

    } catch (error) {
      console.error("Login petugas gagal:", error);
      localStorage.removeItem('authToken'); // Bersihkan jika gagal
      throw error;
    }
  };

  // --- FUNGSI UNTUK WARGA ---
  const loginWarga = async (email, password) => {
    try {
      // Panggil /login
      const response = await api.post('/login', { email, password });

      // === INI ADALAH PERBAIKANNYA ===
      const responseData = response.data.data;
      const { token, user } = responseData;
      // === SELESAI PERBAIKAN ===

      if (!token) {
        throw new Error("Token tidak diterima dari server");
      }
      
      // Cek Role
      if (user.role !== 'warga') {
        throw new Error("Akun ini bukan akun warga.");
      }
      
      // Simpan ke localStorage dan state
      localStorage.setItem('authToken', token);
      localStorage.setItem('authUser', JSON.stringify(user));
      setUser(user);
      
      return user;

    } catch (error) {
      console.error("Login warga gagal:", error);
      localStorage.removeItem('authToken'); // Bersihkan jika gagal
      
      if (error.response && error.response.status === 403) {
        throw new Error("Akun Anda sedang menunggu verifikasi petugas.");
      }
      if (error.response && error.response.status === 401) {
         throw new Error("Email atau password salah.");
      }
      
      throw new Error("Login gagal. " + (error.response?.data?.message || error.message));
    }
  };

  // (Fungsi registerWarga tidak berubah)
  const registerWarga = async (formData) => {
    try {
      await api.post('/register', formData);
      return true;
    } catch (error) {
      console.error("Registrasi gagal:", error);
      if (error.response && error.response.data.errors) {
        const errors = error.response.data.errors;
        const firstError = Object.values(errors)[0][0];
        throw new Error(firstError);
      }
      throw new Error("Registrasi gagal. Silakan coba lagi.");
    }
  };

  // --- FUNGSI LOGOUT (Umum) ---
  const logout = async () => {
    const userRole = user?.role; 
    
    try {
      // Kita panggil /logout. api.js akan otomatis mengirim token.
      await api.post('/logout'); 
    } catch (error) {
      console.error("Error saat logout di server:", error);
    } finally {
      // Selalu bersihkan data di frontend
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      setUser(null);
      
      if (userRole === 'petugas') {
        navigate('/admin/login');
      } else {
        navigate('/login');
      }
    }
  };

  // --- PROVIDER VALUE ---
  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loginPetugas, 
        logout, 
        loginWarga, 
        registerWarga 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook kustom agar lebih mudah digunakan
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  return useContext(AuthContext);
};