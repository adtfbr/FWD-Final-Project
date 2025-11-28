import React from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  FaUser,
  FaIdCard,
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhone,
  FaCalendarAlt,
} from 'react-icons/fa';

const InfoItem = ({ icon, label, value }) => (
  <div className="flex items-start p-3">
    <div className="shrink-0 w-8 text-center">
      {React.cloneElement(icon, { className: 'text-blue-600 text-xl' })}
    </div>
    <div className="ml-4">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-gray-800 font-semibold">{value || '-'}</p>
    </div>
  </div>
);

export default function Profil() {
  const { user } = useAuth();

  const penduduk = user?.penduduk || {};
  const akun = user || {};

  return (
    <div className="p-0">
      <h1 className="text-3xl font-semibold mb-6">Profil Saya</h1>

      <div className="bg-white p-6 shadow-md rounded-lg">
        <div className="flex flex-col sm:flex-row items-center mb-6 border-b pb-6">
          <FaUser className="text-5xl text-blue-600 p-3 bg-blue-100 rounded-full mb-4 sm:mb-0" />
          <div className="sm:ml-4 text-center sm:text-left">
            <h2 className="text-2xl font-bold text-gray-800">
              {penduduk.nama || akun.name}
            </h2>
            <p className="text-gray-500">NIK: {penduduk.nik || 'N/A'}</p>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-gray-700 mb-4">
          Detail Akun & Kependudukan
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
          <InfoItem icon={<FaEnvelope />} label="Email Akun" value={akun.email} />

          <InfoItem
            icon={<FaPhone />}
            label="Nomor Telepon"
            value={penduduk.telepon}
          />

          <InfoItem
            icon={<FaMapMarkerAlt />}
            label="Alamat"
            value={penduduk.alamat}
          />

          <InfoItem
            icon={<FaIdCard />}
            label="Jenis Kelamin"
            value={penduduk.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
          />

          <InfoItem
            icon={<FaCalendarAlt />}
            label="Tanggal Lahir"
            value={
              penduduk.tanggal_lahir
                ? new Date(penduduk.tanggal_lahir).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : '-'
            }
          />

          <InfoItem
            icon={<FaIdCard />}
            label="Nomor KK"
            value={penduduk.id_kk}
          />
        </div>
      </div>
    </div>
  );
}