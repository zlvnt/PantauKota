'use client';

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  AreaChart,
  Area,
} from 'recharts';

interface StatusDatum {
  name: string;
  value: number;
  color: string;
}

interface KategoriDatum {
  nama: string;
  total: number;
}

interface TrendDatum {
  label: string;
  total: number;
}

interface Props {
  statusData: StatusDatum[];
  kategoriData: KategoriDatum[];
  trendData: TrendDatum[];
}

const TOOLTIP_STYLE = {
  backgroundColor: '#ffffff',
  border: 'none',
  borderRadius: '12px',
  boxShadow: '0 8px 30px rgba(42, 52, 57, 0.12)',
  padding: '10px 14px',
  fontFamily: 'Inter, sans-serif',
  fontSize: '12px',
  color: '#2A3439',
};

const LABEL_STYLE = {
  fontFamily: 'Inter, sans-serif',
  fontSize: 11,
  fill: '#677177',
  fontWeight: 600,
};

export default function DashboardCharts({
  statusData,
  kategoriData,
  trendData,
}: Props) {
  const totalLaporan = statusData.reduce((acc, d) => acc + d.value, 0);

  return (
    <div className="space-y-6">
      {/* Row 1: Status Donut + Kategori Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution — Donut */}
        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient">
          <div className="mb-4">
            <h3 className="font-display font-semibold text-on-surface text-lg">
              Distribusi Status
            </h3>
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#677177] mt-1">
              Sebaran Laporan Berdasarkan Status
            </p>
          </div>

          {totalLaporan === 0 ? (
            <div className="h-64 flex items-center justify-center">
              <p className="text-sm text-[#677177]">Belum ada data</p>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative w-full sm:w-48 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={2}
                      stroke="none"
                    >
                      {statusData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={TOOLTIP_STYLE}
                      formatter={(value, name) => [`${value} laporan`, String(name)]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-3xl font-display font-bold text-on-surface">
                    {totalLaporan}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#677177] mt-0.5">
                    Total
                  </p>
                </div>
              </div>

              <div className="flex-1 space-y-3 w-full">
                {statusData.map((s) => {
                  const pct =
                    totalLaporan > 0
                      ? Math.round((s.value / totalLaporan) * 100)
                      : 0;
                  return (
                    <div
                      key={s.name}
                      className="flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: s.color }}
                        />
                        <span className="text-sm font-semibold text-on-surface truncate">
                          {s.name}
                        </span>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-sm font-bold text-on-surface">
                          {s.value}
                        </span>
                        <span className="text-[11px] font-semibold text-[#677177] ml-2">
                          {pct}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Top Kategori — Bar Horizontal */}
        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient">
          <div className="mb-4">
            <h3 className="font-display font-semibold text-on-surface text-lg">
              Laporan per Kategori
            </h3>
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#677177] mt-1">
              Top Kategori Paling Banyak Dilaporkan
            </p>
          </div>

          {kategoriData.length === 0 ? (
            <div className="h-64 flex items-center justify-center">
              <p className="text-sm text-[#677177]">Belum ada data</p>
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={kategoriData}
                  layout="vertical"
                  margin={{ top: 4, right: 16, bottom: 4, left: 0 }}
                >
                  <XAxis
                    type="number"
                    tick={LABEL_STYLE}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="nama"
                    tick={LABEL_STYLE}
                    axisLine={false}
                    tickLine={false}
                    width={100}
                  />
                  <Tooltip
                    cursor={{ fill: '#f0f4f7' }}
                    contentStyle={TOOLTIP_STYLE}
                    formatter={(value) => [`${value} laporan`, 'Total']}
                  />
                  <Bar
                    dataKey="total"
                    fill="#426464"
                    radius={[0, 6, 6, 0]}
                    barSize={18}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Trend 30 Hari — Area Chart Full Width */}
      <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient">
        <div className="mb-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <h3 className="font-display font-semibold text-on-surface text-lg">
              Trend Laporan Masuk
            </h3>
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#677177] mt-1">
              30 Hari Terakhir
            </p>
          </div>
          <p className="text-sm font-semibold text-[#677177]">
            Total:{' '}
            <span className="text-on-surface font-bold">
              {trendData.reduce((acc, d) => acc + d.total, 0)}
            </span>{' '}
            laporan
          </p>
        </div>

        <div className="h-64 sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={trendData}
              margin={{ top: 8, right: 16, bottom: 4, left: 0 }}
            >
              <defs>
                <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#426464" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#426464" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="label"
                tick={LABEL_STYLE}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
                minTickGap={24}
              />
              <YAxis
                tick={LABEL_STYLE}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
                width={28}
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(value) => [`${value} laporan`, 'Masuk']}
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="#426464"
                strokeWidth={2}
                fill="url(#trendGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}