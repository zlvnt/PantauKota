'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { useLaporanMap } from '@/hooks/useLaporanMap';
import { STATUS_CONFIG } from '@/types/laporan';
import type { LaporanMapItem } from '@/types/laporan';
import {
  MapPin,
  ThumbsUp,
  RefreshCw,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { DynamicIcon } from '@/components/ui/DynamicIcon';

// Dynamic import — Leaflet tidak bisa di-render di server (butuh window)
const MapView = dynamic(() => import('@/components/map/MapView'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-surface-container-low">
      <div className="flex flex-col items-center gap-3 text-[#677177]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm font-medium">Memuat peta...</p>
      </div>
    </div>
  ),
});

// ─── Kartu Laporan di Panel Kiri ─────────────────────────────────────────────
function LaporanCard({
  item,
  isSelected,
  onClick,
}: {
  item: LaporanMapItem;
  isSelected: boolean;
  onClick: () => void;
}) {
  const cfg = STATUS_CONFIG[item.status];
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 rounded-lg transition-all ${
        isSelected
          ? 'bg-primary/10 ring-1 ring-primary'
          : 'hover:bg-surface-container-high'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex-shrink-0 p-2 bg-surface rounded-lg text-[#677177] shadow-sm">
          <DynamicIcon iconName={item.kategori.icon} className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-on-surface line-clamp-2 leading-snug">
            {item.judul}
          </p>
          <span
            className={`inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${cfg.bgClass}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotClass}`} />
            {cfg.label}
          </span>
          {item.alamat && (
            <p className="text-xs text-[#677177] mt-1.5 flex items-start gap-1 line-clamp-1">
              <MapPin className="w-3 h-3 mt-px flex-shrink-0" strokeWidth={1.5} />
              {item.alamat}
            </p>
          )}
          <div className="flex items-center gap-3 mt-1.5 text-xs text-[#8a969c]">
            <span className="flex items-center gap-1">
              <ThumbsUp className="w-3 h-3" strokeWidth={1.5} />
              {item.voteCount}
            </span>
            <span className="text-[#a9b4b9]">·</span>
            <span>{item.kategori.nama}</span>
          </div>
        </div>
      </div>
    </button>
  );
}

// ─── Halaman Peta ─────────────────────────────────────────────────────────────
export default function PetaPage() {
  const { laporan, isLoading, error, refetch } = useLaporanMap();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(true);

  // Statistik ringkas untuk header panel
  const stats = {
    total: laporan.length,
    menunggu: laporan.filter((l) => l.status === 'MENUNGGU').length,
    diproses: laporan.filter((l) => l.status === 'DIPROSES').length,
    selesai: laporan.filter((l) => l.status === 'SELESAI').length,
  };

  const handleMarkerClick = (id: string) => {
    setSelectedId(id);
    // Buka panel jika tertutup
    if (!isPanelOpen) setIsPanelOpen(true);
    // Scroll ke kartu yang dipilih di panel
    const card = document.getElementById(`card-${id}`);
    card?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  return (
    // Full viewport — dikurangi tinggi navbar (64px)
    <div className="flex h-[calc(100vh-64px)] relative overflow-hidden bg-surface">

      {/* ── Panel Kiri (Daftar Laporan) ───────────────────────────────── */}
      <aside
        className={`flex flex-col bg-surface-container-lowest shadow-ambient transition-all duration-300 z-10 border-r border-[rgba(169,180,185,0.15)] ${
          isPanelOpen ? 'w-80 xl:w-96' : 'w-0'
        } overflow-hidden flex-shrink-0`}
      >
        <div className="flex-shrink-0 p-4 border-b border-[rgba(169,180,185,0.12)]">
          {/* Header panel */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-display font-semibold text-on-surface text-base">
                Laporan di Peta
              </h2>
              <p className="text-xs text-[#677177] mt-0.5">
                {isLoading ? 'Memuat...' : `${stats.total} laporan ditemukan`}
              </p>
            </div>
            <button
              onClick={refetch}
              className="p-1.5 rounded-lg hover:bg-surface-container-low text-[#677177] hover:text-on-surface transition-colors"
              title="Perbarui data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} strokeWidth={1.5} />
            </button>
          </div>

          {/* Statistik Status */}
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                ['MENUNGGU', stats.menunggu],
                ['DIPROSES', stats.diproses],
                ['SELESAI', stats.selesai],
              ] as const
            ).map(([status, count]) => {
              const cfg = STATUS_CONFIG[status];
              return (
                <div
                  key={status}
                  className="text-center py-2 px-1 rounded-lg bg-surface-container-low"
                >
                  <p className={`text-lg font-display font-bold leading-none`}
                     style={{ color: cfg.color }}>
                    {count}
                  </p>
                  <p className="text-[10px] text-[#677177] mt-1 font-medium uppercase tracking-wide">
                    {cfg.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Daftar Laporan (Sesuai No-Line Rule: Gunakan whitespace & hover state untuk pemisah) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {isLoading && (
            <div className="flex flex-col items-center gap-2 py-12 text-[#677177]">
              <Loader2 className="w-6 h-6 animate-spin" strokeWidth={1.5} />
              <p className="text-sm">Memuat laporan...</p>
            </div>
          )}
          {error && (
            <div className="flex flex-col items-center gap-2 py-12 text-error">
              <AlertCircle className="w-6 h-6" strokeWidth={1.5} />
              <p className="text-sm text-center">{error}</p>
              <button
                onClick={refetch}
                className="text-xs text-primary hover:text-primary-dim font-medium mt-1"
              >
                Coba lagi
              </button>
            </div>
          )}
          {!isLoading && !error && laporan.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-12 text-[#677177]">
              <MapPin className="w-6 h-6" strokeWidth={1.5} />
              <p className="text-sm">Belum ada laporan masuk</p>
            </div>
          )}
          {!isLoading &&
            laporan.map((item) => (
              <div key={item.id} id={`card-${item.id}`}>
                <LaporanCard
                  item={item}
                  isSelected={selectedId === item.id}
                  onClick={() => setSelectedId(item.id === selectedId ? null : item.id)}
                />
              </div>
            ))}
        </div>

        {/* Footer panel: tombol buat laporan */}
        <div className="flex-shrink-0 p-3 border-t border-[rgba(169,180,185,0.12)]">
          <Link
            href="/laporan/buat"
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-primary hover:bg-primary-dim text-white text-sm font-semibold rounded-lg transition-colors shadow-ambient"
          >
            + Laporkan Masalah
          </Link>
        </div>
      </aside>

      {/* ── Toggle Panel Button ───────────────────────────────────────── */}
      <button
        onClick={() => setIsPanelOpen(!isPanelOpen)}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-surface-container-lowest hover:bg-surface-container-low shadow-ambient border border-[rgba(169,180,185,0.2)] rounded-r-lg p-1.5 transition-all"
        style={{ left: isPanelOpen ? (window.innerWidth >= 1280 ? '24rem' : '20rem') : '0' }}
        title={isPanelOpen ? 'Tutup panel' : 'Buka panel'}
      >
        {isPanelOpen ? (
          <ChevronLeft className="w-4 h-4 text-[#677177]" strokeWidth={2} />
        ) : (
          <ChevronRight className="w-4 h-4 text-[#677177]" strokeWidth={2} />
        )}
      </button>

      {/* ── Peta Utama ────────────────────────────────────────────────── */}
      <div className="flex-1 relative">
        <MapView
          laporan={laporan}
          selectedId={selectedId}
          onMarkerClick={handleMarkerClick}
        />

        {/* Legenda Status — floating di pojok kanan bawah */}
        <div className="absolute bottom-6 right-4 z-[999] bg-surface-container-lowest/90 backdrop-blur-md border border-[rgba(169,180,185,0.2)] rounded-xl p-3 shadow-ambient space-y-1.5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#677177] mb-2">
            Keterangan Status
          </p>
          {(Object.entries(STATUS_CONFIG) as [keyof typeof STATUS_CONFIG, typeof STATUS_CONFIG[keyof typeof STATUS_CONFIG]][]).map(
            ([key, cfg]) => (
              <div key={key} className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: cfg.color }}
                />
                <span className="text-xs text-on-surface">{cfg.label}</span>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
