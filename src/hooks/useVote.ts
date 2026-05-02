'use client';

import { useState, useCallback, useRef } from 'react';

interface UseVoteReturn {
  voted: boolean;
  voteCount: number;
  isLoading: boolean;
  toggleVote: () => void;
  error: string | null;
}

/**
 * Hook untuk toggle vote laporan dengan optimistic UI.
 * 
 * Fitur:
 * - Optimistic update: UI langsung berubah sebelum response server
 * - Rollback otomatis jika gagal
 * - Prevent double-click
 * - TIDAK ADA batasan vote per hari (unlimited)
 * 
 * Catatan: Batasan 3x per hari hanya untuk MEMBUAT laporan, bukan vote
 * 
 * @param laporanId - ID laporan yang akan di-vote
 * @param initialVoteCount - Jumlah vote awal dari server
 * @param initialVoted - Apakah user sudah vote (dari server)
 */
export function useVote(
  laporanId: string,
  initialVoteCount: number,
  initialVoted: boolean
): UseVoteReturn {
  const [voted, setVoted] = useState(initialVoted);
  const [voteCount, setVoteCount] = useState(initialVoteCount);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cegah double-click dengan ref
  const isToggling = useRef(false);

  const toggleVote = useCallback(async () => {
    // Cegah klik berulang saat masih proses
    if (isToggling.current) return;
    isToggling.current = true;
    setIsLoading(true);
    setError(null);

    // Simpan state sebelumnya untuk rollback
    const prevVoted = voted;
    const prevCount = voteCount;

    // Optimistic update
    const newVoted = !voted;
    setVoted(newVoted);
    setVoteCount(newVoted ? voteCount + 1 : voteCount - 1);

    try {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ laporanId }),
      });

      if (!res.ok) {
        const data = await res.json();

        // Rollback optimistic update
        setVoted(prevVoted);
        setVoteCount(prevCount);

        if (res.status === 401) {
          setError('Silakan login terlebih dahulu');
        } else {
          setError(data.error || 'Gagal memproses vote');
        }
        return;
      }

      // Sinkronkan dengan data server (bisa saja ada perubahan dari user lain)
      const data = await res.json();
      setVoted(data.voted);
      setVoteCount(data.voteCount);
    } catch {
      // Rollback optimistic update
      setVoted(prevVoted);
      setVoteCount(prevCount);
      setError('Terjadi kendala pada sistem');
    } finally {
      setIsLoading(false);
      isToggling.current = false;
    }
  }, [laporanId, voted, voteCount]);

  return { voted, voteCount, isLoading, toggleVote, error };
}
