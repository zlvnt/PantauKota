'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, Loader, CheckCircle } from 'lucide-react';
import CompletionModal from '@/components/admin/CompletionModal';
import { useToast } from '@/hooks/useToast';
import type { STATUS_CONFIG } from '@/types/laporan';

interface Props {
  laporanId: string;
  initialStatus: keyof typeof STATUS_CONFIG;
  judul: string;
}

export default function AdminStatusUpdater({ laporanId, initialStatus, judul }: Props) {
  const [loading, setLoading] = useState<string | null>(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const router = useRouter();
  const { success, error } = useToast();

  const updateStatus = async (newStatus: keyof typeof STATUS_CONFIG) => {
    if (newStatus === initialStatus) return;

    if (newStatus === 'SELESAI') {
      setShowCompletionModal(true);
      return;
    }

    setLoading(newStatus);
    try {
      const res = await fetch(`/api/laporan/${laporanId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Gagal mengubah status');
      }

      success('Status laporan berhasil diperbarui');
      router.refresh();
    } catch (err) {
      error(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(null);
    }
  };

  const handleCompletionSubmit = async (data: { catatanAdmin: string; fotoPenyelesaian: string | null }) => {
    try {
      const res = await fetch(`/api/laporan/${laporanId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'SELESAI',
          catatanAdmin: data.catatanAdmin,
          fotoPenyelesaian: data.fotoPenyelesaian,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Gagal menyelesaikan laporan');
      }

      success('Laporan berhasil diselesaikan');
      setShowCompletionModal(false);
      router.refresh();
    } catch (err) {
      error(err instanceof Error ? err.message : 'Terjadi kesalahan');
      throw err;
    }
  };

  const actions = [
    { status: 'MENUNGGU' as const, label: 'Menunggu', icon: Clock, activeClass: 'bg-amber-500 text-white', inactiveClass: 'bg-amber-50 text-amber-700 hover:bg-amber-100' },
    { status: 'DIPROSES' as const, label: 'Diproses', icon: Loader, activeClass: 'bg-blue-500 text-white', inactiveClass: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
    { status: 'SELESAI' as const, label: 'Selesai', icon: CheckCircle, activeClass: 'bg-tertiary text-white', inactiveClass: 'bg-tertiary/10 text-tertiary hover:bg-tertiary/15' },
  ];

  return (
    <>
      <div className="mt-6 pt-5">
        <div className="text-[11px] font-bold uppercase tracking-widest text-on-surface/60 mb-3">
          Ubah Status Laporan
        </div>
        <div className="grid grid-cols-3 gap-2">
          {actions.map(({ status, label, icon: Icon, activeClass, inactiveClass }) => {
            const isActive = initialStatus === status;
            const isLoading = loading === status;
            return (
              <button
                key={status}
                onClick={() => updateStatus(status)}
                disabled={!!loading || isActive}
                className={`flex flex-col items-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all disabled:opacity-60 ${isActive ? activeClass + ' cursor-default' : inactiveClass}`}
              >
                {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Icon className="w-4 h-4" strokeWidth={2} />}
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {showCompletionModal && (
        <CompletionModal
          isOpen={showCompletionModal}
          onClose={() => setShowCompletionModal(false)}
          onSubmit={handleCompletionSubmit}
          laporanJudul={judul}
        />
      )}
    </>
  );
}
