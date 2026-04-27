import { STATUS_CONFIG } from '@/types/laporan';

interface StatusBadgeProps {
  status: keyof typeof STATUS_CONFIG;
  showDot?: boolean;
}

/**
 * StatusBadge — badge status laporan yang konsisten di seluruh aplikasi.
 * Menggantikan penulisan inline `px-2 py-0.5 rounded-full ...` yang berulang.
 */
export default function StatusBadge({ status, showDot = true }: StatusBadgeProps) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${cfg.bgClass}`}>
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotClass}`} />}
      {cfg.label}
    </span>
  );
}
