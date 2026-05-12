'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Filter,
  ArrowUpDown,
  Eye,
  Flame,
  ThumbsUp,
  MessageCircle,
  Calendar,
  User,
  MapPin,
  SlidersHorizontal,
  ChevronDown,
  X,
} from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import StatusBadge from '@/components/ui/Badge';
import { DynamicIcon } from '@/components/ui/DynamicIcon';
import Spinner from '@/components/ui/Spinner';
import { CLOUDINARY_THUMBNAIL_IMAGE_OPTIONS, getCloudinaryImageUrl } from '@/lib/cloudinary';
import type { LaporanAdminMapItem, KategoriItem } from '@/types/laporan';

export default function KelolaLaporanPage() {
  const router = useRouter();
  const [laporan, setLaporan] = useState<LaporanAdminMapItem[]>([]);
  const [kategori, setKategori] = useState<KategoriItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedKategori, setSelectedKategori] = useState<string>('');
  const [sortBy, setSortBy] = useState<'terbaru' | 'prioritas' | 'vote'>('terbaru');

  // Modal states
  const [isKategoriModalOpen, setIsKategoriModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 400);

  // Fetch kategori
  useEffect(() => {
    fetch('/api/kategori?all=true')
      .then((res) => res.json())
      .then((data) => setKategori(data))
      .catch(console.error);
  }, []);

  // Fetch laporan
  useEffect(() => {
    setIsLoading(true);
    const params = new URLSearchParams();
    params.set('adminView', 'true');
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (selectedStatus) params.set('status', selectedStatus);
    if (selectedKategori) params.set('kategoriId', selectedKategori);

    fetch(`/api/laporan?${params}`)
      .then((res) => res.json())
      .then((data) => {
        setLaporan(Array.isArray(data) ? data : data.laporan ?? []);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  }, [debouncedSearch, selectedStatus, selectedKategori]);

  // Sort laporan
  const sortedLaporan = [...laporan].sort((a, b) => {
    if (sortBy === 'prioritas') {
      if (a.prioritas !== b.prioritas) return a.prioritas ? -1 : 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortBy === 'vote') {
      return b.voteCount - a.voteCount;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  const clearSearch = () => setSearchQuery('');
  const isSearchActive = searchQuery.trim().length > 0;
  const activeKategoriName = kategori.find(k => k.id === selectedKategori)?.nama || 'Kategori';
  
  const statusOptions = [
    { value: '', label: 'Semua Status' },
    { value: 'MENUNGGU', label: 'Menunggu' },
    { value: 'DIPROSES', label: 'Diproses' },
    { value: 'SELESAI', label: 'Selesai' },
  ];
  
  const sortOptions = [
    { value: 'terbaru', label: 'Terbaru' },
    { value: 'prioritas', label: 'Prioritas' },
    { value: 'vote', label: 'Vote Terbanyak' },
  ];
  
  const activeStatusLabel = statusOptions.find(s => s.value === selectedStatus)?.label || 'Status';
  const activeSortLabel = sortOptions.find(s => s.value === sortBy)?.label || 'Urutkan';

  return (
    <div className="w-full min-h-screen overflow-x-hidden bg-surface">
      <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface mb-2">
            Kelola Laporan
          </h1>
          <p className="text-sm sm:text-base text-on-surface/60">
            Tinjau dan kelola semua laporan masuk dari warga
          </p>
        </div>

        {/* Filters - Modern Layout */}
        <div className="bg-surface-container-lowest rounded-2xl shadow-ambient p-4 sm:p-6 mb-6 space-y-4">
          
          {/* Search Bar */}
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface/40"
              strokeWidth={1.5}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari laporan..."
              className="w-full pl-12 pr-12 py-3.5 bg-surface-container-low rounded-xl border border-outline-variant/15 focus:border-primary focus:outline-none text-sm text-on-surface placeholder:text-on-surface/40"
            />
            {isSearchActive && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-on-surface/40 hover:text-error transition-colors"
              >
                <X className="w-5 h-5" strokeWidth={2} />
              </button>
            )}
          </div>

          {/* Filter Buttons Row - Horizontal on Mobile */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
            {/* Status Button */}
            <button
              onClick={() => setIsStatusModalOpen(true)}
              className={`flex-shrink-0 flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                selectedStatus
                  ? 'bg-primary/10 border-primary text-primary'
                  : 'bg-surface-container-low border-outline-variant/15 text-on-surface hover:bg-surface-container-high'
              }`}
            >
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" strokeWidth={1.5} />
                <span className="whitespace-nowrap">{activeStatusLabel}</span>
              </div>
              <ChevronDown className="w-4 h-4 opacity-70" strokeWidth={1.5} />
            </button>

            {/* Kategori Button */}
            <button
              onClick={() => setIsKategoriModalOpen(true)}
              className={`flex-shrink-0 flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                selectedKategori
                  ? 'bg-primary/10 border-primary text-primary'
                  : 'bg-surface-container-low border-outline-variant/15 text-on-surface hover:bg-surface-container-high'
              }`}
            >
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4" strokeWidth={1.5} />
                <span className="whitespace-nowrap">{selectedKategori ? activeKategoriName : 'Kategori'}</span>
              </div>
              <ChevronDown className="w-4 h-4 opacity-70" strokeWidth={1.5} />
            </button>

            {/* Sort Button */}
            <button
              onClick={() => setIsSortModalOpen(true)}
              className="flex-shrink-0 flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border bg-surface-container-low border-outline-variant/15 text-on-surface hover:bg-surface-container-high"
            >
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4" strokeWidth={1.5} />
                <span className="whitespace-nowrap">{activeSortLabel}</span>
              </div>
              <ChevronDown className="w-4 h-4 opacity-70" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Status Modal Popup */}
        {isStatusModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 px-4">
            <div className="bg-surface-container-lowest rounded-2xl shadow-ambient w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between p-5 bg-surface-container-low">
                <h3 className="font-display font-semibold text-on-surface text-lg">Pilih Status</h3>
                <button
                  onClick={() => setIsStatusModalOpen(false)}
                  className="p-1.5 rounded-xl text-on-surface/60 hover:bg-surface-container-low hover:text-on-surface transition-colors"
                >
                  <X className="w-5 h-5" strokeWidth={2} />
                </button>
              </div>
              <div className="p-3 space-y-1">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSelectedStatus(option.value);
                      setIsStatusModalOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                      selectedStatus === option.value ? 'text-white bg-primary' : 'text-on-surface hover:bg-surface-container-low'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Kategori Modal Popup */}
        {isKategoriModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 px-4">
            <div className="bg-surface-container-lowest rounded-2xl shadow-ambient w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between p-5 bg-surface-container-low">
                <h3 className="font-display font-semibold text-on-surface text-lg">Pilih Kategori</h3>
                <button
                  onClick={() => setIsKategoriModalOpen(false)}
                  className="p-1.5 rounded-xl text-on-surface/60 hover:bg-surface-container-low hover:text-on-surface transition-colors"
                >
                  <X className="w-5 h-5" strokeWidth={2} />
                </button>
              </div>
              <div className="p-3 max-h-[60vh] overflow-y-auto space-y-1">
                <button
                  onClick={() => {
                    setSelectedKategori('');
                    setIsKategoriModalOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                    selectedKategori === '' ? 'text-white bg-primary' : 'text-on-surface hover:bg-surface-container-low'
                  }`}
                >
                  Semua Kategori
                </button>
                {kategori.map((kat) => (
                  <button
                    key={kat.id}
                    onClick={() => {
                      setSelectedKategori(kat.id);
                      setIsKategoriModalOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                      selectedKategori === kat.id ? 'text-white bg-primary' : 'text-on-surface hover:bg-surface-container-low'
                    }`}
                  >
                    <DynamicIcon 
                      iconName={kat.icon} 
                      className={`w-5 h-5 ${selectedKategori === kat.id ? 'text-white' : 'text-on-surface/60'}`} 
                      strokeWidth={1.5} 
                    />
                    {kat.nama}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Sort Modal Popup */}
        {isSortModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 px-4">
            <div className="bg-surface-container-lowest rounded-2xl shadow-ambient w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between p-5 bg-surface-container-low">
                <h3 className="font-display font-semibold text-on-surface text-lg">Urutkan Berdasarkan</h3>
                <button
                  onClick={() => setIsSortModalOpen(false)}
                  className="p-1.5 rounded-xl text-on-surface/60 hover:bg-surface-container-low hover:text-on-surface transition-colors"
                >
                  <X className="w-5 h-5" strokeWidth={2} />
                </button>
              </div>
              <div className="p-3 space-y-1">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSortBy(option.value as 'terbaru' | 'prioritas' | 'vote');
                      setIsSortModalOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                      sortBy === option.value ? 'text-white bg-primary' : 'text-on-surface hover:bg-surface-container-low'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="mb-4 text-sm text-on-surface/60">
          Menampilkan {sortedLaporan.length} laporan
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && sortedLaporan.length === 0 && (
          <div className="bg-surface-container-lowest rounded-2xl shadow-ambient p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-surface-container-low rounded-full flex items-center justify-center">
              <Search className="w-8 h-8 text-on-surface/40" strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-semibold text-on-surface mb-2">
              Tidak ada laporan ditemukan
            </h3>
            <p className="text-sm text-on-surface/60">
              Coba ubah filter atau kata kunci pencarian
            </p>
          </div>
        )}

        {/* Laporan List */}
        {!isLoading && sortedLaporan.length > 0 && (
          <div className="space-y-4">
            {sortedLaporan.map((item) => (
              <div
                key={item.id}
                onClick={() => router.push(`/dashboard/laporan/${item.id}`)}
                className="bg-surface-container-lowest rounded-2xl shadow-ambient hover:bg-surface-container-low transition-all cursor-pointer overflow-hidden"
              >
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Thumbnail */}
                    {item.foto && item.foto.length > 0 ? (
                      <div className="relative w-full sm:w-32 h-32 sm:h-24 flex-shrink-0 rounded-xl overflow-hidden bg-surface-container-low">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={getCloudinaryImageUrl(item.foto[0], CLOUDINARY_THUMBNAIL_IMAGE_OPTIONS)}
                          alt={item.judul}
                          className="w-full h-full object-cover"
                        />
                        {item.foto.length > 1 && (
                          <span className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                            +{item.foto.length - 1}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="w-full sm:w-32 h-32 sm:h-24 flex-shrink-0 rounded-xl bg-gradient-to-br from-surface-container-low to-surface-container-high flex items-center justify-center">
                        <MapPin className="w-8 h-8 text-on-surface/20" strokeWidth={1.5} />
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {item.prioritas && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-error/10 text-error rounded-full text-xs font-bold">
                                <Flame className="w-3 h-3" strokeWidth={2} />
                                PRIORITAS
                              </span>
                            )}
                            <StatusBadge status={item.status} />
                          </div>
                          <h3 className="text-base sm:text-lg font-semibold text-on-surface line-clamp-2 mb-1">
                            {item.judul}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-on-surface/60">
                            <div className="flex items-center gap-1">
                              <DynamicIcon
                                iconName={item.kategori.icon || 'AlertCircle'}
                                className="w-3.5 h-3.5"
                                strokeWidth={1.5}
                              />
                              <span>{item.kategori.nama}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Meta Info */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-on-surface/60">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={1.5} />
                          <span className="truncate">{item.user.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={1.5} />
                          <span>{formatDate(item.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <ThumbsUp className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={1.5} />
                          <span>{item.voteCount} suara</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MessageCircle className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={1.5} />
                          <span>{item._count.komentar} komentar</span>
                        </div>
                      </div>

                      {/* Location */}
                      {item.alamat && (
                        <div className="flex items-start gap-1.5 text-xs text-on-surface/60">
                          <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                          <span className="line-clamp-1">{item.alamat}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="flex sm:flex-col items-center justify-end gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/dashboard/laporan/${item.id}`);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dim text-white rounded-xl text-sm font-semibold transition-colors"
                      >
                        <Eye className="w-4 h-4" strokeWidth={2} />
                        <span className="hidden sm:inline">Detail</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
