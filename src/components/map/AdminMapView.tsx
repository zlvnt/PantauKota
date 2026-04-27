'use client';

import { useEffect, useRef, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin,
  ThumbsUp,
  MessageCircle,
  User,
  Calendar,
  CheckCircle,
  Clock,
  Loader,
  ExternalLink,
  Image as ImageIcon,
} from 'lucide-react';
import type { LaporanAdminMapItem } from '@/types/laporan';
import { STATUS_CONFIG } from '@/types/laporan';
import Link from 'next/link';
import { DynamicIcon } from '@/components/ui/DynamicIcon';

// Fix Leaflet default icon
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// ─── Marker dengan ukuran & warna berdasarkan prioritas ──────────────────────
function createAdminMarkerIcon(
  status: LaporanAdminMapItem['status'],
  voteCount: number,
  warna?: string | null
) {
  const color = warna ?? STATUS_CONFIG[status].color;
  const isUrgent = voteCount >= 30 && status === 'MENUNGGU';
  const size = isUrgent ? 40 : voteCount >= 15 ? 36 : 32;
  const height = isUrgent ? 52 : voteCount >= 15 ? 46 : 42;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 42" width="${size}" height="${height}">
      <path d="M16 0C7.163 0 0 7.163 0 16c0 9.941 14.282 24.614 15.29 25.643a1 1 0 0 0 1.42 0C17.718 40.614 32 25.941 32 16 32 7.163 24.837 0 16 0z"
        fill="${color}" stroke="white" stroke-width="1.5"/>
      ${isUrgent ? `<circle cx="16" cy="16" r="9" fill="white" opacity="0.2"/>` : ''}
      <circle cx="16" cy="16" r="6" fill="white" opacity="0.9"/>
    </svg>`;

  return L.divIcon({
    html: isUrgent
      ? `<div class="relative" style="animation: pulse 1.5s infinite;">
           ${svg}
           <div style="position:absolute;top:-4px;right:-4px;background:#e74c3c;color:white;border-radius:9999px;font-size:9px;font-weight:bold;padding:1px 4px;border:1.5px solid white">${voteCount}</div>
         </div>`
      : svg,
    className: '',
    iconSize: [size, height],
    iconAnchor: [size / 2, height],
    popupAnchor: [0, -(height + 2)],
  });
}

// ─── Tombol aksi cepat status ─────────────────────────────────────────────────
function QuickStatusButtons({
  id,
  currentStatus,
  onStatusUpdate,
}: {
  id: string;
  currentStatus: LaporanAdminMapItem['status'];
  onStatusUpdate: (id: string, newStatus: LaporanAdminMapItem['status']) => void;
}) {
  const [loading, setLoading] = useState<string | null>(null);

  const updateStatus = async (newStatus: LaporanAdminMapItem['status']) => {
    if (newStatus === currentStatus) return;
    setLoading(newStatus);
    try {
      const res = await fetch(`/api/laporan/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) onStatusUpdate(id, newStatus);
    } finally {
      setLoading(null);
    }
  };

  const actions = [
    { status: 'MENUNGGU' as const, label: 'Menunggu', icon: Clock, activeClass: 'bg-amber-500 text-white', inactiveClass: 'bg-amber-50 text-amber-700 hover:bg-amber-100' },
    { status: 'DIPROSES' as const, label: 'Diproses', icon: Loader, activeClass: 'bg-blue-500 text-white', inactiveClass: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
    { status: 'SELESAI' as const, label: 'Selesai', icon: CheckCircle, activeClass: 'bg-emerald-600 text-white', inactiveClass: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' },
  ];

  return (
    <div className="grid grid-cols-3 gap-1 mt-2">
      {actions.map(({ status, label, icon: Icon, activeClass, inactiveClass }) => {
        const isActive = currentStatus === status;
        const isLoading = loading === status;
        return (
          <button
            key={status}
            onClick={() => updateStatus(status)}
            disabled={!!loading}
            className={`flex flex-col items-center gap-0.5 py-1.5 px-1 rounded-lg text-[10px] font-bold transition-all disabled:opacity-60 ${isActive ? activeClass : inactiveClass}`}
          >
            {isLoading ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Icon className="w-3.5 h-3.5" strokeWidth={2} />}
            {label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Sub-komponen: marker admin dengan flyTo per-marker ───────────────────────
function AdminMarker({
  item,
  isSelected,
  onMarkerClick,
  onStatusUpdate,
}: {
  item: LaporanAdminMapItem;
  isSelected: boolean;
  onMarkerClick?: (id: string) => void;
  onStatusUpdate: (id: string, newStatus: LaporanAdminMapItem['status']) => void;
}) {
  const map = useMap();
  const markerRef = useRef<L.Marker>(null);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

  // Saat laporan dipilih dari sidebar → fly to & buka popup
  useEffect(() => {
    if (!isSelected) return;
    map.flyTo([item.latitude - 0.004, item.longitude], 16, { duration: 0.7 });
    const timer = setTimeout(() => markerRef.current?.openPopup(), 750);
    return () => clearTimeout(timer);
  }, [isSelected, item.latitude, item.longitude, map]);

  return (
    <Marker
      ref={markerRef}
      position={[item.latitude, item.longitude]}
      icon={createAdminMarkerIcon(item.status, item.voteCount, item.kategori.warna)}
      eventHandlers={{
        click: () => {
          onMarkerClick?.(item.id);
          map.flyTo([item.latitude - 0.004, item.longitude], 16, { duration: 0.7 });
          setTimeout(() => markerRef.current?.openPopup(), 750);
        },
      }}
    >
      <Popup autoPan autoPanPadding={[60, 80]} minWidth={270} maxWidth={310} closeButton={false}>
        <div className="font-sans space-y-0 overflow-hidden rounded-lg" style={{ margin: '-7px -11px' }}>

          {/* Gambar laporan */}
          {item.foto && item.foto.length > 0 ? (
            <div className="relative h-28 w-full overflow-hidden bg-surface-container-low">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.foto[0]} alt={item.judul} className="w-full h-full object-cover" />
              {item.foto.length > 1 && (
                <span className="absolute bottom-1.5 right-1.5 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-1">
                  <ImageIcon className="w-2.5 h-2.5" />
                  +{item.foto.length - 1}
                </span>
              )}
            </div>
          ) : (
            <div className="h-10 bg-gradient-to-r from-surface-container-low to-surface-container-high" />
          )}

          <div className="p-3 space-y-2.5">
            {/* Judul + Kategori */}
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-surface-container-low rounded-lg text-[#677177]">
                <DynamicIcon iconName={item.kategori.icon} className="w-4 h-4" strokeWidth={1.5} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-[#2a3439] text-[13px] leading-snug line-clamp-2 !m-0">
                  {item.judul}
                </div>
                <div className="text-[11px] font-medium text-[#8a969c] leading-none mt-1 !m-0">
                  {item.kategori.nama}
                </div>
              </div>
            </div>

            {/* Data pelapor — hanya di tampilan admin */}
            <div className="space-y-1 py-2 border-t border-b border-gray-100">
              <div className="text-xs text-[#677177] flex items-center gap-1.5 !m-0">
                <User className="w-3 h-3 flex-shrink-0" strokeWidth={1.5} />
                <span className="font-medium text-[#2a3439]">{item.user.name}</span>
              </div>
              <div className="text-xs text-[#677177] flex items-center gap-1.5 !m-0">
                <Calendar className="w-3 h-3 flex-shrink-0" strokeWidth={1.5} />
                {formatDate(item.createdAt)}
              </div>
              {item.alamat && (
                <div className="text-xs text-[#677177] flex items-start gap-1.5 !m-0">
                  <MapPin className="w-3 h-3 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                  <span className="line-clamp-2">{item.alamat}</span>
                </div>
              )}
            </div>

            {/* Statistik */}
            <div className="flex items-center gap-3 text-xs text-[#677177]">
              <span className="flex items-center gap-1 font-medium">
                <ThumbsUp className="w-3 h-3" strokeWidth={1.5} />
                {item.voteCount} suara
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="w-3 h-3" strokeWidth={1.5} />
                {item._count.komentar} komentar
              </span>
            </div>

            {/* Aksi Cepat — eksklusif admin */}
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-[#677177] mb-1 !m-0">Ubah Status</div>
              <QuickStatusButtons
                id={item.id}
                currentStatus={item.status}
                onStatusUpdate={onStatusUpdate}
              />
            </div>

            {/* Link ke detail */}
            <Link
              href={`/laporan/${item.id}`}
              className="flex items-center justify-center gap-1.5 w-full py-1.5 border border-[#426464] text-[#426464] hover:bg-[#426464] hover:text-white text-xs font-medium rounded-md transition-colors"
            >
              <ExternalLink className="w-3 h-3" strokeWidth={2} />
              Lihat Halaman Detail
            </Link>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

// ─── Props & Komponen Utama ───────────────────────────────────────────────────
interface AdminMapViewProps {
  laporan: LaporanAdminMapItem[];
  selectedId?: string | null;
  onMarkerClick?: (id: string) => void;
  onStatusUpdate?: (id: string, newStatus: LaporanAdminMapItem['status']) => void;
}

export default function AdminMapView({ laporan, selectedId, onMarkerClick, onStatusUpdate }: AdminMapViewProps) {
  return (
    <MapContainer
      center={[-6.9175, 107.6191]}
      zoom={13}
      className="h-full w-full z-0"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {laporan.map((item) => (
        <AdminMarker
          key={item.id}
          item={item}
          isSelected={selectedId === item.id}
          onMarkerClick={onMarkerClick}
          onStatusUpdate={onStatusUpdate ?? (() => {})}
        />
      ))}
    </MapContainer>
  );
}
