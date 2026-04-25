'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { useRouter } from 'next/navigation';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { notifikasi, unreadCount, loading, tandaiBaca, tandaiBacaSemua } = useNotifications();

  // Tutup dropdown saat klik di luar
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
    if (laporanId) router.push(`/laporan/${laporanId}`);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition"
        aria-label="Notifikasi"
      >
        <Bell className="w-5 h-5 text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <span className="font-semibold text-gray-800 text-sm">Notifikasi</span>
            {unreadCount > 0 && (
              <button
                onClick={tandaiBacaSemua}
                className="text-xs text-blue-600 hover:underline flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Tandai semua dibaca
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
              </div>
            ) : notifikasi.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">Tidak ada notifikasi.</p>
            ) : (
              notifikasi.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleKlik(n.id, n.laporanId)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition ${!n.dibaca ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex items-start gap-2">
                    {!n.dibaca && (
                      <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    )}
                    <div className={!n.dibaca ? '' : 'ml-4'}>
                      <p className="text-sm font-medium text-gray-800">{n.judul}</p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.pesan}</p>
                      <p className="text-[10px] text-gray-400 mt-1">
                        {new Date(n.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
