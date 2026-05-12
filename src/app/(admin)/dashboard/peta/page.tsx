'use client';

import dynamic from 'next/dynamic';
import { useState, useCallback, useEffect, useRef } from 'react';
import { useLaporanMap } from '@/hooks/useLaporanMap';
import { useDebounce } from '@/hooks/useDebounce';
import { STATUS_CONFIG } from '@/types/laporan';
import type { LaporanAdminMapItem, KategoriItem } from '@/types/laporan';
import { PRIORITY_THRESHOLD } from '@/lib/constants';
import { calculatePriorityScore } from '@/lib/utils';
import {
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
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Search,
  X,
} from 'lucide-react';
import { DynamicIcon } from '@/components/ui/DynamicIcon';
import StatusBadge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';

const AdminMapView = dynamic(() => import('@/components/map/AdminMapView'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-surface-container-low">
      <div className="flex flex-col items-center gap-3 text-[#677177]">
        <Spinner size="lg" />
        <p className="text-sm font-medium">Memuat peta...</p>
      </div>
    </div>
  ),
});

// ─── Kartu Laporan Admin ────────────────────────────────────────────────────
function AdminLaporanCard({
  item,
  isSelected,
  onClick,
}: {
  item: LaporanAdminMapItem;
  isSelected: boolean;
  onClick: () => void;
}) {
  const isUrgent =
    item.status !== 'SELESAI' &&
    (item.prioritas ||
      calculatePriorityScore(item.voteCount, item.createdAt) >= PRIORITY_THRESHOLD);

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

          <p className="text-xs text-[#677177] flex items-center gap-1 mb-1.5">
            <User className="w-3 h-3 flex-shrink-0" strokeWidth={1.5} />
            {item.user.name}
          </p>

          <div className="flex items-center justify-between">
            <StatusBadge status={item.status} />
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
  const [searchQuery, setSearchQuery] = useState('');
  const [filterKategoriId, setFilterKategoriId] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [kategoriList, setKategoriList] = useState<KategoriItem[]>([]);
  const [isKategoriLoading, setIsKategoriLoading] = useState(true);
  const kategoriScrollRef = useRef<HTMLDivElement>(null);

  // Pakai hook useDebounce — tidak perlu kelola timer secara manual
  const debouncedSearch = useDebounce(searchQuery, 400);

  // Fetch daftar kategori
  useEffect(() => {
    fetch('/api/kategori')
      .then(r => r.json())
      .then((data: KategoriItem[]) => setKategoriList(data))
      .catch(() => {})
      .finally(() => setIsKategoriLoading(false));
  }, []);

  const { laporan: rawLaporan, isLoading, error, refetch } = useLaporanMap({
    adminView: true,
    search: debouncedSearch || undefined,
    kategoriId: filterKategoriId || undefined,
  });
  const laporan = rawLaporan as LaporanAdminMapItem[];

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [statusOverrides, setStatusOverrides] = useState<Record<string, LaporanAdminMapItem['status']>>({});

  const handleStatusUpdate = useCallback(
    (id: string, newStatus: LaporanAdminMapItem['status']) => {
      setStatusOverrides((prev) => ({ ...prev, [id]: newStatus }));
    },
    []
  );

  const displayLaporan = laporan.map((l) =>
    statusOverrides[l.id] ? { ...l, status: statusOverrides[l.id] } : l
  );

  // Filter status dilakukan di client (tidak perlu re-fetch)
  const filteredLaporan = filterStatus
    ? displayLaporan.filter((l) => l.status === filterStatus)
    : displayLaporan;

  const stats = {
    total: displayLaporan.length,
    menunggu: displayLaporan.filter((l) => l.status === 'MENUNGGU').length,
    diproses: displayLaporan.filter((l) => l.status === 'DIPROSES').length,
    selesai: displayLaporan.filter((l) => l.status === 'SELESAI').length,
    urgent: displayLaporan.filter(
      (l) =>
        l.status !== 'SELESAI' &&
        (l.prioritas ||
          calculatePriorityScore(l.voteCount, l.createdAt) >= PRIORITY_THRESHOLD)
    ).length,
  };

  const handleMarkerClick = (id: string) => {
    setSelectedId(id);
    if (!isPanelOpen) setIsPanelOpen(true);
    document.getElementById(`admin-card-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const hasActiveFilters = !!debouncedSearch || !!filterKategoriId || !!filterStatus;

  const clearAllFilters = () => {
    setSearchQuery('');
    setFilterKategoriId('');
    setFilterStatus('');
  };

  return (
    <div className="flex h-screen relative overflow-hidden bg-surface">

      {/* ── Panel Kiri Admin ───────────────────────────────────────────── */}
      <aside className={`flex flex-col bg-surface-container-lowest shadow-ambient transition-all duration-300 z-10 border-r border-[rgba(169,180,185,0.15)] ${isPanelOpen ? 'w-80 xl:w-96' : 'w-0'} overflow-hidden flex-shrink-0`}>
        <div className="flex-shrink-0 p-4 space-y-3">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-semibold text-on-surface text-base">Peta Laporan</h2>
              <p className="text-xs text-[#677177] mt-0.5">
                {isLoading ? 'Memuat...' : `${filteredLaporan.length} dari ${stats.total} laporan`}
              </p>
            </div>
            <button 
              onClick={refetch} 
              className="p-1.5 rounded-lg hover:bg-surface-container-low text-[#677177] hover:text-on-surface transition-colors" 
              title="Refresh data laporan"
              aria-label="Refresh data laporan"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} strokeWidth={1.5} />
            </button>
          </div>

          {/* ── Search ── */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a969c]" strokeWidth={1.5} />
            <input
              type="text"
              placeholder="Cari judul atau pelapor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-surface-container-low text-sm text-on-surface placeholder-[#8a969c] outline-none focus:ring-1 focus:ring-primary transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8a969c] hover:text-on-surface"
                aria-label="Hapus pencarian"
                title="Hapus pencarian"
              >
                <X className="w-3.5 h-3.5" strokeWidth={2} />
              </button>
            )}
          </div>

          {/* ── Filter Kategori ── */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#677177] mb-1.5">Kategori</p>
            {isKategoriLoading ? (
              <p className="text-xs text-[#677177]">Memuat kategori...</p>
            ) : (
              <div className="relative flex items-center gap-1">
                {/* Tombol Geser Kiri */}
                <button
                  onClick={() => kategoriScrollRef.current?.scrollBy({ left: -120, behavior: 'smooth' })}
                  className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-surface-container-low hover:bg-surface-container-high text-[#677177] hover:text-on-surface transition-colors"
                  aria-label="Geser kategori ke kiri"
                  title="Geser ke kiri"
                >
                  <ChevronLeftIcon className="w-3.5 h-3.5" strokeWidth={2} />
                </button>

                {/* Scrollable Chips */}
                <div
                  ref={kategoriScrollRef}
                  className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide flex-1"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  <button
                    onClick={() => setFilterKategoriId('')}
                    className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                      filterKategoriId === ''
                        ? 'bg-primary text-white'
                        : 'bg-surface-container-low text-[#677177] hover:bg-surface-container-high'
                    }`}
                  >
                    Semua
                  </button>
                  {kategoriList.map((kat) => (
                    <button
                      key={kat.id}
                      onClick={() => setFilterKategoriId(filterKategoriId === kat.id ? '' : kat.id)}
                      className={`shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                        filterKategoriId === kat.id
                          ? 'bg-primary text-white'
                          : 'bg-surface-container-low text-[#677177] hover:bg-surface-container-high'
                      }`}
                    >
                      <DynamicIcon iconName={kat.icon} className="w-3 h-3" strokeWidth={1.5} />
                      {kat.nama}
                    </button>
                  ))}
                </div>

                {/* Tombol Geser Kanan */}
                <button
                  onClick={() => kategoriScrollRef.current?.scrollBy({ left: 120, behavior: 'smooth' })}
                  className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-surface-container-low hover:bg-surface-container-high text-[#677177] hover:text-on-surface transition-colors"
                >
                  <ChevronRightIcon className="w-3.5 h-3.5" strokeWidth={2} />
                </button>
              </div>
            )}
          </div>

          {/* ── Filter Status ── */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#677177] mb-1.5">Status</p>
            <div className="grid grid-cols-3 gap-2">
              {([['MENUNGGU', stats.menunggu], ['DIPROSES', stats.diproses], ['SELESAI', stats.selesai]] as const).map(([status, count]) => {
                const cfg = STATUS_CONFIG[status];
                const isActive = filterStatus === status;
                return (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(isActive ? '' : status)}
                    className={`text-center py-2 px-1 rounded-xl transition-all ${
                      isActive
                        ? 'ring-2 ring-offset-1 ring-primary bg-primary/5'
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
          </div>

          {/* Indikator Darurat */}
          {stats.urgent > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-red-50 rounded-xl border border-red-100">
              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" strokeWidth={2} />
              <p className="text-xs text-red-700 font-medium">
                {stats.urgent} laporan darurat menunggu tindakan
              </p>
            </div>
          )}

          {/* Clear All Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-primary bg-primary/5 hover:bg-primary/10 transition-colors"
            >
              <X className="w-3.5 h-3.5" strokeWidth={2} />
              Hapus Semua Filter
            </button>
          )}
        </div>

        {/* Daftar Laporan */}
        <div className="flex-1 overflow-y-auto px-4 pb-24 sm:pb-4 space-y-2 border-t border-[rgba(169,180,185,0.1)] pt-3">
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
          {!isLoading && filteredLaporan.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-12 text-[#677177]">
              <Filter className="w-8 h-8 opacity-30" strokeWidth={1} />
              <p className="text-sm text-center">Tidak ada laporan yang cocok</p>
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
        aria-label={isPanelOpen ? 'Tutup panel daftar laporan' : 'Buka panel daftar laporan'}
        aria-expanded={isPanelOpen}
        title={isPanelOpen ? 'Tutup panel' : 'Buka panel'}
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

        {/* Legenda — z-[5] agar bisa tertutup sidebar jika layar tidak cukup */}
        <div className="absolute top-4 right-4 z-[5] bg-surface-container-lowest border border-[rgba(169,180,185,0.2)] rounded-xl p-3 shadow-ambient space-y-1.5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#677177] mb-2">
            Status Laporan
          </p>
          
          {/* Prioritas Darurat - Ditampilkan pertama */}
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: '#dc2626' }} />
            <span className="text-xs text-on-surface font-semibold">Prioritas Darurat</span>
          </div>
          
          <div className="border-t border-[rgba(169,180,185,0.1)] my-1.5" />
          
          {/* Status Normal */}
          {(Object.entries(STATUS_CONFIG) as [keyof typeof STATUS_CONFIG, typeof STATUS_CONFIG[keyof typeof STATUS_CONFIG]][]).map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cfg.color }} />
              <span className="text-xs text-on-surface">{cfg.label}</span>
            </div>
          ))}
          
          <div className="border-t border-[rgba(169,180,185,0.1)] mt-2 pt-2">
            <p className="text-[9px] text-[#8a969c] leading-tight">
              Prioritas: Skor ≥50
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
