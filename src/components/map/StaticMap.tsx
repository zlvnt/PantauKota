'use client';

import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { initLeafletIcons, OSM_TILE_URL, OSM_ATTRIBUTION } from '@/lib/map';
import { STATUS_CONFIG } from '@/types/laporan';
import type { Status } from '@prisma/client';

initLeafletIcons();

// Buat icon marker custom sesuai warna kategori
function createMarkerIcon(status: Status, warna?: string | null) {
  const color = warna ?? STATUS_CONFIG[status]?.color ?? '#426464';
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
  });
}

interface StaticMapProps {
  latitude: number;
  longitude: number;
  status: Status;
  warnaKategori?: string | null;
}

export default function StaticMap({ latitude, longitude, status, warnaKategori }: StaticMapProps) {
  const position: [number, number] = [latitude, longitude];

  return (
    <div className="h-48 w-full rounded-[0.375rem] overflow-hidden bg-surface-container-low isolate relative z-0">
      <MapContainer
        center={position}
        zoom={16}
        scrollWheelZoom={false}
        dragging={false}
        zoomControl={false}
        doubleClickZoom={false}
        touchZoom={false}
        className="h-full w-full"
      >
        <TileLayer attribution={OSM_ATTRIBUTION} url={OSM_TILE_URL} />
        <Marker position={position} icon={createMarkerIcon(status, warnaKategori)} />
      </MapContainer>
      
      {/* Overlay tak terlihat untuk mencegah segala interaksi mouse jika ada yang bocor */}
      <div className="absolute inset-0 z-[1000] cursor-default" />
    </div>
  );
}
