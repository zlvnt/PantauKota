import { prisma } from '@/lib/prisma';
import {
  FileText,
  Loader,
  CheckCircle,
  Users,
  TrendingUp,
  Clock,
} from 'lucide-react';
import { DynamicIcon } from '@/components/ui/DynamicIcon';

// Data fetching di server — tidak perlu API call
async function getDashboardStats() {
  const [totalLaporan, menunggu, diproses, selesai, totalUser] = await Promise.all([
    prisma.laporan.count(),
    prisma.laporan.count({ where: { status: 'MENUNGGU' } }),
    prisma.laporan.count({ where: { status: 'DIPROSES' } }),
    prisma.laporan.count({ where: { status: 'SELESAI' } }),
    prisma.user.count({ where: { role: 'WARGA' } }),
  ]);

  const laporanTerbaru = await prisma.laporan.findMany({
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
  });

  return { totalLaporan, menunggu, diproses, selesai, totalUser, laporanTerbaru };
}

const STATUS_STYLE = {
  MENUNGGU: { label: 'Menunggu', class: 'bg-amber-100 text-amber-700' },
  DIPROSES: { label: 'Diproses', class: 'bg-blue-100 text-blue-700' },
  SELESAI:  { label: 'Selesai',  class: 'bg-green-100 text-green-700' },
};

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  const cards = [
    {
      label: 'Total Laporan',
      value: stats.totalLaporan,
      icon: FileText,
      color: 'bg-primary/10 text-primary',
    },
    {
      label: 'Menunggu',
      value: stats.menunggu,
      icon: Clock,
      color: 'bg-amber-100 text-amber-600',
    },
    {
      label: 'Diproses',
      value: stats.diproses,
      icon: Loader,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      label: 'Selesai',
      value: stats.selesai,
      icon: CheckCircle,
      color: 'bg-green-100 text-green-600',
    },
    {
      label: 'Total Warga',
      value: stats.totalUser,
      icon: Users,
      color: 'bg-purple-100 text-purple-600',
    },
    {
      label: 'Tingkat Penyelesaian',
      value: stats.totalLaporan > 0
        ? `${Math.round((stats.selesai / stats.totalLaporan) * 100)}%`
        : '0%',
      icon: TrendingUp,
      color: 'bg-tertiary/10 text-tertiary',
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

      {/* Laporan Terbaru */}
      <div className="bg-surface-container-lowest rounded-xl shadow-ambient border border-[rgba(169,180,185,0.1)] overflow-hidden">
        <div className="px-6 py-4 border-b border-[rgba(169,180,185,0.1)]">
          <h2 className="font-display font-semibold text-on-surface">
            Laporan Terbaru
          </h2>
        </div>
        <div className="divide-y-0 space-y-2 p-4">
          {stats.laporanTerbaru.length === 0 && (
            <p className="px-6 py-8 text-sm text-[#677177] text-center">
              Belum ada laporan masuk
            </p>
          )}
          {stats.laporanTerbaru.map((l) => {
            const st = STATUS_STYLE[l.status];
            return (
              <div key={l.id} className="p-4 rounded-xl flex items-center justify-between gap-4 bg-surface hover:bg-surface-container-low border border-[rgba(169,180,185,0.15)] shadow-sm transition-colors">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="mt-0.5 flex-shrink-0 p-2 bg-surface-container-low rounded-lg text-[#677177]">
                    <DynamicIcon iconName={l.kategori.icon} className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-on-surface truncate">{l.judul}</p>
                    <p className="text-xs text-[#677177] mt-0.5">
                      {l.user.name} · {l.kategori.nama}
                    </p>
                  </div>
                </div>
                <span className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold ${st.class}`}>
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
