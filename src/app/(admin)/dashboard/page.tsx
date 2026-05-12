import { prisma } from '@/lib/prisma';
import { DynamicIcon } from '@/components/ui/DynamicIcon';
import DashboardStatCards from '@/components/admin/DashboardStatCards';

// Data fetching di server - tidak perlu API call
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
  MENUNGGU: { label: 'Menunggu', class: 'bg-error/10 text-error' },
  DIPROSES: { label: 'Diproses', class: 'bg-primary-dim/10 text-primary-dim' },
  SELESAI:  { label: 'Selesai',  class: 'bg-tertiary/10 text-tertiary' },
};

export default async function DashboardPage() {
  const stats = await getDashboardStats();

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
      <DashboardStatCards
        totalLaporan={stats.totalLaporan}
        menunggu={stats.menunggu}
        diproses={stats.diproses}
        selesai={stats.selesai}
        totalUser={stats.totalUser}
      />

      {/* Laporan Terbaru */}
      <div className="bg-surface-container-low rounded-xl p-4 sm:p-6 overflow-hidden">
        <div className="mb-4 px-2">
          <h2 className="font-display font-semibold text-on-surface text-lg">
            Laporan Terbaru
          </h2>
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
                      {l.user.name} - {l.kategori.nama}
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