'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

interface Notifikasi {
  id: string;
  judul: string;
  pesan: string;
  laporanId: string | null;
  dibaca: boolean;
  createdAt: string;
}

export function useNotifications() {
  const { data: session } = useSession();
  const [notifikasi, setNotifikasi] = useState<Notifikasi[]>([]);
  const [loading, setLoading] = useState(false);

  const unreadCount = notifikasi.filter((n) => !n.dibaca).length;

  const fetchNotifikasi = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notifikasi');
      if (res.ok) {
        const data = await res.json();
        setNotifikasi(data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // SSE connection
  useEffect(() => {
    if (!session?.user?.id) return;

    fetchNotifikasi();

    const es = new EventSource('/api/notifikasi/sse');

    es.onmessage = (e) => {
      try {
        const notif: Notifikasi = JSON.parse(e.data);
        setNotifikasi((prev) => [notif, ...prev]);
      } catch {
        // ping frame, abaikan
      }
    };

    es.onerror = () => es.close();

    return () => es.close();
  }, [session?.user?.id, fetchNotifikasi]);

  const tandaiBacaSemua = useCallback(async () => {
    await fetch('/api/notifikasi', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
    setNotifikasi((prev) => prev.map((n) => ({ ...n, dibaca: true })));
  }, []);

  const tandaiBaca = useCallback(async (id: string) => {
    await fetch('/api/notifikasi', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    setNotifikasi((prev) => prev.map((n) => (n.id === id ? { ...n, dibaca: true } : n)));
  }, []);

  const hapusNotifikasi = useCallback(async (id: string) => {
    await fetch(`/api/notifikasi?id=${id}`, { method: 'DELETE' });
    setNotifikasi((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return { notifikasi, unreadCount, loading, tandaiBaca, tandaiBacaSemua, hapusNotifikasi };
}
