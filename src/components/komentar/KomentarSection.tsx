'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Trash2, Send, MessageSquare, Loader2 } from 'lucide-react';

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
      }
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
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-800 flex items-center gap-2">
        <MessageSquare className="w-4 h-4" />
        Komentar ({komentar.length})
      </h3>

      {/* List komentar */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        ) : komentar.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">Belum ada komentar.</p>
        ) : (
          komentar.map((k) => (
            <div key={k.id} className="flex gap-3 group">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600 shrink-0">
                {k.user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 bg-gray-50 rounded-xl px-4 py-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-gray-800">{k.user.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">
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
                        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition"
                      >
                        {deletingId === k.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-700 mt-0.5">{k.isi}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Form komentar */}
      {session ? (
        <form onSubmit={handleSubmit} className="flex gap-2 mt-2">
          <input
            type="text"
            value={isi}
            onChange={(e) => setIsi(e.target.value)}
            placeholder="Tulis komentar..."
            maxLength={500}
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={submitting || !isi.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition flex items-center gap-1.5 text-sm font-medium"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
      ) : (
        <p className="text-sm text-gray-400 text-center">Login untuk berkomentar.</p>
      )}
    </div>
  );
}
