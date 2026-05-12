'use client';

import { useEffect, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  ZoomControl,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, ThumbsUp, MessageCircle, ArrowRight, Image as ImageIcon, LocateFixed } from 'lucide-react';
import type { LaporanMapItem } from '@/types/laporan';
import { STATUS_CONFIG, getMarkerColor } from '@/types/laporan';
import Link from 'next/link';
import { DynamicIcon } from '@/components/ui/DynamicIcon';
import { CLOUDINARY_THUMBNAIL_IMAGE_OPTIONS, getCloudinaryImageUrl } from '@/lib/cloudinary';
import { initLeafletIcons, OSM_TILE_URL, OSM_ATTRIBUTION, MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM } from '@/lib/map';

// Inisialisasi icon Leaflet (mencegah broken image di Next.js)
initLeafletIcons();

// ─── Marker berwarna berdasarkan prioritas & status ───────────────────────────
// Prioritas (manual flag atau skor ≥30) → Merah
// Tidak prioritas → Warna sesuai status (Amber/Blue/Green)
function createStatusIcon(item: LaporanMapItem) {
  const color = getMarkerColor(item.status, item.prioritas, item.voteCount, item.createdAt);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 42" width="32" height="42">
      <path d="M16 0C7.163 0 0 7.163 0 16c0 9.941 14.282 24.614 15.29 25.643a1 1 0 0 0 1.42 0C17.718 40.614 32 25.941 32 16 32 7.163 24.837 0 16 0z"
        fill="${color}" stroke="white" stroke-width="1.5"/>
      <circle cx="16" cy="16" r="6" fill="white" opacity="0.9"/>
    </svg>`;
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -44],
  });
}

// ─── Sub-komponen Marker: punya akses ke map instance ─────────────────────────
// Dipisah agar bisa menggunakan useMap() yang hanya tersedia di dalam MapContainer
function LaporanMarker({
  item,
  isSelected,
  onMarkerClick,
}: {
  item: LaporanMapItem;
  isSelected: boolean;
  onMarkerClick?: (id: string) => void;
}) {
  const map = useMap();
  const markerRef = useRef<L.Marker>(null);

  // Saat laporan ini dipilih dari sidebar → fly to & buka popup
  useEffect(() => {
    if (!isSelected) return;
    // Fly ke posisi marker, geser sedikit ke atas agar popup penuh terlihat
    map.flyTo([item.latitude - 0.004, item.longitude], 16, { duration: 0.7 });
    // Buka popup setelah animasi selesai
    const timer = setTimeout(() => markerRef.current?.openPopup(), 750);
    return () => clearTimeout(timer);
  }, [isSelected, item.latitude, item.longitude, map]);

  return (
    <Marker
      ref={markerRef}
      position={[item.latitude, item.longitude]}
      icon={createStatusIcon(item)}
      eventHandlers={{
        click: () => {
          onMarkerClick?.(item.id);
          // Fly to & buka popup — sama dengan klik sidebar
          map.flyTo([item.latitude - 0.004, item.longitude], 16, { duration: 0.7 });
          setTimeout(() => markerRef.current?.openPopup(), 750);
        },
      }}
    >
      {/* autoPan + padding agar popup tidak terpotong tepi layar */}
      <Popup
        autoPan
        autoPanPadding={[60, 80]}
        minWidth={260}
        maxWidth={300}
        closeButton={false}
      >
        <div className="font-sans space-y-0 overflow-hidden rounded-lg" style={{ margin: '-7px -11px' }}>

          {/* Gambar laporan (jika ada) */}
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

          {/* Konten popup */}
          <div className="p-3 space-y-2.5">
            {/* Header: icon + judul */}
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

            {/* Status badge */}
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_CONFIG[item.status].bgClass}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[item.status].dotClass}`} />
              {STATUS_CONFIG[item.status].label}
            </span>

            {/* Lokasi */}
            {item.alamat && (
              <div className="text-xs text-[#677177] flex items-start gap-1 !m-0">
                <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                <span className="line-clamp-2">{item.alamat}</span>
              </div>
            )}

            {/* Statistik */}
            <div className="flex items-center gap-3 text-xs text-[#677177]">
              <span className="flex items-center gap-1">
                <ThumbsUp className="w-3 h-3" strokeWidth={1.5} />
                {item.voteCount} suara
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="w-3 h-3" strokeWidth={1.5} />
                {item._count.komentar} komentar
              </span>
            </div>

            {/* Tombol lihat detail */}
            <Link
              href={`/laporan/${item.id}`}
              className="flex items-center justify-center gap-1.5 w-full py-2 bg-primary hover:bg-primary-dim text-sm font-semibold rounded-md transition-colors shadow-sm"
              style={{ color: '#ffffff' }}
            >
              Lihat Detail
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} style={{ color: '#ffffff' }} />
            </Link>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

// ─── Sub-komponen: Memperbarui ukuran peta jika kontainer berubah ───
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
function RecenterButton({ laporan }: { laporan: LaporanMapItem[] }) {
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

// ─── Props ────────────────────────────────────────────────────────────────────
interface MapViewProps {
  laporan: LaporanMapItem[];
  selectedId?: string | null;
  onMarkerClick?: (id: string) => void;
}

// ─── Komponen Utama ───────────────────────────────────────────────────────────
export default function MapView({ laporan, selectedId, onMarkerClick }: MapViewProps) {
  return (
    <MapContainer
      center={MAP_DEFAULT_CENTER}
      zoom={MAP_DEFAULT_ZOOM}
      className="h-full w-full z-0"
      scrollWheelZoom
      zoomControl={false}
    >
      <MapResizer />
      <RecenterButton laporan={laporan} />
      <ZoomControl position="bottomleft" />

      <TileLayer attribution={OSM_ATTRIBUTION} url={OSM_TILE_URL} />

      {laporan.map((item) => (
        <LaporanMarker
          key={item.id}
          item={item}
          isSelected={selectedId === item.id}
          onMarkerClick={onMarkerClick}
        />
      ))}
    </MapContainer>
  );
}
