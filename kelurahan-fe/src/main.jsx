// Lokasi file: src/main.jsx

import React from 'react'
import ReactDOM from 'react-dom/client'
import Router from './router/index.jsx' // <-- 1. Import Router Anda
import './index.css'
import { AuthProvider } from './context/AuthContext.jsx' 
import { BrowserRouter } from 'react-router-dom'; 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* "Mobil" membungkus "Otak" */}
    <BrowserRouter> 
      {/* "Otak" membungkus "Peta" */}
      <AuthProvider> 
        <Router /> {/* <-- 2. Gunakan Router Anda di sini */}
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)