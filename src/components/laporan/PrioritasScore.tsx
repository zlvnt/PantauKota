'use client';

import { Flame } from 'lucide-react';

interface PrioritasScoreProps {
  voteCount: number;
  createdAt: string;
  className?: string;
}

/**
 * Menampilkan skor prioritas otomatis berdasarkan formula:
 * score = (voteCount × 2) + jumlah_hari_sejak_dibuat
 *
 * Semakin tinggi skor → semakin mendesak laporan ini.
 */
export default function PrioritasScore({ voteCount, createdAt, className = '' }: PrioritasScoreProps) {
  const daysSince = Math.floor(
    (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );
  const score = voteCount * 2 + daysSince;

  // Tentukan intensitas warna berdasarkan skor
  let colorClass = 'bg-surface-container-high text-muted-foreground';
  if (score >= 30) colorClass = 'bg-red-100 text-red-700';
  else if (score >= 15) colorClass = 'bg-orange-100 text-orange-700';
  else if (score >= 5) colorClass = 'bg-amber-100 text-amber-700';

  return (
    <div
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${colorClass} ${className}`}
      title={`Skor Prioritas: ${score}\n(${voteCount} dukungan × 2) + ${daysSince} hari`}
    >
      <Flame className="w-2.5 h-2.5" />
      {score}
    </div>
  );
}
