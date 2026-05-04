'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  X,
  ArrowLeft,
  Plus,
  FileSearch,
  ChevronLeft,
  ChevronRight,
  MapPin,
  ThumbsUp,
  MessageSquare,
  Calendar,
  Trash2,
} from 'lucide-react';
import { DynamicIcon } from '@/components/ui/DynamicIcon';
import { STATUS_CONFIG } from '@/types/laporan';
import type { LaporanSaya } from '@/types/laporan';

const PAGE_SIZE = 10;

// ─── Format tanggal ─────────────────────────────────────────────────────────
function formatTanggal(isoString: string): string {
  return new Date(isoString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// ─── Filter Status Pill ──────────────────────────────────────────────────────
type FilterStatus = 'SEMUA' | 'MENUNGGU' | 'DIPROSES' | 'SELESAI';
const STATUS_FILTERS: { value: FilterStatus; label: string }[] = [
  { value: 'SEMUA', label: 'Semua' },
  { value: 'MENUNGGU', label: 'Menunggu' },
  { value: 'DIPROSES', label: 'Diproses' },
  { value: 'SELESAI', label: 'Selesai' },
];

// ─── Baris tabel laporan ─────────────────────────────────────────────────────
function LaporanRow({ item }: { item: LaporanSaya }) {
  const cfg = STATUS_CONFIG[item.status];

  // Cek apakah bisa dihapus (< 24 jam dan status MENUNGGU)
  const batasWaktu = new Date(new Date(item.createdAt).getTime() + 24 * 60 * 60 * 1000);
  const bisaDihapus = item.status === 'MENUNGGU' && new Date() < batasWaktu;

  return (
    <div className="group grid grid-cols-[1fr_auto] sm:grid-cols-[auto_1fr_auto_auto] items-center gap-x-4 gap-y-2 p-4 sm:p-5 rounded-2xl bg-surface-container-lowest hover:-translate-y-0.5 shadow-[0_2px_8px_rgba(42,52,57,0.06)] transition-all duration-200">
      {/* Ikon Kategori (hidden pada mobile) */}
      <div className="hidden sm:flex flex-shrink-0 w-10 h-10 rounded-xl bg-surface-container-low items-center justify-center text-[#677177]">
        <DynamicIcon iconName={item.kategori.icon} className="w-5 h-5" strokeWidth={1.5} />
      </div>

      {/* Konten utama */}
      <div className="min-w-0">
        <Link
          href={`/laporan/${item.id}`}
          className="text-sm font-bold text-on-surface hover:text-primary truncate block leading-snug transition-colors"
        >
          {item.judul}
        </Link>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-[#677177]">
            {item.kategori.nama}
          </span>
          {item.alamat && (
            <span className="hidden sm:flex items-center gap-1 text-[11px] text-[#8a969c]">
              <MapPin className="w-3 h-3" strokeWidth={1.5} />
              <span className="truncate max-w-[200px]">{item.alamat}</span>
            </span>
          )}
          <span className="flex items-center gap-1 text-[11px] text-[#8a969c]">
            <Calendar className="w-3 h-3" strokeWidth={1.5} />
            {formatTanggal(item.createdAt)}
          </span>
          <span className="flex items-center gap-1 text-[11px] text-[#8a969c]">
            <ThumbsUp className="w-3 h-3" strokeWidth={1.5} />
            {item.voteCount}
          </span>
          <span className="flex items-center gap-1 text-[11px] text-[#8a969c]">
            <MessageSquare className="w-3 h-3" strokeWidth={1.5} />
            {item._count.komentar}
          </span>
        </div>
      </div>

      {/* Status Badge */}
      <span className={`flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${cfg.bgClass}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotClass}`} />
        {cfg.label}
      </span>

      {/* Aksi */}
      <div className="flex items-center gap-1.5 col-span-2 sm:col-span-1 justify-end">
        <Link
          href={`/laporan/${item.id}`}
          className="px-3 py-1.5 text-xs font-semibold text-primary bg-primary/8 hover:bg-primary/15 rounded-lg transition-colors"
        >
          Detail
        </Link>
        {bisaDihapus && (
          <Link
            href={`/laporan/${item.id}`}
            className="p-1.5 text-error bg-error/8 hover:bg-error/15 rounded-lg transition-colors"
            title="Hapus laporan"
          >
            <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
          </Link>
        )}
      </div>
    </div>
  );
}

// ─── Komponen utama ──────────────────────────────────────────────────────────
interface LaporanSayaClientProps {
  laporan: LaporanSaya[];
  userName: string;
}

export default function LaporanSayaClient({ laporan, userName }: LaporanSayaClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('SEMUA');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let result = laporan;
    if (filterStatus !== 'SEMUA') {
      result = result.filter((l) => l.status === filterStatus);
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (l) =>
          l.judul.toLowerCase().includes(q) ||
          l.kategori.nama.toLowerCase().includes(q) ||
          (l.alamat ?? '').toLowerCase().includes(q)
      );
    }
    return result;
  }, [laporan, searchTerm, filterStatus]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleFilterChange = (status: FilterStatus) => {
    setFilterStatus(status);
    setPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setPage(1);
  };

  const stats = useMemo(() => ({
    total: laporan.length,
    menunggu: laporan.filter((l) => l.status === 'MENUNGGU').length,
    diproses: laporan.filter((l) => l.status === 'DIPROSES').length,
    selesai: laporan.filter((l) => l.status === 'SELESAI').length,
  }), [laporan]);

  return (
    <div className="min-h-screen bg-surface overflow-x-hidden pb-20 sm:pb-8 pt-24">
      {/* Hero Strip */}
      <div className="bg-surface-container-low border-b border-[rgba(169,180,185,0.12)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <div className="flex items-center gap-3 mb-4">
            <Link
              href="/beranda"
              className="w-9 h-9 flex items-center justify-center rounded-full bg-surface-container-lowest hover:bg-surface-container-high text-on-surface shadow-ambient transition-colors"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={2} />
            </Link>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#677177]">
                {userName.split(' ')[0]}
              </p>
              <h1 className="text-2xl sm:text-3xl font-display font-semibold text-on-surface leading-tight">
                Laporan Saya
              </h1>
            </div>
          </div>

          {/* Stat Strip */}
          <div className="grid grid-cols-4 gap-3 mt-6">
            {[
              { label: 'Total', value: stats.total, color: 'text-on-surface' },
              { label: 'Menunggu', value: stats.menunggu, color: 'text-amber-500' },
              { label: 'Diproses', value: stats.diproses, color: 'text-blue-500' },
              { label: 'Selesai', value: stats.selesai, color: 'text-tertiary' },
            ].map((s) => (
              <div key={s.label} className="bg-surface-container-lowest rounded-xl p-3 sm:p-4 shadow-ambient text-center">
                <p className={`text-2xl sm:text-3xl font-display font-bold leading-none ${s.color}`}>
                  {s.value}
                </p>
                <p className="text-[10px] sm:text-[11px] text-[#677177] mt-1.5 font-semibold uppercase tracking-wide">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Toolbar: Search + Filter + Tombol Buat */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a9b4b9]" strokeWidth={1.5} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Cari laporan berdasarkan judul, kategori, alamat..."
              className="w-full pl-10 pr-10 py-2.5 bg-surface-container-lowest border border-[rgba(169,180,185,0.2)] rounded-xl text-sm text-on-surface placeholder:text-[#a9b4b9] focus:outline-none focus:border-primary transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => handleSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-[#8a969c] hover:text-on-surface transition-colors"
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            )}
          </div>

          {/* Tombol Buat Laporan */}
          <Link
            href="/laporan/buat"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-dim text-white text-sm font-semibold rounded-xl transition-colors shadow-ambient whitespace-nowrap"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            Buat Laporan
          </Link>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => handleFilterChange(f.value)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all ${
                filterStatus === f.value
                  ? 'bg-primary text-white shadow-ambient'
                  : 'bg-surface-container-low text-[#677177] hover:bg-surface-container-high'
              }`}
            >
              {f.label}
            </button>
          ))}
          <span className="ml-auto text-xs text-[#8a969c]">
            {filtered.length} laporan
          </span>
        </div>

        {/* Tabel / Daftar Laporan */}
        {laporan.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-20 text-center bg-surface-container-lowest rounded-2xl shadow-ambient">
            <div className="w-16 h-16 rounded-2xl bg-surface-container-low flex items-center justify-center">
              <FileSearch className="w-8 h-8 text-[#a9b4b9]" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-base font-bold text-on-surface">Belum ada laporan</p>
              <p className="text-sm text-[#677177] mt-1">
                Anda belum pernah membuat laporan. Mulailah berkontribusi sekarang!
              </p>
            </div>
            <Link
              href="/laporan/buat"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dim transition-colors shadow-ambient"
            >
              <Plus className="w-4 h-4" strokeWidth={2} />
              Buat Laporan Pertama
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center bg-surface-container-lowest rounded-2xl shadow-ambient">
            <Search className="w-8 h-8 text-[#a9b4b9]" strokeWidth={1.5} />
            <p className="text-sm font-bold text-on-surface">Tidak ada hasil</p>
            <p className="text-xs text-[#677177]">Coba ubah kata kunci atau filter status.</p>
            <button
              onClick={() => { handleSearchChange(''); handleFilterChange('SEMUA'); }}
              className="text-xs font-semibold text-primary hover:text-primary-dim transition-colors"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {paginated.map((item) => (
              <LaporanRow key={item.id} item={item} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-[#677177]">
              Halaman {page} dari {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-surface-container-lowest shadow-ambient hover:bg-surface-container-low disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" strokeWidth={2} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce<(number | '...')[]>((acc, p, i, arr) => {
                  if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('...');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === '...' ? (
                    <span key={`ellipsis-${i}`} className="w-9 text-center text-xs text-[#8a969c]">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p as number)}
                      className={`w-9 h-9 flex items-center justify-center rounded-xl text-xs font-bold transition-colors ${
                        page === p
                          ? 'bg-primary text-white shadow-ambient'
                          : 'bg-surface-container-lowest shadow-ambient hover:bg-surface-container-low text-on-surface'
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-surface-container-lowest shadow-ambient hover:bg-surface-container-low disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
