// Lokasi file: src/components/Logo.jsx
import logoImage from '../assets/logo.jpg'; 

export default function Logo({ className = "h-16", variant = "default" }) {
  // Variant 'white-bg' berguna jika logo ditaruh di background gelap (seperti Sidebar Biru)
  // Kita beri kotak putih agar logo terlihat jelas.
  
  if (variant === "white-bg") {
    return (
      <div className="bg-white p-2 rounded-xl shadow-md inline-block">
        <img 
          src={logoImage} 
          alt="Logo Nagari" 
          className={`block object-contain ${className}`} 
        />
      </div>
    );
  }

  // Default (Transparan/Biasa) untuk background putih (Halaman Login)
  return (
    <img 
      src={logoImage} 
      alt="Logo Nagari" 
      className={`block object-contain ${className}`} 
    />
  );
}