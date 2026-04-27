"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Laporan = {
  id: string;
  judul: string;
  status: string;
  kategori: { nama: string };
  user: { name: string };
  createdAt: string;
  voteCount: number;
};

const statusColor: Record<string, string> = {
  MENUNGGU: "bg-yellow-100 text-yellow-800",
  DIPROSES: "bg-blue-100 text-blue-800",
  SELESAI: "bg-green-100 text-green-800",
};

export default function KelolaLaporanPage() {
  const [laporan, setLaporan] = useState<Laporan[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("SEMUA");

  useEffect(() => {
    const fetchLaporan = async () => {
      try {
        const query = filter !== "SEMUA" ? `?status=${filter}&adminView=true` : `?adminView=true`;
        const res = await fetch(`/api/laporan${query}`);
        const data = await res.json();
        setLaporan(data);
      } catch (err) {
        console.error("Gagal mengambil laporan:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLaporan();
  }, [filter]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Kelola Laporan
        </h1>

        {/* Filter */}
        <div className="flex gap-2 mb-6">
          {["SEMUA", "MENUNGGU", "DIPROSES", "SELESAI"].map((s) => (
            <button
              key={s}
              onClick={() => { setFilter(s); setLoading(true); }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${
                filter === s
                  ? "bg-green-600 text-white border-green-600"
                  : "bg-white text-gray-600 border-gray-300 hover:border-green-400"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {loading && (
          <p className="text-gray-500 text-center py-10">Memuat data...</p>
        )}

        {!loading && laporan.length === 0 && (
          <p className="text-center text-gray-400 py-10">Tidak ada laporan.</p>
        )}

        <div className="flex flex-col gap-3">
          {laporan.map((item) => (
            <Link href={`/kelola-laporan/${item.id}`} key={item.id}>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-gray-800">{item.judul}</h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {item.kategori?.nama} · {item.user?.name} · {new Date(item.createdAt).toLocaleDateString("id-ID")}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    👍 {item.voteCount} suara
                  </p>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColor[item.status] ?? "bg-gray-100 text-gray-600"}`}>
                  {item.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}