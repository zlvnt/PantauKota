'use client';

import { useState, useEffect } from 'react';

/**
 * useDebounce — menunda pembaruan nilai hingga tidak ada perubahan selama `delay` ms.
 * Berguna untuk search input agar tidak fetch setiap ketukan.
 *
 * @param value  Nilai yang ingin di-debounce
 * @param delay  Durasi tunggu dalam milidetik (default: 400ms)
 */
export function useDebounce<T>(value: T, delay = 400): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
