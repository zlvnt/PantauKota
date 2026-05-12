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
  LocateFixed,
} from 'lucide-react';
import type { LaporanAdminMapItem } from '@/types/laporan';
import { getMarkerColor } from '@/types/laporan';
import Link from 'next/link';
import { DynamicIcon } from '@/components/ui/DynamicIcon';
import { CLOUDINARY_THUMBNAIL_IMAGE_OPTIONS, getCloudinaryImageUrl } from '@/lib/cloudinary';
import { initLeafletIcons, OSM_TILE_URL, OSM_ATTRIBUTION, MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM } from '@/lib/map';
import CompletionModal from '@/components/admin/CompletionModal';

// Inisialisasi icon Leaflet (mencegah broken image di Next.js)
initLeafletIcons();

// ─── Marker berwarna berdasarkan prioritas & status ───────────────────────────
// Prioritas (manual flag atau skor ≥30) → Merah
// Tidak prioritas → Warna sesuai status (Amber/Blue/Green)
function createAdminMarkerIcon(item: LaporanAdminMapItem) {
  const color = getMarkerColor(item.status, item.prioritas, item.voteCount, item.createdAt);
  const size = 32;
  const height = 42;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 42" width="${size}" height="${height}">
      <path d="M16 0C7.163 0 0 7.163 0 16c0 9.941 14.282 24.614 15.29 25.643a1 1 0 0 0 1.42 0C17.718 40.614 32 25.941 32 16 32 7.163 24.837 0 16 0z"
        fill="${color}" stroke="white" stroke-width="1.5"/>
      <circle cx="16" cy="16" r="6" fill="white" opacity="0.9"/>
    </svg>`;

  return L.divIcon({
    html: svg,
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
  judul,
  onStatusUpdate,
  onCompletionModalOpen,
}: {
  id: string;
  currentStatus: LaporanAdminMapItem['status'];
  judul: string;
  onStatusUpdate: (id: string, newStatus: LaporanAdminMapItem['status']) => void;
  onCompletionModalOpen: (id: string, judul: string) => void;
}) {
  const [loading, setLoading] = useState<string | null>(null);

  const updateStatus = async (newStatus: LaporanAdminMapItem['status']) => {
    if (newStatus === currentStatus) return;

    // If changing to SELESAI, open completion modal instead
    if (newStatus === 'SELESAI') {
      onCompletionModalOpen(id, judul);
      return;
    }

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
  onCompletionModalOpen,
}: {
  item: LaporanAdminMapItem;
  isSelected: boolean;
  onMarkerClick?: (id: string) => void;
  onStatusUpdate: (id: string, newStatus: LaporanAdminMapItem['status']) => void;
  onCompletionModalOpen: (id: string, judul: string) => void;
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
      icon={createAdminMarkerIcon(item)}
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
              <img
                src={getCloudinaryImageUrl(item.foto[0], CLOUDINARY_THUMBNAIL_IMAGE_OPTIONS)}
                alt={item.judul}
                className="w-full h-full object-cover"
              />
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
            <div className="space-y-1 py-2 bg-surface-container-low/50 rounded-lg px-2">
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
                judul={item.judul}
                onStatusUpdate={onStatusUpdate}
                onCompletionModalOpen={onCompletionModalOpen}
              />
            </div>

            {/* Link ke detail */}
            <Link
              href={`/dashboard/laporan/${item.id}`}
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

// ─── Sub-komponen: Memperbarui ukuran peta jika kontainer berubah (mengatasi peta abu-abu di kanan) ───
function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const container = map.getContainer();
    const observer = new ResizeObserver(() => {
      if (container && container.isConnected && container.clientWidth > 0 && container.clientHeight > 0) {
        map.invalidateSize(false);
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [map]);
  return null;
}

// ─── Sub-komponen: Tombol untuk kembali ke titik laporan ────────────────────
function RecenterButton({ laporan }: { laporan: LaporanAdminMapItem[] }) {
  const map = useMap();

  const handleRecenter = () => {
    if (laporan.length === 1) {
      map.flyTo([laporan[0].latitude, laporan[0].longitude], 16, { duration: 0.8 });
    } else if (laporan.length > 1) {
      const bounds = L.latLngBounds(laporan.map(l => [l.latitude, l.longitude]));
      map.flyToBounds(bounds, { padding: [50, 50], duration: 0.8 });
    } else {
      map.flyTo(MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM, { duration: 0.8 });
    }
  };

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleRecenter();
      }}
      className="absolute bottom-6 right-6 z-[1000] flex items-center justify-center bg-primary text-white p-3 rounded-full shadow-[0_4px_12px_rgba(42,52,57,0.3)] hover:bg-primary-dim transition-transform hover:scale-105 active:scale-95"
      title="Kembali ke Titik Peta"
    >
      <LocateFixed className="w-5 h-5" strokeWidth={2} />
    </button>
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
  const [completionModal, setCompletionModal] = useState<{ id: string; judul: string } | null>(null);

  const handleCompletionSubmit = async (data: { catatanAdmin: string; fotoPenyelesaian: string | null }) => {
    if (!completionModal) return;

    try {
      const res = await fetch(`/api/laporan/${completionModal.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'SELESAI',
          catatanAdmin: data.catatanAdmin,
          fotoPenyelesaian: data.fotoPenyelesaian, // bisa null
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Gagal mengubah status laporan');
      }

      onStatusUpdate?.(completionModal.id, 'SELESAI');
      setCompletionModal(null);
    } catch (error) {
      console.error('Error completing report:', error);
      throw error; // Re-throw untuk ditangkap oleh modal
    }
  };

  return (
    <>
      <MapContainer
        center={MAP_DEFAULT_CENTER}
        zoom={MAP_DEFAULT_ZOOM}
        className="h-full w-full z-0"
        scrollWheelZoom
      >
        <MapResizer />
        <RecenterButton laporan={laporan} />
        <TileLayer attribution={OSM_ATTRIBUTION} url={OSM_TILE_URL} />

        {laporan.map((item) => (
          <AdminMarker
            key={item.id}
            item={item}
            isSelected={selectedId === item.id}
            onMarkerClick={onMarkerClick}
            onStatusUpdate={onStatusUpdate ?? (() => {})}
            onCompletionModalOpen={(id, judul) => setCompletionModal({ id, judul })}
          />
        ))}
      </MapContainer>

      {completionModal && (
        <CompletionModal
          isOpen={!!completionModal}
          onClose={() => setCompletionModal(null)}
          onSubmit={handleCompletionSubmit}
          laporanJudul={completionModal.judul}
        />
      )}
    </>
  );
}
