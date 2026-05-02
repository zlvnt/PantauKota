/**
 * lib/map.ts
 * Konfigurasi Leaflet yang dipakai bersama oleh MapView, AdminMapView, dan LocationPicker.
 * Dengan memusatkannya di sini, perubahan tile provider atau icon cukup dilakukan di satu tempat.
 */

import L from 'leaflet';

// ─── Tile Layer ───────────────────────────────────────────────────────────────
export const OSM_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
export const OSM_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

// Koordinat pusat default peta (Bandung)
export const MAP_DEFAULT_CENTER: [number, number] = [-6.9175, 107.6191];
export const MAP_DEFAULT_ZOOM = 13;

// ─── Fix Leaflet default icon (Next.js SSR workaround) ───────────────────────
// Leaflet mencari _getIconUrl di prototype, dan gagal di lingkungan SSR/bundler.
// Solusinya adalah hapus method tersebut dan set URL ikon secara eksplisit.
export function initLeafletIcons() {
  delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
}
