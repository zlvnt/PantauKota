'use client';

import { useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, LocateFixed, Loader2 } from 'lucide-react';
import { useGeolocation } from '@/hooks/useGeolocation';

// Fix leaflet default marker icon
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface LocationPickerProps {
  value: { latitude: number; longitude: number } | null;
  onChange: (coords: { latitude: number; longitude: number; alamat?: string }) => void;
}

function MapClickHandler({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function MapRecenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMapEvents({});
  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
}

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
    );
    const data = await res.json();
    return data.display_name ?? '';
  } catch {
    return '';
  }
}

export default function LocationPicker({ value, onChange }: LocationPickerProps) {
  const { latitude, longitude, loading, error, getCurrentPosition } = useGeolocation();
  const pendingGps = useRef<'init' | 'manual' | null>('init');

  const handleMapClick = useCallback(
    async (lat: number, lng: number) => {
      const alamat = await reverseGeocode(lat, lng);
      onChange({ latitude: lat, longitude: lng, alamat });
    },
    [onChange]
  );

  // Auto-locate sekali saat mount jika belum ada value
  useEffect(() => {
    if (!value && pendingGps.current === 'init') {
      getCurrentPosition();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Jalankan handleMapClick hanya saat GPS return (init atau manual)
  useEffect(() => {
    if (latitude != null && longitude != null && pendingGps.current !== null) {
      pendingGps.current = null;
      handleMapClick(latitude, longitude);
    }
  }, [latitude, longitude, handleMapClick]);

  const handleGpsClick = () => {
    pendingGps.current = 'manual';
    getCurrentPosition();
  };

  const center: [number, number] = value
    ? [value.latitude, value.longitude]
    : [-6.2, 106.816];

  return (
    <div className="space-y-3">
      <div
        className="relative rounded-[0.375rem] overflow-hidden bg-surface-container-low"
        style={{ height: 320 }}
      >
        <MapContainer
          center={center}
          zoom={14}
          className="h-full w-full z-0"
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onChange={handleMapClick} />
          {value && (
            <>
              <Marker position={[value.latitude, value.longitude]} />
              <MapRecenter lat={value.latitude} lng={value.longitude} />
            </>
          )}
        </MapContainer>

        {/* GPS Button */}
        <button
          type="button"
          onClick={handleGpsClick}
          disabled={loading}
          className="absolute bottom-3 right-3 z-[1000] flex items-center gap-1.5 bg-surface-container-lowest/80 backdrop-blur-xl text-on-surface px-3 py-2 rounded-[0.375rem] shadow-ambient text-sm font-semibold hover:bg-surface-container-lowest disabled:opacity-50 transition-colors"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} />
          ) : (
            <LocateFixed className="w-4 h-4" strokeWidth={1.5} />
          )}
          Lokasi Saya
        </button>
      </div>

      {/* Info */}
      {error && (
        <p className="text-xs text-error flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} /> {error}
        </p>
      )}
      {value && (
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
          {value.latitude.toFixed(6)}, {value.longitude.toFixed(6)}
        </p>
      )}
      {!value && !loading && (
        <p className="text-sm text-muted-foreground">Klik peta atau tekan tombol untuk memilih lokasi.</p>
      )}
    </div>
  );
}
