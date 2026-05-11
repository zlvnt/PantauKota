'use client';

import { Flame } from 'lucide-react';
import { calculatePriorityScore } from '@/lib/utils';
import { PRIORITY_THRESHOLD } from '@/lib/constants';

interface PrioritasScoreProps {
  voteCount: number;
  createdAt: string;
  className?: string;
}

/**
 * Komponen PrioritasScore untuk PBI-12: Sistem Prioritas Laporan
 * 
 * Formula: score = (voteCount × 2) + jumlah_hari_sejak_dibuat
 * 
 * Semakin tinggi skor → semakin mendesak laporan ini.
 * 
 * Warna dinamis:
 * - score >= threshold (50) → Merah (urgent/prioritas)
 * - score >= 30 → Orange (tinggi)
 * - score >= 15 → Amber (sedang)
 * - score < 15 → Abu-abu (rendah)
 * 
 * Desain Editorial Ledger:
 * - Badge compact dengan icon flame
 * - Tooltip menampilkan detail perhitungan
 */
export default function PrioritasScore({ voteCount, createdAt, className = '' }: PrioritasScoreProps) {
  // Gunakan utility function untuk konsistensi perhitungan
  const score = calculatePriorityScore(voteCount, createdAt);
  
  const daysSince = Math.floor(
    (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  // Tentukan intensitas warna berdasarkan skor
  let colorClass = 'bg-surface-container-high text-muted-foreground';
  if (score >= PRIORITY_THRESHOLD) colorClass = 'bg-red-100 text-red-700';
  else if (score >= 30) colorClass = 'bg-orange-100 text-orange-700';
  else if (score >= 15) colorClass = 'bg-amber-100 text-amber-700';

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
