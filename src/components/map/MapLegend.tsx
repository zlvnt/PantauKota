'use client';

import { STATUS_CONFIG, PRIORITY_COLOR } from '@/types/laporan';

interface MapLegendProps {
  className?: string;
}

/**
 * Legend komponen untuk menampilkan keterangan warna marker di peta
 * 
 * Warna marker:
 * - 🔴 Merah: Prioritas Darurat
 * - 🟡 Amber: Status MENUNGGU
 * - 🔵 Blue: Status DIPROSES
 * - 🟢 Green: Status SELESAI
 */
export default function MapLegend({ className = '' }: MapLegendProps) {
  const legendItems = [
    {
      color: PRIORITY_COLOR,
      label: 'Prioritas Darurat',
      description: '50+ suara',
    },
    {
      color: STATUS_CONFIG.MENUNGGU.color,
      label: 'Menunggu',
      description: 'Belum ditindaklanjuti',
    },
    {
      color: STATUS_CONFIG.DIPROSES.color,
      label: 'Diproses',
      description: 'Sedang ditangani',
    },
    {
      color: STATUS_CONFIG.SELESAI.color,
      label: 'Selesai',
      description: 'Sudah diselesaikan',
    },
  ];

  return (
    <div
      className={`bg-surface-container-lowest rounded-2xl shadow-[0_8px_30px_rgba(42,52,57,0.12)] p-4 ${className}`}
    >
      <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface/60 mb-3">
        Status Laporan
      </h3>
      <div className="space-y-2.5">
        {legendItems.map((item) => (
          <div key={item.label} className="flex items-start gap-3">
            {/* Marker Icon */}
            <div className="shrink-0 mt-0.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 32 42"
                width="20"
                height="26"
              >
                <path
                  d="M16 0C7.163 0 0 7.163 0 16c0 9.941 14.282 24.614 15.29 25.643a1 1 0 0 0 1.42 0C17.718 40.614 32 25.941 32 16 32 7.163 24.837 0 16 0z"
                  fill={item.color}
                  stroke="white"
                  strokeWidth="1.5"
                />
                <circle cx="16" cy="16" r="6" fill="white" opacity="0.9" />
              </svg>
            </div>

            {/* Label & Description */}
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-on-surface leading-tight">
                {item.label}
              </div>
              <div className="text-xs text-on-surface/60 leading-tight mt-0.5">
                {item.description}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
