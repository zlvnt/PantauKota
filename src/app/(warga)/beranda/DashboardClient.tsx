'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import {
  MapPin,
  ThumbsUp,
  MessageSquare,
  Plus,
  FileSearch,
  ArrowRight,
} from 'lucide-react';
import { DynamicIcon } from '@/components/ui/DynamicIcon';
import { STATUS_CONFIG } from '@/types/laporan';
import type { LaporanSaya } from '@/types/laporan';

const LIMIT = 3;

// ─── Format tanggal relatif ────────────────────────────────────────────────
function formatTanggal(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Hari ini';
  if (diffDays === 1) return 'Kemarin';
  if (diffDays < 7) return `${diffDays} hari lalu`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} minggu lalu`;
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ─── Kartu laporan individual ──────────────────────────────────────────────
function LaporanCard({ item }: { item: LaporanSaya }) {
  const cfg = STATUS_CONFIG[item.status];
  return (
    <Link
      href={`/laporan/${item.id}`}
      className="group flex items-start gap-4 p-4 rounded-xl bg-surface-container-lowest hover:bg-surface-container-high transition-all duration-200"
    >
      {/* Ikon Kategori */}
      <div className="mt-0.5 flex-shrink-0 w-10 h-10 rounded-xl bg-surface flex items-center justify-center shadow-sm">
        <DynamicIcon
          iconName={item.kategori.icon}
          className="w-5 h-5 text-[#677177]"
          strokeWidth={1.5}
        />
      </div>

      {/* Konten */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-on-surface line-clamp-2 leading-snug group-hover:text-primary transition-colors">
            {item.judul}
          </p>
          {/* Status Badge */}
          <span
            className={`flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${cfg.bgClass}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotClass}`} />
            {cfg.label}
          </span>
        </div>

        {/* Kategori & Alamat */}
        <p className="text-xs text-[#677177] mt-1">
          {item.kategori.nama}
        </p>
        {item.alamat && (
          <p className="text-xs text-[#8a969c] mt-1 flex items-center gap-1 line-clamp-1">
            <MapPin className="w-3 h-3 flex-shrink-0" strokeWidth={1.5} />
            {item.alamat}
          </p>
        )}

        {/* Metadata bawah */}
        <div className="flex items-center gap-3 mt-2 text-xs text-[#8a969c]">
          <span className="flex items-center gap-1">
            <ThumbsUp className="w-3 h-3" strokeWidth={1.5} />
            {item.voteCount}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="w-3 h-3" strokeWidth={1.5} />
            {item._count.komentar}
          </span>
          <span className="ml-auto">{formatTanggal(item.createdAt)}</span>
        </div>
      </div>
    </Link>
  );
}

// ─── Komponen utama (Client) ────────────────────────────────────────────────
interface DashboardClientProps {
  laporan: LaporanSaya[];
  userName: string;
}

export default function DashboardClient({ laporan, userName }: DashboardClientProps) {
  // Hitung statistik dari seluruh data
  const stats = useMemo(() => ({
    total: laporan.length,
    menunggu: laporan.filter((l) => l.status === 'MENUNGGU').length,
    diproses: laporan.filter((l) => l.status === 'DIPROSES').length,
    selesai: laporan.filter((l) => l.status === 'SELESAI').length,
  }), [laporan]);

  // Tampilkan hanya 3 laporan terbaru di dashboard
  const preview = useMemo(() => laporan.slice(0, LIMIT), [laporan]);
  const hasMore = laporan.length > LIMIT;

  return (
    <div className="min-h-screen bg-surface overflow-x-hidden pb-20 sm:pb-8 pt-24">
      {/* ── Hero Strip ──────────────────────────────────────────────────── */}
      <div className="bg-surface-container-low border-b border-[rgba(169,180,185,0.12)]">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <p className="text-xs font-bold uppercase tracking-widest text-[#677177] mb-1">
            Dashboard Saya
          </p>
          <h1 className="text-3xl font-display font-semibold text-on-surface tracking-tight">
            Halo, {userName.split(' ')[0]}!
          </h1>
          <p className="text-sm text-[#677177] mt-1.5">
            Pantau semua laporan yang telah Anda ajukan di sini.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">

        {/* ── Stat Cards ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Total */}
          <div className="bg-surface-container-lowest rounded-xl p-4 shadow-ambient">
            <p className="text-3xl font-display font-bold text-on-surface leading-none">
              {stats.total}
            </p>
            <p className="text-[11px] text-[#677177] mt-2 font-medium uppercase tracking-wide">
              Total Laporan
            </p>
          </div>
          {/* Per-Status */}
          {(
            [
              ['MENUNGGU', stats.menunggu],
              ['DIPROSES', stats.diproses],
              ['SELESAI', stats.selesai],
            ] as const
          ).map(([status, count]) => {
            const cfg = STATUS_CONFIG[status];
            return (
              <div key={status} className="bg-surface-container-lowest rounded-xl p-4 shadow-ambient">
                <p
                  className="text-3xl font-display font-bold leading-none"
                  style={{ color: cfg.color }}
                >
                  {count}
                </p>
                <p className="text-[11px] text-[#677177] mt-2 font-medium uppercase tracking-wide">
                  {cfg.label}
                </p>
              </div>
            );
          })}
        </div>

        {/* ── Section Daftar Laporan ────────────────────────────────────── */}
        <div>
          {/* Header section */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-on-surface text-base">
              Laporan Terbaru Saya
            </h2>
            {laporan.length > 0 && (
              <Link
                href="/laporan-saya"
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-dim transition-colors"
              >
                Lihat Semua
                <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
              </Link>
            )}
          </div>

          {/* Daftar laporan (max 3) */}
          <div className="bg-surface-container-low rounded-2xl p-2 space-y-1">
            {/* Empty state: belum punya laporan sama sekali */}
            {laporan.length === 0 && (
              <div className="flex flex-col items-center gap-3 py-16 text-center">
                <div className="w-14 h-14 rounded-2xl bg-surface flex items-center justify-center">
                  <FileSearch className="w-7 h-7 text-[#a9b4b9]" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-on-surface">Belum ada laporan</p>
                  <p className="text-xs text-[#677177] mt-1">
                    Laporkan masalah di sekitar Anda untuk mulai berkontribusi.
                  </p>
                </div>
                <Link
                  href="/laporan/buat"
                  className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-dim transition-colors shadow-ambient"
                >
                  <Plus className="w-4 h-4" strokeWidth={2} />
                  Buat Laporan Pertama Anda
                </Link>
              </div>
            )}

            {/* Daftar kartu (preview 3) */}
            {preview.map((item) => (
              <LaporanCard key={item.id} item={item} />
            ))}

            {/* Tombol Lihat Semua jika ada lebih dari 3 */}
            {hasMore && (
              <Link
                href="/laporan-saya"
                className="flex items-center justify-center gap-2 w-full py-3 mt-1 rounded-xl text-sm font-semibold text-primary hover:bg-primary/5 transition-colors"
              >
                Lihat Semua {laporan.length} Laporan
                <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
              </Link>
            )}
          </div>
        </div>

        {/* ── CTA: Laporkan Masalah Baru ────────────────────────────────── */}
        {laporan.length > 0 && (
          <div className="pb-6">
            <Link
              href="/laporan/buat"
              className="flex items-center justify-center gap-2 w-full py-3 bg-primary hover:bg-primary-dim text-white text-sm font-semibold rounded-xl transition-colors shadow-ambient"
            >
              <Plus className="w-4 h-4" strokeWidth={2} />
              Laporkan Masalah Baru
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
