'use client';

import { ThumbsUp } from 'lucide-react';
import { useVote } from '@/hooks/useVote';
import { useSession } from '@/hooks/useAuthSession';
import { useState, useEffect } from 'react';

interface VoteButtonProps {
  laporanId: string;
  initialVoteCount: number;
  initialVoted?: boolean;
  size?: 'sm' | 'md';
}

/**
 * Tombol vote/upvote reusable.
 * 
 * Ukuran:
 * - `sm` — untuk popup peta (compact)
 * - `md` — untuk kartu laporan (default)
 * 
 * Desain Editorial Ledger:
 * - Belum vote: ikon outlined, warna muted
 * - Sudah vote: ikon filled, warna primary, background tonal
 * - Animasi bounce saat vote berhasil
 * - Toast error auto-dismiss (3 detik)
 */
export default function VoteButton({
  laporanId,
  initialVoteCount,
  initialVoted = false,
  size = 'md',
}: VoteButtonProps) {
  const { status } = useSession();
  const isAuthenticated = status === 'authenticated';

  const { voted, voteCount, isLoading, toggleVote, error } = useVote(
    laporanId,
    initialVoteCount,
    initialVoted
  );

  // Animasi bounce saat vote berhasil
  const [showBounce, setShowBounce] = useState(false);
  const [prevVoted, setPrevVoted] = useState(initialVoted);

  useEffect(() => {
    // Trigger bounce hanya saat berubah dari unvoted → voted
    if (voted && !prevVoted) {
      setShowBounce(true);
      const timer = setTimeout(() => setShowBounce(false), 300);
      return () => clearTimeout(timer);
    }
    setPrevVoted(voted);
  }, [voted, prevVoted]);

  // Toast error (auto-dismiss)
  const [showError, setShowError] = useState(false);
  useEffect(() => {
    if (error) {
      setShowError(true);
      const timer = setTimeout(() => setShowError(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated || isLoading) return;
    toggleVote();
  };

  const isSm = size === 'sm';

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        disabled={!isAuthenticated || isLoading}
        title={
          !isAuthenticated
            ? 'Login untuk vote'
            : voted
              ? 'Batalkan dukungan'
              : 'Dukung laporan ini'
        }
        className={`
          inline-flex items-center gap-1 font-medium transition-all duration-200 rounded-lg
          ${isSm ? 'text-xs px-1.5 py-0.5' : 'text-xs px-2.5 py-1.5'}
          ${
            voted
              ? 'text-primary bg-primary/10 hover:bg-primary/15'
              : 'text-[#677177] hover:text-primary hover:bg-primary/5'
          }
          ${isLoading ? 'opacity-60 cursor-wait' : ''}
          ${!isAuthenticated ? 'opacity-50 cursor-default' : 'cursor-pointer'}
          ${showBounce ? 'scale-110' : 'scale-100'}
        `}
      >
        <ThumbsUp
          className={`${isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} transition-transform duration-200 ${showBounce ? 'scale-125' : ''}`}
          strokeWidth={voted ? 2.5 : 1.5}
          fill={voted ? 'currentColor' : 'none'}
        />
        <span>{voteCount}</span>
      </button>

      {/* Error toast */}
      {showError && error && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-[#2a3439] text-white text-[10px] font-medium rounded-lg whitespace-nowrap shadow-lg z-50 animate-fade-in">
          {error}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#2a3439]" />
        </div>
      )}
    </div>
  );
}
