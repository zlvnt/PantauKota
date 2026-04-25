'use client';

import { useState, useCallback } from 'react';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  loading: boolean;
  error: string | null;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    loading: false,
    error: null,
  });

  const getCurrentPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({ ...prev, error: 'Geolocation tidak didukung browser ini.' }));
      return;
    }

    setState((prev: GeolocationState) => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          loading: false,
          error: null,
        });
      },
      (err) => {
        const messages: Record<number, string> = {
          1: 'Izin lokasi ditolak.',
          2: 'Lokasi tidak tersedia.',
          3: 'Permintaan lokasi timeout.',
        };
        setState((prev: GeolocationState) => ({
          ...prev,
          loading: false,
          error: messages[err.code] ?? 'Gagal mendapatkan lokasi.',
        }));
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  return { ...state, getCurrentPosition };
}
