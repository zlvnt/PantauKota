'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck, Loader2, X } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { useSession } from '@/hooks/useAuthSession';
import { useRouter } from 'next/navigation';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { data: session } = useSession();
  const { notifikasi, unreadCount, loading, tandaiBaca, tandaiBacaSemua, hapusNotifikasi } = useNotifications();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKlik = async (id: string, laporanId: string | null) => {
    await tandaiBaca(id);
    setOpen(false);
    if (laporanId) {
      const href =
        session?.user?.role === 'ADMIN'
          ? `/dashboard/laporan/${laporanId}`
          : `/laporan/${laporanId}`;
      router.push(href);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative p-2 rounded-[0.375rem] hover:bg-surface-container-low transition-colors"
        aria-label="Notifikasi"
      >
        <Bell className="w-5 h-5 text-on-surface" strokeWidth={1.5} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-error text-white text-[10px] font-bold rounded-full flex items-center justify-center font-sans">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[280px] sm:w-80 bg-surface-container-lowest rounded-[0.375rem] shadow-ambient border border-outline-variant/15 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-surface-container-low">
            <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground font-sans">
              Notifikasi
            </span>
            {unreadCount > 0 && (
              <button
                onClick={tandaiBacaSemua}
                className="text-xs text-primary hover:text-primary-dim font-semibold flex items-center gap-1 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" strokeWidth={1.5} />
                Tandai semua dibaca
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" strokeWidth={1.5} />
              </div>
            ) : notifikasi.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Belum ada notifikasi.</p>
            ) : (
              notifikasi.map((n) => (
                <div
                  key={n.id}
                  className={`relative group flex items-start gap-0 transition-colors ${
                    !n.dibaca ? 'bg-surface-container-low' : 'bg-surface-container-lowest hover:bg-surface-container-low'
                  }`}
                >
                  {/* Konten notifikasi (klik untuk baca & navigasi) */}
                  <button
                    onClick={() => handleKlik(n.id, n.laporanId)}
                    className="flex-1 text-left px-4 py-3"
                  >
                    <div className="flex items-start gap-3">
                      {!n.dibaca && (
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      )}
                      <div className={!n.dibaca ? '' : 'ml-[18px]'}>
                        <p className="text-sm font-semibold text-on-surface font-sans">{n.judul}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">{n.pesan}</p>
                        <p className="text-[11px] uppercase tracking-widest text-muted-foreground mt-1.5">
                          {new Date(n.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  </button>

                  {/* Tombol hapus — hanya muncul saat dibaca & di-hover */}
                  {n.dibaca && (
                    <button
                      onClick={(e) => { e.stopPropagation(); hapusNotifikasi(n.id); }}
                      title="Hapus notifikasi"
                      className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 self-center mr-3 p-1 rounded-lg text-[#8a969c] hover:text-error hover:bg-error/10"
                    >
                      <X className="w-3.5 h-3.5" strokeWidth={2} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
