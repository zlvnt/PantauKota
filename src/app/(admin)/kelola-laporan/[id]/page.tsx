"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { STATUS_CONFIG, type LaporanStatus } from "@/types/laporan";

type Laporan = {
  id: string;
  judul: string;
  deskripsi: string;
  status: LaporanStatus;
  kategori: { nama: string };
  user: { name: string; email: string };
  foto: string[];
  alamat: string | null;
  voteCount: number;
  createdAt: string;
  catatanAdmin: string | null;
  fotoPenyelesaian: string | null;
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

  const updateStatus = async (status: LaporanStatus) => {
    setUpdating(true);
    try {
      await fetch(`/api/laporan/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, catatanAdmin: catatan }),
      });
      router.push("/kelola-laporan");
      router.refresh();
    } catch (err) {
      console.error("Gagal update status:", err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!laporan) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        Laporan tidak ditemukan.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center justify-center p-2.5 rounded-full bg-surface-container-lowest hover:bg-surface-container-low transition-colors shadow-ambient mb-6"
          aria-label="Kembali ke halaman sebelumnya"
          title="Kembali"
        >
          <ArrowLeft className="w-5 h-5" strokeWidth={2} />
        </button>

        {/* Main Card */}
        <div className="bg-surface-container-lowest rounded-2xl shadow-ambient p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-on-surface flex-1">
              {laporan.judul}
            </h1>
            <span
              className={`text-xs px-3 py-1.5 rounded-full font-semibold whitespace-nowrap ${
                STATUS_CONFIG[laporan.status].bgClass
              }`}
            >
              {STATUS_CONFIG[laporan.status].label}
            </span>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="font-semibold text-on-surface">Kategori:</span>
              {laporan.kategori?.nama}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="font-semibold text-on-surface">Pelapor:</span>
              {laporan.user?.name}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="font-semibold text-on-surface">Email:</span>
              {laporan.user?.email}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="font-semibold text-on-surface">Dukungan:</span>
              {laporan.voteCount} suara
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="font-semibold text-on-surface">Tanggal:</span>
              {new Date(laporan.createdAt).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>
            {laporan.alamat && (
              <div className="flex items-center gap-2 text-muted-foreground sm:col-span-2">
                <span className="font-semibold text-on-surface">Lokasi:</span>
                {laporan.alamat}
              </div>
            )}
          </div>

          {/* Divider - Tonal Layering */}
          <div className="h-px bg-surface-container-high" />

          {/* Deskripsi */}
          <div>
            <h2 className="text-sm font-semibold text-on-surface mb-2">Deskripsi</h2>
            <p className="text-on-surface/80 leading-relaxed">{laporan.deskripsi}</p>
          </div>

          {/* Foto */}
          {laporan.foto?.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-on-surface mb-3">
                Foto Laporan ({laporan.foto.length})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {laporan.foto.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`Foto laporan ${i + 1}`}
                    className="w-full h-32 sm:h-40 object-cover rounded-xl"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="h-px bg-surface-container-high" />

          {/* Catatan Admin */}
          <div>
            <label
              htmlFor="catatan-admin"
              className="block text-sm font-semibold text-on-surface mb-2"
            >
              Catatan Admin
            </label>
            <textarea
              id="catatan-admin"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              rows={4}
              className="w-full bg-surface-container-low rounded-xl p-4 text-sm text-on-surface placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow resize-none"
              placeholder="Tulis catatan atau tanggapan untuk pelapor..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => updateStatus("DIPROSES")}
              disabled={updating || laporan.status === "DIPROSES"}
              className="flex-1 px-4 py-3 bg-[#3b82f6] text-white rounded-xl text-sm font-semibold hover:bg-[#3b82f6]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {updating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : null}
              Tandai Diproses
            </button>
            <button
              onClick={() => updateStatus("SELESAI")}
              disabled={updating || laporan.status === "SELESAI"}
              className="flex-1 px-4 py-3 bg-tertiary text-white rounded-xl text-sm font-semibold hover:bg-tertiary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {updating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : null}
              Tandai Selesai
            </button>
            <button
              onClick={() => updateStatus("MENUNGGU")}
              disabled={updating || laporan.status === "MENUNGGU"}
              className="flex-1 px-4 py-3 bg-[#f59e0b] text-white rounded-xl text-sm font-semibold hover:bg-[#f59e0b]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {updating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : null}
              Kembalikan ke Menunggu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
