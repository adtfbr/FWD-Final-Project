/* eslint-disable react-refresh/only-export-components */

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

  
  const handleLogin = async (email, password, expectedRole) => {
    try {
      const response = await api.post('/login', { email, password });
      const { token, user: userData } = response.data.data;

      if (!token) throw new Error("Token tidak diterima dari server");

      
      if (userData.role !== expectedRole) {
        throw new Error(`Akun ini bukan akun ${expectedRole}.`);
      }

      
      localStorage.setItem('authToken', token);
      localStorage.setItem('authUser', JSON.stringify(userData));
      setUser(userData);
      
      return userData;

    } catch (error) {
      console.error(`Login ${expectedRole} gagal:`, error);
      localStorage.removeItem('authToken'); 
      
      
      if (error.response) {
        if (error.response.status === 403) throw new Error("Akun Anda sedang menunggu verifikasi atau non-aktif.");
        if (error.response.status === 401) throw new Error("Email atau password salah.");
        throw new Error(error.response.data.message || "Terjadi kesalahan pada server.");
      }
      throw error;
    }
  };

  
  const loginPetugas = (email, password) => handleLogin(email, password, 'petugas');

  
  const loginWarga = (email, password) => handleLogin(email, password, 'warga');

  
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


export const useAuth = () => useContext(AuthContext);