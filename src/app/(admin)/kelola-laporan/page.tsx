'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  CheckCircle,
  Clock,
  Loader,
  Loader2,
  ExternalLink,
  MapPin,
  MessageCircle,
  ThumbsUp,
  User,
  Flag,
  Flame,
} from 'lucide-react';
import { DynamicIcon } from '@/components/ui/DynamicIcon';
import type { Status } from '@prisma/client';

interface LaporanItem {
  id: string;
  judul: string;
  status: Status;
  prioritas: boolean;
  createdAt: string;
  alamat: string | null;
  voteCount: number;
  foto: string[];
  kategori: { id: string; nama: string; icon: string | null; warna: string | null };
  user: { id: string; name: string };
  _count: { komentar: number };
}

interface KategoriItem {
  id: string;
  nama: string;
}

const STATUS_ACTIONS = [
  { status: 'MENUNGGU' as Status, label: 'Menunggu', icon: Clock, activeClass: 'bg-amber-100 text-amber-800 border-amber-200' },
  { status: 'DIPROSES' as Status, label: 'Diproses', icon: Loader, activeClass: 'bg-blue-100 text-blue-800 border-blue-200' },
  { status: 'SELESAI' as Status, label: 'Selesai', icon: CheckCircle, activeClass: 'bg-tertiary/15 text-tertiary border-tertiary/20' },
];

/** Hitung skor prioritas: (voteCount × 2) + jumlah hari */
function calcPrioritasScore(voteCount: number, createdAt: string): number {
  const days = Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));
  return voteCount * 2 + days;
}

function ScoreBadge({ voteCount, createdAt }: { voteCount: number; createdAt: string }) {
  const score = calcPrioritasScore(voteCount, createdAt);
  let colorClass = 'bg-surface-container-high text-muted-foreground';
  if (score >= 30) colorClass = 'bg-red-100 text-red-700';
  else if (score >= 15) colorClass = 'bg-orange-100 text-orange-700';
  else if (score >= 5) colorClass = 'bg-amber-100 text-amber-700';

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${colorClass}`}
      title={`Skor Prioritas: ${score} — (${voteCount} dukungan × 2) + hari berlalu`}
    >
      <Flame className="w-2.5 h-2.5" />
      {score}
    </span>
  );
}

export default function KelolaLaporanPage() {
  const [laporan, setLaporan] = useState<LaporanItem[]>([]);
  const [kategoriList, setKategoriList] = useState<KategoriItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<Status | 'SEMUA'>('SEMUA');
  const [filterKategori, setFilterKategori] = useState<string>('SEMUA');
  const [showOnlyPrioritas, setShowOnlyPrioritas] = useState(false);

  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [togglingPrioritasId, setTogglingPrioritasId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      query.append('adminView', 'true');
      if (filterStatus !== 'SEMUA') query.append('status', filterStatus);
      if (filterKategori !== 'SEMUA') query.append('kategoriId', filterKategori);
      if (search.trim()) query.append('search', search.trim());

      const [resLaporan, resKategori] = await Promise.all([
        fetch(`/api/laporan?${query.toString()}`),
        fetch('/api/kategori'),
      ]);

      if (resLaporan.ok) setLaporan(await resLaporan.json());
      if (resKategori.ok) setKategoriList(await resKategori.json());
    } catch (error) {
      console.error('Gagal mengambil data:', error);
    } finally {
      setLoading(false);
    }
  }, [search, filterStatus, filterKategori]);

  useEffect(() => {
    const timer = setTimeout(() => { fetchData(); }, 400);
    return () => clearTimeout(timer);
  }, [fetchData]);

  const updateStatus = async (id: string, newStatus: Status) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/laporan/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setLaporan((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
        );
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const togglePrioritas = async (id: string, current: boolean) => {
    setTogglingPrioritasId(id);
    try {
      const res = await fetch(`/api/laporan/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prioritas: !current }),
      });
      if (res.ok) {
        setLaporan((prev) =>
          prev
            .map((item) => (item.id === id ? { ...item, prioritas: !current } : item))
            .sort((a, b) => {
              // Re-sort: prioritas dulu, lalu terbaru
              if (a.prioritas && !b.prioritas) return -1;
              if (!a.prioritas && b.prioritas) return 1;
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            })
        );
      }
    } finally {
      setTogglingPrioritasId(null);
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  // Filter client-side untuk tampilan prioritas saja
  const displayedLaporan = showOnlyPrioritas
    ? laporan.filter((l) => l.prioritas)
    : laporan;

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      <div className="space-y-2">
        <h1 className="text-display-md font-bold font-manrope">Kelola Laporan</h1>
        <p className="text-muted-foreground text-sm">
          Tinjau dan perbarui status laporan warga di sini. Tandai laporan penting sebagai Prioritas.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-surface-container-lowest p-4 rounded-xl shadow-ambient border border-outline-variant/10">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul, deskripsi, atau alamat..."
            className="w-full pl-9 pr-4 py-2.5 bg-surface-container-low rounded-[0.375rem] text-sm text-on-surface outline-none border border-transparent focus:border-primary transition-colors"
          />
        </div>

        <div className="flex gap-3 flex-wrap">
          {/* Filter Status */}
          <div className="relative flex-shrink-0 w-36">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as Status | 'SEMUA')}
              className="w-full pl-8 pr-4 py-2.5 bg-surface-container-low rounded-[0.375rem] text-sm text-on-surface outline-none appearance-none font-medium cursor-pointer"
            >
              <option value="SEMUA">Semua Status</option>
              <option value="MENUNGGU">Menunggu</option>
              <option value="DIPROSES">Diproses</option>
              <option value="SELESAI">Selesai</option>
            </select>
          </div>

          {/* Filter Kategori */}
          <div className="relative flex-shrink-0 w-44">
            <select
              value={filterKategori}
              onChange={(e) => setFilterKategori(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface-container-low rounded-[0.375rem] text-sm text-on-surface outline-none appearance-none font-medium cursor-pointer"
            >
              <option value="SEMUA">Semua Kategori</option>
              {kategoriList.map((kat) => (
                <option key={kat.id} value={kat.id}>{kat.nama}</option>
              ))}
            </select>
          </div>

          {/* Toggle Prioritas Filter */}
          <button
            onClick={() => setShowOnlyPrioritas((prev) => !prev)}
            className={`
              flex items-center gap-2 px-3.5 py-2.5 rounded-[0.375rem] text-sm font-semibold transition-all
              ${showOnlyPrioritas
                ? 'bg-red-500 text-white shadow-sm'
                : 'bg-surface-container-low text-muted-foreground hover:bg-surface-container-high'
              }
            `}
          >
            <Flag className="w-3.5 h-3.5" />
            Prioritas
          </button>
        </div>
      </div>

      {/* Keterangan jumlah */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground font-medium">
          {displayedLaporan.length} laporan ditemukan
          {showOnlyPrioritas && ' • Hanya prioritas'}
        </p>
        <p className="text-xs text-muted-foreground hidden sm:block">
          <Flame className="w-3 h-3 inline mr-1 text-orange-500" />
          Skor = (dukungan × 2) + hari berlalu
        </p>
      </div>

      {/* List Laporan */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : displayedLaporan.length === 0 ? (
          <div className="py-12 bg-surface-container-lowest rounded-xl text-center border border-dashed border-outline-variant/30">
            <p className="text-muted-foreground text-sm">Tidak ada laporan yang sesuai kriteria.</p>
          </div>
        ) : (
          displayedLaporan.map((item) => (
            <div
              key={item.id}
              className={`
                relative bg-surface-container-lowest rounded-xl p-5
                shadow-[0_8px_30px_rgba(42,52,57,0.04)]
                hover:-translate-y-0.5 transition-transform duration-300
                ${item.prioritas ? 'border-l-4 border-l-red-500' : ''}
              `}
            >
              {/* Badge Prioritas */}
              {item.prioritas && (
                <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-red-50 text-red-600 border border-red-100 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide">
                  <Flag className="w-2.5 h-2.5 fill-red-500" />
                  Prioritas
                </div>
              )}

              <div className="flex flex-col lg:flex-row gap-6">

                {/* Bagian Info Laporan */}
                <div className="flex-1 min-w-0 flex items-start gap-4">
                  <div className="w-10 h-10 flex-shrink-0 bg-surface-container-low rounded-[0.375rem] flex items-center justify-center text-muted-foreground">
                    <DynamicIcon iconName={item.kategori.icon} className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0 space-y-2">
                    <div>
                      <h3 className="font-bold text-on-surface font-sans text-base leading-snug truncate pr-20">
                        {item.judul}
                      </h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground font-medium flex-wrap">
                        <span className="flex items-center gap-1.5 bg-surface-container-low px-2 py-0.5 rounded-full text-on-surface">
                          <User className="w-3 h-3" /> {item.user.name}
                        </span>
                        <span>{formatDate(item.createdAt)}</span>
                        <span>•</span>
                        <span>{item.kategori.nama}</span>
                        {/* Skor prioritas otomatis */}
                        <ScoreBadge voteCount={item.voteCount} createdAt={item.createdAt} />
                      </div>
                    </div>

                    {item.alamat && (
                      <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                        <span className="line-clamp-1">{item.alamat}</span>
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground pt-1">
                      <span className="flex items-center gap-1.5">
                        <ThumbsUp className="w-3.5 h-3.5" /> {item.voteCount} dukungan
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MessageCircle className="w-3.5 h-3.5" /> {item._count.komentar} komentar
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bagian Aksi */}
                <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-4 lg:gap-3 pl-0 lg:pl-6 border-t lg:border-t-0 lg:border-l border-surface-container-low pt-4 lg:pt-0 shrink-0">

                  {/* Toggle Prioritas */}
                  <button
                    onClick={() => togglePrioritas(item.id, item.prioritas)}
                    disabled={togglingPrioritasId === item.id}
                    className={`
                      flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border
                      ${item.prioritas
                        ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                        : 'bg-surface-container-low text-muted-foreground border-transparent hover:bg-surface-container-high hover:text-on-surface'
                      }
                      ${togglingPrioritasId === item.id ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                    title={item.prioritas ? 'Hapus dari prioritas' : 'Tandai sebagai prioritas'}
                  >
                    {togglingPrioritasId === item.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Flag className={`w-3 h-3 ${item.prioritas ? 'fill-red-500' : ''}`} />
                    )}
                    {item.prioritas ? 'Prioritas' : 'Tandai'}
                  </button>

                  {/* Ubah Status */}
                  <div className="space-y-1 w-full lg:w-auto">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-center lg:text-right">
                      Ubah Status
                    </div>
                    <div className="flex bg-surface-container-low p-1 rounded-lg">
                      {STATUS_ACTIONS.map(({ status, label, activeClass, icon: Icon }) => {
                        const isActive = item.status === status;
                        const isUpdating = updatingId === item.id;
                        return (
                          <button
                            key={status}
                            onClick={() => updateStatus(item.id, status)}
                            disabled={isUpdating}
                            className={`
                              flex items-center justify-center py-1.5 px-3 rounded-[0.375rem] text-[11px] font-semibold transition-all w-24 border
                              ${isActive ? activeClass : 'text-muted-foreground hover:bg-surface-container-highest border-transparent'}
                              ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}
                            `}
                          >
                            {isUpdating && isActive ? (
                              <Loader2 className="w-3 h-3 animate-spin mr-1.5" />
                            ) : (
                              <Icon className="w-3 h-3 mr-1.5" strokeWidth={2} />
                            )}
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <Link
                    href={`/kelola-laporan/${item.id}`}
                    className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary-dim transition-colors"
                  >
                    Buka Detail <ExternalLink className="w-3.5 h-3.5" strokeWidth={2} />
                  </Link>
                </div>

              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
