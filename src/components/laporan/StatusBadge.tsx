// 📁 src/components/laporan/StatusBadge.tsx
// Badge status laporan — menggantikan placeholder
// Reuse STATUS_CONFIG dari types/laporan.ts

import { STATUS_CONFIG } from '@/types/laporan';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: keyof typeof STATUS_CONFIG;
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
        config.bgClass,
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', config.dotClass)} />
      {config.label}
    </span>
  );
}
