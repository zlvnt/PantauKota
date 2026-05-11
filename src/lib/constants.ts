/**
 * Konstanta global untuk PantauKota
 * Centralized constants untuk menghindari magic numbers
 */

// ── Waktu & Durasi ──
export const HOURS_24_MS = 24 * 60 * 60 * 1000;
export const TOAST_DURATION_MS = 3000;
export const GEOLOCATION_TIMEOUT_MS = 10000;
export const DEBOUNCE_DELAY_MS = 400;

// ── File Upload ──
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
export const ALLOWED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// ── Prioritas Laporan ──
export const PRIORITY_THRESHOLD = 50;
export const PRIORITY_VOTE_MULTIPLIER = 2;

// ── Pagination ──
export const LAPORAN_PER_PAGE = 10;
export const DASHBOARD_LAPORAN_LIMIT = 3;

// ── Deteksi Duplikasi ──
export const DUPLICATE_RADIUS_METERS = 50;
export const DUPLICATE_DAYS_THRESHOLD = 30;

// ── Search ──
export const MIN_SEARCH_LENGTH = 2;
export const MAX_SEARCH_LENGTH = 100;

// ── Geolocation ──
export const LATITUDE_MIN = -90;
export const LATITUDE_MAX = 90;
export const LONGITUDE_MIN = -180;
export const LONGITUDE_MAX = 180;
