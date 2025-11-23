// Lokasi file: src/services/api.js

import axios from 'axios';

// Mengambil URL dari file .env
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 2. Buat instance axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// 3. (PENTING) Interceptor untuk Menambahkan Token Otomatis
// Fungsi ini akan berjalan SETIAP KALI Anda membuat request
api.interceptors.request.use(
  (config) => {
    // Ambil token dari localStorage
    const token = localStorage.getItem('authToken'); 
    
    if (token) {
      // Jika token ada, tambahkan ke header Authorization
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 4. (PENTING) Ini yang dicari oleh file lain
export default api;