'use client';

import dynamic from 'next/dynamic';
import { useState, useCallback } from 'react';
import { useLaporanMap } from '@/hooks/useLaporanMap';
import { STATUS_CONFIG } from '@/types/laporan';
import type { LaporanAdminMapItem } from '@/types/laporan';
import {
  MapPin,
  ThumbsUp,
  RefreshCw,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  User,
  Calendar,
  Filter,
  AlertTriangle,
} from 'lucide-react';
import { DynamicIcon } from '@/components/ui/DynamicIcon';

const AdminMapView = dynamic(() => import('@/components/map/AdminMapView'), {
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

// ─── Kartu Laporan Admin (lebih detail daripada warga) ────────────────────────
function AdminLaporanCard({
  item,
  isSelected,
  onClick,
}: {
  item: LaporanAdminMapItem;
  isSelected: boolean;
  onClick: () => void;
}) {
  const cfg = STATUS_CONFIG[item.status];
  const isUrgent = item.voteCount >= 30 && item.status === 'MENUNGGU';

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 rounded-lg transition-all ${
        isSelected
          ? 'bg-primary/10 ring-1 ring-primary'
          : isUrgent
          ? 'bg-red-50 hover:bg-red-100 ring-1 ring-red-200'
          : 'hover:bg-surface-container-high'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex-shrink-0 p-2 bg-surface rounded-lg text-[#677177] shadow-sm">
          <DynamicIcon iconName={item.kategori.icon} className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            {isUrgent && (
              <AlertTriangle className="w-3 h-3 text-red-500 flex-shrink-0" strokeWidth={2.5} />
            )}
            <p className="text-sm font-semibold text-on-surface line-clamp-2 leading-snug">
              {item.judul}
            </p>
          </div>

          {/* Info pelapor — eksklusif admin */}
          <p className="text-xs text-[#677177] flex items-center gap-1 mb-1.5">
            <User className="w-3 h-3 flex-shrink-0" strokeWidth={1.5} />
            {item.user.name}
          </p>

          <div className="flex items-center justify-between">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${cfg.bgClass}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotClass}`} />
              {cfg.label}
            </span>
            <span className="flex items-center gap-1 text-xs text-[#8a969c]">
              <ThumbsUp className="w-3 h-3" strokeWidth={1.5} />
              {item.voteCount}
            </span>
          </div>

          <p className="text-[11px] text-[#a9b4b9] mt-1 flex items-center gap-1">
            <Calendar className="w-3 h-3" strokeWidth={1.5} />
            {new Date(item.createdAt).toLocaleDateString('id-ID', {
              day: 'numeric', month: 'short', year: 'numeric',
            })}
          </p>
        </div>
      </div>
    </button>
  );
}

// ─── Halaman Peta Admin ───────────────────────────────────────────────────────
export default function AdminPetaPage() {
  // Gunakan hook yang sama dengan tambahan adminView=true
  const { laporan: rawLaporan, isLoading, error, refetch } = useLaporanMap({ adminView: true });
  const laporan = rawLaporan as LaporanAdminMapItem[];

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('');

  // Update status laporan di state lokal setelah quick action
  const [statusOverrides, setStatusOverrides] = useState<Record<string, LaporanAdminMapItem['status']>>({});

  const handleStatusUpdate = useCallback(
    (id: string, newStatus: LaporanAdminMapItem['status']) => {
      setStatusOverrides((prev) => ({ ...prev, [id]: newStatus }));
    },
    []
  );

  // Apply status override ke data laporan
  const displayLaporan = laporan.map((l) =>
    statusOverrides[l.id] ? { ...l, status: statusOverrides[l.id] } : l
  );

  // Filter berdasarkan status yang dipilih
  const filteredLaporan = filterStatus
    ? displayLaporan.filter((l) => l.status === filterStatus)
    : displayLaporan;

  // Statistik
  const stats = {
    total: displayLaporan.length,
    menunggu: displayLaporan.filter((l) => l.status === 'MENUNGGU').length,
    diproses: displayLaporan.filter((l) => l.status === 'DIPROSES').length,
    selesai: displayLaporan.filter((l) => l.status === 'SELESAI').length,
    urgent: displayLaporan.filter((l) => l.voteCount >= 30 && l.status === 'MENUNGGU').length,
  };

  const handleMarkerClick = (id: string) => {
    setSelectedId(id);
    if (!isPanelOpen) setIsPanelOpen(true);
    document.getElementById(`admin-card-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  return (
    <div className="flex h-screen relative overflow-hidden bg-surface">

      {/* ── Panel Kiri Admin ───────────────────────────────────────────── */}
      <aside className={`flex flex-col bg-surface-container-lowest shadow-ambient transition-all duration-300 z-10 border-r border-[rgba(169,180,185,0.15)] ${isPanelOpen ? 'w-80 xl:w-96' : 'w-0'} overflow-hidden flex-shrink-0`}>
        <div className="flex-shrink-0 p-4 border-b border-[rgba(169,180,185,0.12)]">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-display font-semibold text-on-surface text-base">Peta Laporan</h2>
              <p className="text-xs text-[#677177] mt-0.5">
                {isLoading ? 'Memuat...' : `${filteredLaporan.length} dari ${stats.total} laporan`}
              </p>
            </div>
            <button onClick={refetch} className="p-1.5 rounded-lg hover:bg-surface-container-low text-[#677177] hover:text-on-surface transition-colors" title="Refresh">
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} strokeWidth={1.5} />
            </button>
          </div>

          {/* Indikator Darurat */}
          {stats.urgent > 0 && (
            <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-red-50 rounded-lg border border-red-100">
              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" strokeWidth={2} />
              <p className="text-xs text-red-700 font-medium">
                {stats.urgent} laporan darurat (suara tinggi, belum ditangani)
              </p>
            </div>
          )}

          {/* Statistik */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            {([['MENUNGGU', stats.menunggu], ['DIPROSES', stats.diproses], ['SELESAI', stats.selesai]] as const).map(([status, count]) => {
              const cfg = STATUS_CONFIG[status];
              const isActive = filterStatus === status;
              return (
                <button
                  key={status}
                  onClick={() => setFilterStatus(isActive ? '' : status)}
                  className={`text-center py-2 px-1 rounded-lg transition-all ${
                    isActive
                      ? 'ring-2 ring-offset-1 ring-primary'
                      : 'bg-surface-container-low hover:bg-surface-container-high'
                  }`}
                >
                  <p className="text-lg font-display font-bold leading-none" style={{ color: cfg.color }}>
                    {count}
                  </p>
                  <p className="text-[10px] text-[#677177] mt-1 font-medium uppercase tracking-wide">
                    {cfg.label}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Filter indicator */}
          {filterStatus && (
            <div className="flex items-center gap-2 text-xs text-primary bg-primary/5 px-3 py-1.5 rounded-lg">
              <Filter className="w-3 h-3" strokeWidth={1.5} />
              Filter aktif: {STATUS_CONFIG[filterStatus as keyof typeof STATUS_CONFIG].label}
              <button onClick={() => setFilterStatus('')} className="ml-auto hover:text-primary-dim font-bold">✕</button>
            </div>
          )}
        </div>

        {/* Daftar Laporan (No-Line Rule) */}
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
            </div>
          )}
          {!isLoading && filteredLaporan.map((item) => (
            <div key={item.id} id={`admin-card-${item.id}`}>
              <AdminLaporanCard
                item={item}
                isSelected={selectedId === item.id}
                onClick={() => setSelectedId(item.id === selectedId ? null : item.id)}
              />
            </div>
          ))}
        </div>
      </aside>

      {/* ── Toggle Panel ──────────────────────────────────────────────── */}
      <button
        onClick={() => setIsPanelOpen(!isPanelOpen)}
        className="absolute top-1/2 -translate-y-1/2 z-20 bg-surface-container-lowest hover:bg-surface-container-low shadow-ambient border border-[rgba(169,180,185,0.2)] rounded-r-lg p-1.5 transition-all"
        style={{ left: isPanelOpen ? (typeof window !== 'undefined' && window.innerWidth >= 1280 ? '24rem' : '20rem') : '0' }}
      >
        {isPanelOpen
          ? <ChevronLeft className="w-4 h-4 text-[#677177]" strokeWidth={2} />
          : <ChevronRight className="w-4 h-4 text-[#677177]" strokeWidth={2} />}
      </button>

      {/* ── Peta Admin ────────────────────────────────────────────────── */}
      <div className="flex-1 relative">
        <AdminMapView
          laporan={filteredLaporan}
          selectedId={selectedId}
          onMarkerClick={handleMarkerClick}
          onStatusUpdate={handleStatusUpdate}
        />

        {/* Legenda + Keterangan Prioritas */}
        <div className="absolute bottom-6 right-4 z-[999] bg-surface-container-lowest/90 backdrop-blur-md border border-[rgba(169,180,185,0.2)] rounded-xl p-3 shadow-ambient space-y-1.5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#677177] mb-2">
            Status Laporan
          </p>
          {(Object.entries(STATUS_CONFIG) as [keyof typeof STATUS_CONFIG, typeof STATUS_CONFIG[keyof typeof STATUS_CONFIG]][]).map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cfg.color }} />
              <span className="text-xs text-on-surface">{cfg.label}</span>
            </div>
          ))}
          <div className="border-t border-[rgba(169,180,185,0.15)] pt-1.5 mt-1.5 space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#677177]">Prioritas</p>
            <div className="flex items-center gap-2 text-xs text-on-surface">
              <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-3 h-3 text-red-500" strokeWidth={2} />
              </div>
              Darurat (30+ suara)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
