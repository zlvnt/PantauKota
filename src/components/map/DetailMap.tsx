// 📁 src/components/map/DetailMap.tsx
// Peta sederhana untuk halaman detail laporan — hanya 1 marker
// File BARU — tidak akan konflik dengan MapView.tsx yang sudah ada

'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { MapPin } from 'lucide-react';

// Fix leaflet default icon (sama seperti di MapView.tsx)
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface DetailMapProps {
  latitude: number;
  longitude: number;
  judul: string;
  alamat?: string | null;
}

export default function DetailMap({ latitude, longitude, judul, alamat }: DetailMapProps) {
  return (
    <div className="h-56 rounded-xl overflow-hidden">
      <MapContainer
        center={[latitude, longitude]}
        zoom={16}
        className="h-full w-full z-0"
        scrollWheelZoom={false}
        // Disable drag on detail page agar scroll halaman tidak terganggu
        dragging={true}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[latitude, longitude]}>
          <Popup>
            <div className="text-sm space-y-1 min-w-[160px]">
              <p className="font-semibold text-foreground">{judul}</p>
              {alamat && (
                <p className="text-muted-foreground flex items-start gap-1">
                  <MapPin className="w-3 h-3 mt-0.5 shrink-0" strokeWidth={1.5} />
                  <span className="text-xs">{alamat}</span>
                </p>
              )}
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
