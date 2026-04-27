"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

type Laporan = {
  id: string;
  judul: string;
  status: string;
  kategori: { nama: string };
  createdAt: string;
  fotoBukti: string | null;
};

const statusColor: Record<string, string> = {
  MENUNGGU: "bg-yellow-100 text-yellow-800",
  DIPROSES: "bg-blue-100 text-blue-800",
  SELESAI: "bg-green-100 text-green-800",
};

export default function RiwayatPage() {
  const { data: session } = useSession();
  const [laporan, setLaporan] = useState<Laporan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRiwayat = async () => {
      try {
        const res = await fetch("/api/laporan/riwayat");
        const data = await res.json();
        setLaporan(data);
      } catch (err) {
        console.error("Gagal mengambil riwayat:", err);
      } finally {
        setLoading(false);
      }
    };

    if (session) fetchRiwayat();
  }, [session]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Riwayat Laporan Saya
        </h1>

        {loading && (
          <p className="text-gray-500 text-center py-10">Memuat data...</p>
        )}

        {!loading && laporan.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg">Belum ada laporan.</p>
            <Link
              href="/laporan/buat"
              className="mt-4 inline-block bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Buat Laporan Pertama
            </Link>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {laporan.map((item) => (
            <Link href={`/laporan/${item.id}`} key={item.id}>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition flex gap-4">
                {item.fotoBukti && (
                  <img
                    src={item.fotoBukti}
                    alt="foto"
                    className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="font-semibold text-gray-800">{item.judul}</h2>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        statusColor[item.status] ?? "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{item.kategori?.nama}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(item.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}