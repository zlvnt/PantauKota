import { CheckCircle, Clock, Loader2, CalendarCheck, MessageSquareText, ImageIcon } from 'lucide-react';
import { CLOUDINARY_DETAIL_IMAGE_OPTIONS, getCloudinaryImageUrl } from '@/lib/cloudinary';

type Status = 'MENUNGGU' | 'DIPROSES' | 'SELESAI';

interface StatusTimelineProps {
  status: Status;
  createdAt: string;
  selesaiAt?: string | null;
  catatanAdmin?: string | null;
  fotoPenyelesaian?: string | null;
}

const STEPS: { key: Status; label: string; desc: string }[] = [
  { key: 'MENUNGGU', label: 'Laporan Diterima', desc: 'Laporan Anda sudah masuk dan menunggu tinjauan admin.' },
  { key: 'DIPROSES', label: 'Sedang Diproses', desc: 'Tim terkait sedang menangani masalah ini.' },
  { key: 'SELESAI', label: 'Selesai Ditangani', desc: 'Masalah telah berhasil diselesaikan.' },
];

const STEP_INDEX: Record<Status, number> = {
  MENUNGGU: 0,
  DIPROSES: 1,
  SELESAI: 2,
};

function formatDateTime(dateStr: string) {
  const date = new Date(dateStr);
  const dateFormatted = date.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const timeFormatted = date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${dateFormatted}, ${timeFormatted}`;
}

/**
 * Komponen StatusTimeline untuk PBI-11: Tracking Status Laporan
 * 
 * Fitur:
 * - Timeline visual 3 tahap (MENUNGGU → DIPROSES → SELESAI)
 * - Icon dinamis per status dengan animasi
 * - Warna berbeda per status (amber, blue, green)
 * - Tanggal laporan dibuat dan selesai
 * - Catatan admin + foto penyelesaian (jika SELESAI)
 * - Pesan informatif saat DIPROSES
 * 
 * Desain Editorial Ledger:
 * - No-Line Rule: Garis vertikal tipis sebagai connector, bukan divider
 * - Tonal Layering: Background berbeda untuk catatan admin
 */
export default function StatusTimeline({
  status,
  createdAt,
  selesaiAt,
  catatanAdmin,
  fotoPenyelesaian,
}: StatusTimelineProps) {
  const currentStep = STEP_INDEX[status];

  return (
    <div className="space-y-6">
      {/* Timeline Steps */}
      <div className="relative">
        {/* Garis vertikal penghubung */}
        <div className="absolute left-[18px] top-5 bottom-5 w-0.5 bg-surface-container-high" />

        <div className="space-y-0">
          {STEPS.map((step, idx) => {
            const isDone = idx < currentStep;
            const isActive = idx === currentStep;
            const isPending = idx > currentStep;

            let iconBg = 'bg-surface-container-high';
            let iconColor = 'text-muted-foreground';
            let labelColor = 'text-muted-foreground';
            let Icon = Clock;

            if (isDone) {
              iconBg = 'bg-primary/15';
              iconColor = 'text-primary';
              labelColor = 'text-on-surface';
              Icon = CheckCircle;
            } else if (isActive) {
              if (status === 'MENUNGGU') {
                iconBg = 'bg-amber-100';
                iconColor = 'text-amber-600';
                Icon = Clock;
              } else if (status === 'DIPROSES') {
                iconBg = 'bg-blue-100';
                iconColor = 'text-blue-600';
                Icon = Loader2;
              } else {
                iconBg = 'bg-green-100';
                iconColor = 'text-green-700';
                Icon = CheckCircle;
              }
              labelColor = 'text-on-surface font-semibold';
            }

            return (
              <div key={step.key} className="relative flex items-start gap-4 pb-8 last:pb-0">
                {/* Icon node */}
                <div
                  className={`
                    relative z-10 w-9 h-9 flex-shrink-0 rounded-full flex items-center justify-center
                    ${iconBg}
                    ${isActive && status === 'DIPROSES' ? 'ring-2 ring-blue-200' : ''}
                    ${isActive && status === 'SELESAI' ? 'ring-2 ring-green-200' : ''}
                    ${isActive && status === 'MENUNGGU' ? 'ring-2 ring-amber-200' : ''}
                  `}
                >
                  <Icon
                    className={`w-4 h-4 ${iconColor} ${isActive && status === 'DIPROSES' ? 'animate-spin' : ''}`}
                    strokeWidth={2}
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pt-1.5">
                  <p className={`text-sm ${labelColor}`}>{step.label}</p>
                  {isActive && (
                    <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
                  )}

                  {/* Tanggal laporan dibuat (step pertama) */}
                  {idx === 0 && (
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <CalendarCheck className="w-3 h-3" />
                      {formatDateTime(createdAt)}
                    </p>
                  )}

                  {/* Tanggal selesai (step terakhir, jika selesai) */}
                  {idx === 2 && status === 'SELESAI' && selesaiAt && (
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <CalendarCheck className="w-3 h-3" />
                      {formatDateTime(selesaiAt)}
                    </p>
                  )}

                  {isPending && (
                    <div className="w-16 h-0.5 bg-surface-container-high rounded mt-2" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Catatan & Bukti Admin — hanya tampil jika SELESAI */}
      {status === 'SELESAI' && (catatanAdmin || fotoPenyelesaian) && (
        <div className="bg-green-50 border border-green-100 rounded-xl p-5 space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-green-700">
            Tanggapan Admin
          </p>

          {catatanAdmin && (
            <div className="flex items-start gap-3">
              <MessageSquareText className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-green-900 leading-relaxed">{catatanAdmin}</p>
            </div>
          )}

          {fotoPenyelesaian && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-green-700">
                <ImageIcon className="w-3.5 h-3.5" />
                Bukti Penyelesaian
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getCloudinaryImageUrl(fotoPenyelesaian, CLOUDINARY_DETAIL_IMAGE_OPTIONS)}
                alt="Bukti penyelesaian laporan"
                className="w-full max-h-64 object-cover rounded-lg border border-green-200"
              />
            </div>
          )}
        </div>
      )}

      {/* Catatan saat DIPROSES */}
      {status === 'DIPROSES' && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
          <Loader2 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0 animate-spin" />
          <p className="text-sm text-blue-800">
            Laporan Anda sedang ditangani oleh tim terkait. Kami akan memberitahu Anda begitu ada pembaruan.
          </p>
        </div>
      )}
    </div>
  );
}
