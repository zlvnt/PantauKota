'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from '@/hooks/useAuthSession';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { RealtimePostgresInsertPayload } from '@supabase/supabase-js';

interface Notifikasi {
  id: string;
  userId: string;
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

  // Supabase Realtime subscription
  useEffect(() => {
    if (!session?.user?.id) return;

    fetchNotifikasi();

    const supabase = createSupabaseBrowserClient();
    const channelName = `notifikasi:${session.user.id}:${Date.now()}:${Math.random()
      .toString(36)
      .slice(2)}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'Notifikasi',
        },
        (payload: RealtimePostgresInsertPayload<Notifikasi>) => {
          if (payload.new && payload.new.userId === session.user.id) {
            setNotifikasi((prev) => [payload.new as Notifikasi, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
