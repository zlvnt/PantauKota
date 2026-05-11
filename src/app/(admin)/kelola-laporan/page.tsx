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
} from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import StatusBadge from '@/components/ui/Badge';
import { DynamicIcon } from '@/components/ui/DynamicIcon';
import Spinner from '@/components/ui/Spinner';
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

        {/* Filters */}
        <div className="bg-surface-container-lowest rounded-3xl shadow-[0_2px_8px_rgba(42,52,57,0.08)] p-4 sm:p-6 mb-6 space-y-4">
          {/* Search */}
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
              className="w-full pl-12 pr-4 py-3.5 bg-surface-container-low rounded-xl border border-outline-variant/15 focus:border-primary focus:outline-none text-sm text-on-surface placeholder:text-on-surface/40"
            />
          </div>

          {/* Filter Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Status Filter */}
            <div className="relative">
              <Filter
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface/40 pointer-events-none"
                strokeWidth={1.5}
              />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-surface-container-low rounded-xl border border-outline-variant/15 focus:border-primary focus:outline-none text-sm text-on-surface appearance-none cursor-pointer"
              >
                <option value="">Semua Status</option>
                <option value="MENUNGGU">Menunggu</option>
                <option value="DIPROSES">Diproses</option>
                <option value="SELESAI">Selesai</option>
              </select>
            </div>

            {/* Kategori Filter */}
            <div className="relative">
              <Filter
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface/40 pointer-events-none"
                strokeWidth={1.5}
              />
              <select
                value={selectedKategori}
                onChange={(e) => setSelectedKategori(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-surface-container-low rounded-xl border border-outline-variant/15 focus:border-primary focus:outline-none text-sm text-on-surface appearance-none cursor-pointer"
              >
                <option value="">Semua Kategori</option>
                {kategori.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.nama}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="relative">
              <ArrowUpDown
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface/40 pointer-events-none"
                strokeWidth={1.5}
              />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'terbaru' | 'prioritas' | 'vote')}
                className="w-full pl-10 pr-4 py-3 bg-surface-container-low rounded-xl border border-outline-variant/15 focus:border-primary focus:outline-none text-sm text-on-surface appearance-none cursor-pointer"
              >
                <option value="terbaru">Terbaru</option>
                <option value="prioritas">Prioritas</option>
                <option value="vote">Vote Terbanyak</option>
              </select>
            </div>
          </div>
        </div>

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
          <div className="bg-surface-container-lowest rounded-3xl shadow-[0_2px_8px_rgba(42,52,57,0.08)] p-12 text-center">
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
                className="bg-surface-container-lowest rounded-3xl shadow-[0_2px_8px_rgba(42,52,57,0.08)] hover:shadow-[0_4px_16px_rgba(42,52,57,0.12)] transition-all cursor-pointer overflow-hidden"
              >
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Thumbnail */}
                    {item.foto && item.foto.length > 0 ? (
                      <div className="relative w-full sm:w-32 h-32 sm:h-24 flex-shrink-0 rounded-xl overflow-hidden bg-surface-container-low">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.foto[0]}
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
