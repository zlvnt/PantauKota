import { STATUS_CONFIG } from '@/types/laporan';

// Tambahkan status untuk user management
const USER_STATUS_CONFIG = {
  AKTIF: {
    label: 'Aktif',
    bgClass: 'bg-green-100 text-green-800',
    dotClass: 'bg-green-500',
  },
  NONAKTIF: {
    label: 'Nonaktif',
    bgClass: 'bg-gray-100 text-gray-800',
    dotClass: 'bg-gray-400',
  },
} as const;

interface StatusBadgeProps {
  status: keyof typeof STATUS_CONFIG | keyof typeof USER_STATUS_CONFIG;
  showDot?: boolean;
}

/**
 * StatusBadge — badge status laporan yang konsisten di seluruh aplikasi.
 * Menggantikan penulisan inline `px-2 py-0.5 rounded-full ...` yang berulang.
 */
export default function StatusBadge({ status, showDot = true }: StatusBadgeProps) {
  // Cek apakah status adalah user status atau laporan status
  const cfg = USER_STATUS_CONFIG[status as keyof typeof USER_STATUS_CONFIG] || 
              STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
  
  if (!cfg) {
    console.warn(`StatusBadge: Status '${status}' tidak dikenali`);
    return null;
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${cfg.bgClass}`}>
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotClass}`} />}
      {cfg.label}
    </span>
  );
}
