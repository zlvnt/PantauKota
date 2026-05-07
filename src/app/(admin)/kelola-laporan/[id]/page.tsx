"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Laporan = {
  id: string;
  judul: string;
  deskripsi: string;
  status: string;
  kategori: { nama: string };
  user: { name: string; email: string };
  foto: string[];
  alamat: string | null;
  voteCount: number;
  createdAt: string;
  catatanAdmin: string | null;
  fotoPenyelesaian: string | null;
};

const statusColor: Record<string, string> = {
  MENUNGGU: "bg-yellow-100 text-yellow-800",
  DIPROSES: "bg-blue-100 text-blue-800",
  SELESAI: "bg-green-100 text-green-800",
};

export default function DetailLaporanAdminPage() {
  const { id } = useParams();
  const router = useRouter();
  const [laporan, setLaporan] = useState<Laporan | null>(null);
  const [loading, setLoading] = useState(true);
  const [catatan, setCatatan] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await fetch(`/api/laporan/${id}`);
        const data = await res.json();
        setLaporan(data);
        setCatatan(data.catatanAdmin ?? "");
      } catch (err) {
        console.error("Gagal mengambil detail:", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetail();
  }, [id]);

  const updateStatus = async (status: string) => {
    setUpdating(true);
    try {
      await fetch(`/api/laporan/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, catatanAdmin: catatan }),
      });
      router.push("/kelola-laporan");
    } catch (err) {
      console.error("Gagal update status:", err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <p className="text-center py-10 text-gray-500">Memuat...</p>;
  if (!laporan) return <p className="text-center py-10 text-gray-500">Laporan tidak ditemukan.</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-flex items-center gap-1"
        >
          ← Kembali
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-800">{laporan.judul}</h1>
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColor[laporan.status]}`}>
              {laporan.status}
            </span>
          </div>

          {/* Info */}
          <div className="text-sm text-gray-500 flex flex-wrap gap-3 mb-4">
            <span>📁 {laporan.kategori?.nama}</span>
            <span>👤 {laporan.user?.name}</span>
            <span>📧 {laporan.user?.email}</span>
            <span>👍 {laporan.voteCount} suara</span>
            <span>📅 {new Date(laporan.createdAt).toLocaleDateString("id-ID")}</span>
            {laporan.alamat && <span>📍 {laporan.alamat}</span>}
          </div>

          {/* Deskripsi */}
          <p className="text-gray-700 mb-4">{laporan.deskripsi}</p>

          {/* Foto */}
          {laporan.foto?.length > 0 && (
            <div className="flex gap-2 flex-wrap mb-4">
              {laporan.foto.map((url, i) => (
                <img key={i} src={url} alt="foto" className="w-32 h-32 object-cover rounded-lg" />
              ))}
            </div>
          )}

          {/* Catatan Admin */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Catatan Admin
            </label>
            <textarea
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="Tulis catatan atau tanggapan..."
            />
          </div>

          {/* Aksi Status */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => updateStatus("DIPROSES")}
              disabled={updating || laporan.status === "DIPROSES"}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              Tandai Diproses
            </button>
            <button
              onClick={() => updateStatus("SELESAI")}
              disabled={updating || laporan.status === "SELESAI"}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50"
            >
              Tandai Selesai
            </button>
            <button
              onClick={() => updateStatus("MENUNGGU")}
              disabled={updating || laporan.status === "MENUNGGU"}
              className="px-4 py-2 bg-yellow-500 text-white rounded-lg text-sm hover:bg-yellow-600 disabled:opacity-50"
            >
              Kembalikan ke Menunggu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}