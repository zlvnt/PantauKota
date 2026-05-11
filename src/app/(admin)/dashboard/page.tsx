import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import {
  FileText,
  Loader,
  CheckCircle,
  Users,
  TrendingUp,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { DynamicIcon } from '@/components/ui/DynamicIcon';
import DashboardCharts from '@/components/admin/DashboardCharts';

const TREND_DAYS = 30;

async function getDashboardStats() {
  const trendStart = new Date();
  trendStart.setHours(0, 0, 0, 0);
  trendStart.setDate(trendStart.getDate() - (TREND_DAYS - 1));

  const [
    totalLaporan,
    menunggu,
    diproses,
    selesai,
    totalUser,
    laporanTerbaru,
    kategoriCounts,
    trendRaw,
  ] = await Promise.all([
    prisma.laporan.count(),
    prisma.laporan.count({ where: { status: 'MENUNGGU' } }),
    prisma.laporan.count({ where: { status: 'DIPROSES' } }),
    prisma.laporan.count({ where: { status: 'SELESAI' } }),
    prisma.user.count({ where: { role: 'WARGA' } }),
    prisma.laporan.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        judul: true,
        status: true,
        createdAt: true,
        kategori: { select: { nama: true, icon: true } },
        user: { select: { name: true } },
      },
    }),
    prisma.kategori.findMany({
      where: { isActive: true },
      select: {
        nama: true,
        _count: { select: { laporan: true } },
      },
    }),
    prisma.laporan.findMany({
      where: { createdAt: { gte: trendStart } },
      select: { createdAt: true },
    }),
  ]);

  // Status data untuk donut chart
  const statusData = [
    { name: 'Menunggu', value: menunggu, color: '#B3261E' },
    { name: 'Diproses', value: diproses, color: '#6B9A9A' },
    { name: 'Selesai', value: selesai, color: '#006d4a' },
  ];

  // Top 6 kategori untuk bar chart
  const kategoriData = kategoriCounts
    .map((k) => ({ nama: k.nama, total: k._count.laporan }))
    .filter((k) => k.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, 6);

  // Trend 30 hari — group per tanggal di JS
  const bucket = new Map<string, number>();
  for (let i = 0; i < TREND_DAYS; i++) {
    const d = new Date(trendStart);
    d.setDate(trendStart.getDate() + i);
    bucket.set(toDateKey(d), 0);
  }
  for (const row of trendRaw) {
    const key = toDateKey(row.createdAt);
    if (bucket.has(key)) bucket.set(key, (bucket.get(key) ?? 0) + 1);
  }
  const trendData = Array.from(bucket.entries()).map(([key, total]) => ({
    label: formatTrendLabel(key),
    total,
  }));

  return {
    totalLaporan,
    menunggu,
    diproses,
    selesai,
    totalUser,
    laporanTerbaru,
    statusData,
    kategoriData,
    trendData,
  };
}

function toDateKey(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function formatTrendLabel(key: string) {
  const [, mm, dd] = key.split('-');
  return `${dd}/${mm}`;
}

const STATUS_STYLE = {
  MENUNGGU: { label: 'Menunggu', class: 'bg-error/10 text-error' },
  DIPROSES: { label: 'Diproses', class: 'bg-primary-dim/10 text-primary-dim' },
  SELESAI:  { label: 'Selesai',  class: 'bg-tertiary/10 text-tertiary' },
};

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  const cards = [
    {
      label: 'Total Laporan',
      value: stats.totalLaporan,
      icon: FileText,
      color: 'bg-surface-container-high text-on-surface',
    },
    {
      label: 'Menunggu',
      value: stats.menunggu,
      icon: Clock,
      color: 'bg-error/10 text-error',
    },
    {
      label: 'Diproses',
      value: stats.diproses,
      icon: Loader,
      color: 'bg-primary-dim/10 text-primary-dim',
    },
    {
      label: 'Selesai',
      value: stats.selesai,
      icon: CheckCircle,
      color: 'bg-tertiary/10 text-tertiary',
    },
    {
      label: 'Total Warga',
      value: stats.totalUser,
      icon: Users,
      color: 'bg-surface-container-high text-on-surface',
    },
    {
      label: 'Tingkat Penyelesaian',
      value: stats.totalLaporan > 0
        ? `${Math.round((stats.selesai / stats.totalLaporan) * 100)}%`
        : '0%',
      icon: TrendingUp,
      color: 'bg-primary/10 text-primary',
    },
  ];

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-semibold text-on-surface tracking-tight">
          Dashboard
        </h1>
        <p className="text-sm text-[#677177] mt-1">
          Ringkasan aktivitas pelaporan warga
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-surface-container-lowest rounded-xl p-5 shadow-ambient border border-[rgba(169,180,185,0.1)]"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-[#677177]">
                    {card.label}
                  </p>
                  <p className="text-4xl font-display font-bold text-on-surface mt-2">
                    {card.value}
                  </p>
                </div>
                <div className={`p-2.5 rounded-lg ${card.color}`}>
                  <Icon className="w-5 h-5" strokeWidth={1.5} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts (PBI-17) */}
      <DashboardCharts
        statusData={stats.statusData}
        kategoriData={stats.kategoriData}
        trendData={stats.trendData}
      />

      {/* Laporan Terbaru */}
      <div className="bg-surface-container-low rounded-xl p-4 sm:p-6 overflow-hidden">
        <div className="mb-4 px-2 flex items-center justify-between gap-3">
          <h2 className="font-display font-semibold text-on-surface text-lg">
            Laporan Terbaru
          </h2>
          <Link
            href="/kelola-laporan"
            className="text-[11px] font-bold uppercase tracking-widest text-primary hover:text-on-surface transition-colors flex items-center gap-1.5"
          >
            Lihat Semua
            <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
          </Link>
        </div>
        <div className="space-y-3">
          {stats.laporanTerbaru.length === 0 && (
            <p className="py-8 text-sm text-[#677177] text-center bg-surface-container-lowest rounded-xl">
              Belum ada laporan masuk
            </p>
          )}
          {stats.laporanTerbaru.map((l) => {
            const st = STATUS_STYLE[l.status];
            return (
              <div key={l.id} className="p-4 sm:p-5 rounded-2xl flex items-center justify-between gap-4 bg-surface-container-lowest hover:-translate-y-0.5 shadow-[0_8px_30px_rgba(42,52,57,0.04)] transition-all">
                <div className="flex items-start gap-4 min-w-0">
                  <div className="mt-0.5 flex-shrink-0 p-2.5 bg-surface-container-low rounded-xl text-[#677177]">
                    <DynamicIcon iconName={l.kategori.icon} className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
                  </div>
                  <div className="min-w-0 flex flex-col justify-center">
                    <p className="text-sm font-bold text-on-surface truncate">{l.judul}</p>
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-[#677177] mt-1">
                      {l.user.name} • {l.kategori.nama}
                    </p>
                  </div>
                </div>
                <span className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${st.class}`}>
                  {st.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
