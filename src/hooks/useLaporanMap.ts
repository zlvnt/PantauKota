'use client';

import { useState, useEffect, useCallback } from 'react';
import type { LaporanMapItem } from '@/types/laporan';

interface UseLaporanMapOptions {
  // Disiapkan untuk PBI-02: Filter & Search
  status?: string;
  kategoriId?: string;
  search?: string;
  // Untuk admin view: include nama pelapor
  adminView?: boolean;
}

interface UseLaporanMapReturn {
  laporan: LaporanMapItem[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useLaporanMap(options: UseLaporanMapOptions = {}): UseLaporanMapReturn {
  const [laporan, setLaporan] = useState<LaporanMapItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLaporan = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Bangun query string dari opsi filter
      const params = new URLSearchParams();
      if (options.status) params.set('status', options.status);
      if (options.kategoriId) params.set('kategoriId', options.kategoriId);
      if (options.search) params.set('search', options.search);
      if (options.adminView) params.set('adminView', 'true');

      const query = params.toString();
      const res = await fetch(`/api/laporan${query ? `?${query}` : ''}`);

      if (!res.ok) throw new Error('Gagal memuat data laporan');

      const data: LaporanMapItem[] = await res.json();
      setLaporan(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kendala pada sistem');
    } finally {
      setIsLoading(false);
    }
  }, [options.status, options.kategoriId, options.search, options.adminView]);

  useEffect(() => {
    fetchLaporan();
  }, [fetchLaporan]);

  return { laporan, isLoading, error, refetch: fetchLaporan };
}
