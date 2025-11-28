import { useState, useEffect } from "react";
import api from "../../services/api";
import {
  FaFileAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaUsers,
  FaMale,
  FaFemale,
  FaPrint
} from "react-icons/fa";

export default function Laporan() {
  const [submissionStats, setSubmissionStats] = useState(null);
  const [populationStats, setPopulationStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [submissionRes, populationRes] = await Promise.all([
          api.get("/pengajuan-layanan"),
          api.get("/penduduk?limit=all")
        ]);

        const submissions = submissionRes.data.data || [];
        const residents = populationRes.data.data || [];

        setSubmissionStats({
          total: submissions.length,
          selesai: submissions.filter(s => s.status === "Selesai").length,
          ditolak: submissions.filter(s => s.status === "Ditolak").length,
          diproses: submissions.filter(s => s.status === "Diproses").length,
          diajukan: submissions.filter(s => s.status === "Diajukan").length
        });

        setPopulationStats({
          total: residents.length,
          laki: residents.filter(r => r.jenis_kelamin === "L").length,
          perempuan: residents.filter(r => r.jenis_kelamin === "P").length
        });
      } catch (err) {
        setError("Gagal mengambil data laporan: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, []);

  const handlePrint = () => window.print();

  if (loading)
    return (
      <div className="text-center p-8">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );

  if (error)
    return (
      <div className="alert alert-error shadow-lg">
        <div><span>{error}</span></div>
      </div>
    );

  return (
    <>
      <style>{`
        @media print {
          aside, header, .no-print { display: none !important; }
          main { padding: 0 !important; }
        }
      `}</style>

      <div className="space-y-8">
        <div className="flex justify-between items-center no-print">
          <h1 className="text-3xl font-semibold">Laporan Kelurahan</h1>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <FaPrint /> Cetak Laporan
          </button>
        </div>

        <div className="space-y-8 printable-area">
          <div className="bg-white p-6 shadow-md rounded-lg">
            <h2 className="text-2xl font-semibold mb-6 border-b pb-3">
              Laporan Pengajuan Surat
            </h2>

            {submissionStats && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                  title="Total Ajuan"
                  value={submissionStats.total}
                  icon={<FaFileAlt className="text-gray-500" />}
                  colorClass="border-gray-500"
                />
                <StatCard
                  title="Ajuan Selesai"
                  value={submissionStats.selesai}
                  icon={<FaCheckCircle className="text-green-500" />}
                  colorClass="border-green-500"
                />
                <StatCard
                  title="Ajuan Ditolak"
                  value={submissionStats.ditolak}
                  icon={<FaTimesCircle className="text-red-500" />}
                  colorClass="border-red-500"
                />
                <StatCard
                  title="Masih Diproses"
                  value={submissionStats.diproses + submissionStats.diajukan}
                  icon={<FaSpinner className="text-blue-500" />}
                  colorClass="border-blue-500"
                />
              </div>
            )}
          </div>

          <div className="bg-white p-6 shadow-md rounded-lg">
            <h2 className="text-2xl font-semibold mb-6 border-b pb-3">
              Laporan Kependudukan
            </h2>

            {populationStats && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard
                  title="Total Penduduk"
                  value={populationStats.total}
                  icon={<FaUsers className="text-gray-500" />}
                  colorClass="border-gray-500"
                />
                <StatCard
                  title="Laki-Laki (L)"
                  value={populationStats.laki}
                  icon={<FaMale className="text-blue-500" />}
                  colorClass="border-blue-500"
                />
                <StatCard
                  title="Perempuan (P)"
                  value={populationStats.perempuan}
                  icon={<FaFemale className="text-pink-500" />}
                  colorClass="border-pink-500"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

const StatCard = ({ title, value, icon, colorClass }) => (
  <div className={`bg-white p-6 shadow-md rounded-lg border-l-4 ${colorClass}`}>
    <div className="flex justify-between items-center">
      <div>
        <p className="text-sm font-medium text-gray-500 uppercase">{title}</p>
        <p className="text-3xl font-bold text-gray-800">{value}</p>
      </div>
      <div className="p-3 rounded-full bg-opacity-10">
        {icon}
      </div>
    </div>
  </div>
);