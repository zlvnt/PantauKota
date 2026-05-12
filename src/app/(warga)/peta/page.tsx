'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from '@/hooks/useAuthSession';
import { useLaporanMap } from '@/hooks/useLaporanMap';
import { STATUS_CONFIG } from '@/types/laporan';
import type { KategoriItem } from '@/types/laporan';
import NotificationBell from '@/components/NotificationBell';
import {
  Loader2,
  Search,
  X,
  SlidersHorizontal,
  ChevronDown,
  ArrowLeft,
  User,
  LogOut,
} from 'lucide-react';
import { DynamicIcon } from '@/components/ui/DynamicIcon';

// Dynamic import — Leaflet tidak bisa di-render di server
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

// ─── Chip filter ─────────────────────────────────────────────────────────────
function FilterChip({
  label,
  isActive,
  onClick,
  color,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
  color?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 h-9 px-4 rounded-full text-sm font-medium transition-all duration-150 shadow-sm whitespace-nowrap bg-surface-container-lowest ${
        isActive
          ? color ? 'border-2' : 'border-2 border-primary text-primary'
          : 'border border-[rgba(169,180,185,0.2)] text-[#677177] hover:bg-surface-container-low hover:text-on-surface'
      }`}
      style={isActive && color ? { borderColor: color, color } : undefined}
    >
      {label}
    </button>
  );
}

// ─── Definisi filter status ──────────────────────────────────────────────────
const STATUS_FILTERS = [
  { value: '', label: 'Semua Status' },
  { value: 'MENUNGGU', label: 'Menunggu', color: STATUS_CONFIG.MENUNGGU.color },
  { value: 'DIPROSES', label: 'Diproses', color: STATUS_CONFIG.DIPROSES.color },
  { value: 'SELESAI',  label: 'Selesai',  color: STATUS_CONFIG.SELESAI.color },
] as const;

// ─── User Profile Button ─────────────────────────────────────────────────────
function ProfileButton({ isMobile = false }: { isMobile?: boolean }) {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`rounded-full bg-primary/15 flex items-center justify-center text-primary transition-colors hover:bg-primary/20 ${
          isMobile ? 'w-8 h-8' : 'w-10 h-10'
        }`}
        title={session?.user?.name || 'Profil'}
        aria-label={`Menu profil ${session?.user?.name ?? 'pengguna'}`}
        aria-expanded={isOpen}
      >
        <User className={isMobile ? 'w-4 h-4' : 'w-5 h-5'} strokeWidth={1.5} />
      </button>

      {isOpen && (
        <div className={`absolute z-[9999] bg-surface-container-lowest rounded-xl shadow-ambient border border-[rgba(169,180,185,0.15)] overflow-hidden w-48 ${
          isMobile ? 'right-0 top-full mt-3' : 'right-0 top-full mt-3'
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
export default function PetaPage() {
  const router = useRouter();

  // Filter & search state
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKategoriId, setSelectedKategoriId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Kategori
  const [kategoriList, setKategoriList] = useState<KategoriItem[]>([]);
  const [isKategoriModalOpen, setIsKategoriModalOpen] = useState(false);

  // State peta
  const [selectedId, setSelectedId] = useState<string | null>(null);

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
      .catch(() => {});
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
  };

  const isSearchActive = searchInput.trim().length > 0;
  const activeKategoriName = kategoriList.find(k => k.id === selectedKategoriId)?.nama || 'Kategori';

  return (
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
                aria-label="Kembali ke Dashboard"
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
                  <button 
                    onClick={clearSearch} 
                    className="px-3 text-[#8a969c] hover:text-error transition-colors"
                    aria-label="Hapus pencarian"
                    title="Hapus pencarian"
                  >
                    <X className="w-5 h-5" strokeWidth={2} />
                  </button>
                ) : (
                  <div className="px-4 text-[#677177]" aria-hidden="true">
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
                className={`flex-shrink-0 flex items-center gap-1.5 h-9 px-4 rounded-full text-sm font-medium transition-all duration-150 shadow-sm whitespace-nowrap bg-surface-container-lowest ${
                  selectedKategoriId !== ''
                    ? 'border-2 border-primary text-primary'
                    : 'border border-[rgba(169,180,185,0.2)] text-[#677177] hover:bg-surface-container-low hover:text-on-surface'
                }`}
                aria-label="Filter berdasarkan kategori"
                title="Filter berdasarkan kategori"
              >
                <SlidersHorizontal className="w-4 h-4" strokeWidth={1.5} />
                {selectedKategoriId !== '' ? activeKategoriName : 'Kategori'}
                <ChevronDown className="w-4 h-4 opacity-70" strokeWidth={1.5} />
              </button>
            </div>
          </div>

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
                  aria-label="Tutup modal kategori"
                  title="Tutup"
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
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                    selectedKategoriId === '' ? 'text-white bg-primary' : 'text-on-surface hover:bg-surface-container-low'
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
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                      selectedKategoriId === kat.id ? 'text-white bg-primary' : 'text-on-surface hover:bg-surface-container-low'
                    }`}
                  >
                    <DynamicIcon iconName={kat.icon} className={`w-5 h-5 ${selectedKategoriId === kat.id ? 'text-white' : 'text-[#677177]'}`} strokeWidth={1.5} />
                    {kat.nama}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Peta Utama ──────────────────────────────────────────────────── */}
        <MapView
          laporan={laporan}
          selectedId={selectedId}
          onMarkerClick={handleMarkerClick}
        />

        {/* Legenda Status */}
        <div className="absolute bottom-6 right-4 z-[990] bg-surface-container-lowest border border-[rgba(169,180,185,0.2)] rounded-xl p-3 shadow-ambient space-y-1.5 pointer-events-auto hidden sm:block">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#677177] mb-2">
            Status
          </p>
          
          {/* Prioritas Darurat - Ditampilkan pertama */}
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: '#dc2626' }} />
            <span className="text-xs text-on-surface font-semibold">Prioritas Darurat</span>
          </div>
          
          <div className="border-t border-[rgba(169,180,185,0.1)] my-1.5" />
          
          {/* Status Normal */}
          {(Object.entries(STATUS_CONFIG) as [keyof typeof STATUS_CONFIG, typeof STATUS_CONFIG[keyof typeof STATUS_CONFIG]][]).map(
            ([key, cfg]) => (
              <div key={key} className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: cfg.color }}
                />
                <span className="text-xs text-on-surface font-medium">{cfg.label}</span>
              </div>
            )
          )}
          
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
