'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from '@/hooks/useAuthSession';
import { Trash2, Send, MessageSquare, Loader2 } from 'lucide-react';
import Toast from '@/components/ui/Toast';
import { useToast } from '@/hooks/useToast';

interface Komentar {
  id: string;
  isi: string;
  createdAt: string;
  user: { id: string; name: string };
}

interface KomentarSectionProps {
  laporanId: string;
}

export default function KomentarSection({ laporanId }: KomentarSectionProps) {
  const { data: session } = useSession();
  const [komentar, setKomentar] = useState<Komentar[]>([]);
  const [isi, setIsi] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toasts, removeToast, error: toastError } = useToast();

  const fetchKomentar = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/komentar?laporanId=${laporanId}`);
      const data = await res.json();
      setKomentar(data);
    } finally {
      setLoading(false);
    }
  }, [laporanId]);

  useEffect(() => {
    fetchKomentar();
  }, [fetchKomentar]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isi.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/komentar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ laporanId, isi }),
      });

      if (res.ok) {
        const newKomentar = await res.json();
        setKomentar((prev) => [...prev, newKomentar]);
        setIsi('');
      } else {
        toastError('Gagal mengirim komentar. Coba lagi.');
      }
    } catch {
      toastError('Terjadi kendala pada sistem.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/komentar/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setKomentar((prev) => prev.filter((k) => k.id !== id));
      }
    } finally {
      setDeletingId(null);
    }
  };

  const canDelete = (komentarUserId: string) =>
    session?.user?.id === komentarUserId || session?.user?.role === 'ADMIN';

  return (
    <div className="space-y-6">
      {toasts.map((t) => (
        <Toast key={t.id} message={t.message} type={t.type} onClose={() => removeToast(t.id)} />
      ))}
      <h3 className="font-display font-semibold text-on-surface flex items-center gap-2 text-[11px] uppercase tracking-widest text-muted-foreground">
        <MessageSquare className="w-3.5 h-3.5" strokeWidth={1.5} />
        Komentar ({komentar.length})
      </h3>

      {/* List komentar */}
      <div className="space-y-1">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" strokeWidth={1.5} />
          </div>
        ) : komentar.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">Belum ada komentar.</p>
        ) : (
          komentar.map((k) => (
            <div
              key={k.id}
              className="flex gap-3 group px-4 py-3 rounded-[0.375rem] hover:bg-surface-container-low transition-colors"
            >
              <div className="w-8 h-8 rounded-[0.375rem] bg-surface-container-high flex items-center justify-center text-xs font-semibold text-on-surface shrink-0 font-display">
                {k.user.name?.charAt(0)?.toUpperCase() ?? '?'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-on-surface font-sans">{k.user.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
                      {new Date(k.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {canDelete(k.user.id) && (
                      <button
                        onClick={() => handleDelete(k.id)}
                        disabled={deletingId === k.id}
                        className="opacity-0 group-hover:opacity-100 text-error hover:text-error/80 transition-opacity"
                        aria-label="Hapus komentar"
                      >
                        {deletingId === k.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={1.5} />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                        )}
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-on-surface/80 mt-0.5 leading-relaxed">{k.isi}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Form komentar */}
      {session ? (
        <div className="space-y-2">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={isi}
              onChange={(e) => setIsi(e.target.value)}
              placeholder="Tulis komentar..."
              maxLength={500}
              className="flex-1 bg-surface-container-low border border-transparent focus:border-primary px-4 py-2.5 rounded-[0.375rem] text-sm text-on-surface placeholder:text-muted-foreground outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={submitting || !isi.trim()}
              className="bg-primary hover:bg-primary-dim text-white px-4 py-2.5 rounded-[0.375rem] disabled:opacity-50 transition-colors flex items-center gap-1.5 text-sm font-semibold shadow-ambient"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} />
              ) : (
                <Send className="w-4 h-4" strokeWidth={1.5} />
              )}
            </button>
          </form>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-2">Masuk untuk berkomentar.</p>
      )}
    </div>
  );
}
