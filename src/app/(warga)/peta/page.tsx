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
<<<<<<< Updated upstream
      className={`w-full text-left p-3 rounded-lg transition-all ${
        isSelected
          ? 'bg-primary/10 ring-1 ring-primary'
          : 'hover:bg-surface-container-high'
      }`}
=======
      className={`flex-shrink-0 h-9 px-4 rounded-full text-sm font-medium transition-all duration-150 shadow-sm whitespace-nowrap bg-surface-container-lowest ${isActive
          ? color ? 'border-2' : 'border-2 border-primary text-primary'
          : 'border border-[rgba(169,180,185,0.2)] text-[#677177] hover:bg-surface-container-low hover:text-on-surface'
        }`}
      style={isActive && color ? { borderColor: color, color } : undefined}
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
// ─── Halaman Peta ─────────────────────────────────────────────────────────────
=======
// ─── Definisi filter status ──────────────────────────────────────────────────
const STATUS_FILTERS = [
  { value: '', label: 'Semua Status' },
  { value: 'MENUNGGU', label: 'Menunggu', color: STATUS_CONFIG.MENUNGGU.color },
  { value: 'DIPROSES', label: 'Diproses', color: STATUS_CONFIG.DIPROSES.color },
  { value: 'SELESAI', label: 'Selesai', color: STATUS_CONFIG.SELESAI.color },
] as const;

// ─── User Profile Button ─────────────────────────────────────────────────────
function ProfileButton({ isMobile = false }: { isMobile?: boolean }) {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`rounded-full bg-primary/15 flex items-center justify-center text-primary transition-colors hover:bg-primary/20 ${isMobile ? 'w-8 h-8' : 'w-10 h-10'
          }`}
        title={session?.user?.name || 'Profil'}
      >
        <User className={isMobile ? 'w-4 h-4' : 'w-5 h-5'} strokeWidth={1.5} />
      </button>

      {isOpen && (
        <div className={`absolute z-[9999] bg-surface-container-lowest rounded-xl shadow-ambient border border-[rgba(169,180,185,0.15)] overflow-hidden w-48 ${isMobile ? 'right-0 top-full mt-3' : 'right-0 top-full mt-3'
          }`}>
          <div className="px-3 py-2.5 border-b border-[rgba(169,180,185,0.12)]">
            <p className="text-xs text-[#677177]">Masuk sebagai</p>
            <p className="text-sm font-semibold text-on-surface truncate">
              {session?.user?.name}
            </p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-error hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" strokeWidth={1.5} />
            Keluar
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Halaman Peta Utama ──────────────────────────────────────────────────────
>>>>>>> Stashed changes
export default function PetaPage() {
  const { laporan, isLoading, error, refetch } = useLaporanMap();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(true);

<<<<<<< Updated upstream
  // Statistik ringkas untuk header panel
  const stats = {
    total: laporan.length,
    menunggu: laporan.filter((l) => l.status === 'MENUNGGU').length,
    diproses: laporan.filter((l) => l.status === 'DIPROSES').length,
    selesai: laporan.filter((l) => l.status === 'SELESAI').length,
=======
  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setSearchTerm(searchInput), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch kategori
  useEffect(() => {
    fetch('/api/kategori')
      .then((r) => r.json())
      .then((data: KategoriItem[]) => setKategoriList(data))
      .catch(() => { });
  }, []);

  // Hook Laporan
  const { laporan } = useLaporanMap({
    search: searchTerm || undefined,
    kategoriId: selectedKategoriId || undefined,
    status: selectedStatus || undefined,
  });

  const handleMarkerClick = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  const clearSearch = () => {
    setSearchInput('');
    setSearchTerm('');
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
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
=======
    <div className="flex flex-col h-screen relative overflow-hidden bg-surface">
      <div className="flex-1 relative">

        {/* ── Google Maps Style Overlay ────────────────────────────────────── */}
        <div className="absolute top-4 left-2 right-2 sm:top-6 sm:left-6 sm:right-6 z-[999] flex flex-col sm:flex-row gap-3 pointer-events-none items-start">

          {/* ── Left Block: Search & Filters ── */}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto items-start">

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Back Button (Terpisah) */}
              <button
                onClick={() => router.push('/beranda')}
                className="w-12 h-12 flex-shrink-0 shadow-[0_8px_30px_rgba(42,52,57,0.12)] rounded-full bg-surface-container-lowest border border-[rgba(169,180,185,0.15)] flex items-center justify-center pointer-events-auto text-[#677177] hover:bg-surface-container-low hover:text-on-surface transition-colors"
                title="Kembali ke Dashboard"
              >
                <ArrowLeft className="w-5 h-5" strokeWidth={2} />
              </button>

              {/* Search Bar Container */}
              <div className="flex-1 sm:w-[340px] z-50 h-12 shadow-[0_8px_30px_rgba(42,52,57,0.12)] rounded-full bg-surface-container-lowest border border-[rgba(169,180,185,0.15)] flex items-center pointer-events-auto shrink-0 relative">

                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Cari masalah..."
                  className="w-full bg-transparent text-sm font-medium pl-5 pr-2 text-on-surface placeholder:text-[#a9b4b9] focus:outline-none min-w-0"
                />

                {/* Search Icon / Clear */}
                {isSearchActive ? (
                  <button onClick={clearSearch} className="px-3 text-[#8a969c] hover:text-error transition-colors">
                    <X className="w-5 h-5" strokeWidth={2} />
                  </button>
                ) : (
                  <div className="px-4 text-[#677177]">
                    <Search className="w-5 h-5" strokeWidth={2} />
                  </div>
                )}
              </div>

              {/* Mobile Right: Profile & Notif (SEPARATE from search box) */}
              <div className="sm:hidden h-12 z-50 flex-shrink-0 flex items-center px-1.5 gap-1 rounded-full bg-surface-container-lowest shadow-[0_8px_30px_rgba(42,52,57,0.12)] border border-[rgba(169,180,185,0.15)] pointer-events-auto">
                <NotificationBell />
                <ProfileButton isMobile={true} />
              </div>
            </div>

            {/* Filters Row (Right of search on Desktop, below on Mobile) */}
            <div className="flex items-center gap-2 overflow-x-auto sm:overflow-visible sm:flex-wrap pb-1 sm:pb-0 sm:pt-1.5 [&::-webkit-scrollbar]:hidden pointer-events-auto w-full sm:w-auto">
              {/* Status Filters */}
              {STATUS_FILTERS.map((filter) => (
                <FilterChip
                  key={filter.value}
                  label={filter.label}
                  isActive={selectedStatus === filter.value}
                  onClick={() => setSelectedStatus(filter.value)}
                  color={'color' in filter ? filter.color : undefined}
                />
              ))}

              {/* Kategori Button */}
              <button
                onClick={() => setIsKategoriModalOpen(true)}
                className={`flex-shrink-0 flex items-center gap-1.5 h-9 px-4 rounded-full text-sm font-medium transition-all duration-150 shadow-sm whitespace-nowrap bg-surface-container-lowest ${selectedKategoriId !== ''
                    ? 'border-2 border-primary text-primary'
                    : 'border border-[rgba(169,180,185,0.2)] text-[#677177] hover:bg-surface-container-low hover:text-on-surface'
                  }`}
              >
                <SlidersHorizontal className="w-4 h-4" strokeWidth={1.5} />
                {selectedKategoriId !== '' ? activeKategoriName : 'Kategori'}
                <ChevronDown className="w-4 h-4 opacity-70" strokeWidth={1.5} />
              </button>
>>>>>>> Stashed changes
            </div>
            <button
              onClick={refetch}
              className="p-1.5 rounded-lg hover:bg-surface-container-low text-[#677177] hover:text-on-surface transition-colors"
              title="Perbarui data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} strokeWidth={1.5} />
            </button>
          </div>

<<<<<<< Updated upstream
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
=======
          {/* ── Desktop Top-Right: User & Notif ── */}
          <div className="hidden sm:flex absolute right-0 top-0 pointer-events-auto items-center">
            <div className="h-12 bg-surface-container-lowest shadow-[0_8px_30px_rgba(42,52,57,0.12)] rounded-full border border-[rgba(169,180,185,0.15)] flex items-center px-1 gap-1">
              <NotificationBell />
              <ProfileButton />
            </div>
          </div>
        </div>

        {/* ── Kategori Popup Modal (Solid Background) ──────────────────────── */}
        {isKategoriModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 px-4">
            {/* Box Solid */}
            <div className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between p-5 border-b border-surface-container-high">
                <h3 className="font-display font-semibold text-on-surface text-lg">Pilih Kategori</h3>
                <button
                  onClick={() => setIsKategoriModalOpen(false)}
                  className="p-1.5 rounded-xl text-[#677177] hover:bg-surface-container-low hover:text-on-surface transition-colors"
                >
                  <X className="w-5 h-5" strokeWidth={2} />
                </button>
              </div>
              <div className="p-3 max-h-[60vh] overflow-y-auto space-y-1">
                <button
                  onClick={() => {
                    setSelectedKategoriId('');
                    setIsKategoriModalOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${selectedKategoriId === '' ? 'text-white bg-primary' : 'text-on-surface hover:bg-surface-container-low'
                    }`}
                >
                  Semua Kategori
                </button>
                {kategoriList.map((kat) => (
                  <button
                    key={kat.id}
                    onClick={() => {
                      setSelectedKategoriId(kat.id);
                      setIsKategoriModalOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${selectedKategoriId === kat.id ? 'text-white bg-primary' : 'text-on-surface hover:bg-surface-container-low'
                      }`}
                  >
                    <DynamicIcon iconName={kat.icon} className={`w-5 h-5 ${selectedKategoriId === kat.id ? 'text-white' : 'text-[#677177]'}`} strokeWidth={1.5} />
                    {kat.nama}
                  </button>
                ))}
              </div>
>>>>>>> Stashed changes
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
