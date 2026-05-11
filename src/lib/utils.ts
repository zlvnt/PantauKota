import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { HOURS_24_MS, PRIORITY_VOTE_MULTIPLIER } from "./constants"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Menghitung batas waktu hapus laporan (24 jam dari createdAt)
 */
export function getDeleteDeadline(createdAt: Date | string): Date {
  const date = typeof createdAt === 'string' ? new Date(createdAt) : createdAt;
  return new Date(date.getTime() + HOURS_24_MS);
}

/**
 * Mengecek apakah laporan masih bisa dihapus
 */
export function canDeleteLaporan(
  createdAt: Date | string,
  status: string,
  isOwner: boolean
): boolean {
  if (!isOwner || status !== 'MENUNGGU') return false;
  const deadline = getDeleteDeadline(createdAt);
  return new Date() < deadline;
}

/**
 * Menghitung skor prioritas laporan
 * Formula: voteCount × 2 + hari sejak dibuat
 */
export function calculatePriorityScore(voteCount: number, createdAt: string | Date): number {
  const date = typeof createdAt === 'string' ? new Date(createdAt) : createdAt;
  const daysSince = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  return voteCount * PRIORITY_VOTE_MULTIPLIER + daysSince;
}

/**
 * Menghitung sisa waktu untuk hapus laporan
 */
export function getRemainingDeleteTime(createdAt: Date | string): string {
  const deadline = getDeleteDeadline(createdAt);
  const sisaMs = deadline.getTime() - Date.now();
  
  if (sisaMs <= 0) return '0 menit';
  
  const sisaJam = Math.floor(sisaMs / (1000 * 60 * 60));
  const sisaMenit = Math.floor((sisaMs % (1000 * 60 * 60)) / (1000 * 60));
  
  return sisaJam > 0 ? `${sisaJam} jam ${sisaMenit} menit` : `${sisaMenit} menit`;
}

/**
 * Validasi koordinat geografis
 */
export function isValidCoordinates(latitude: number, longitude: number): boolean {
  return latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
}

/**
 * Sanitize search query
 */
export function sanitizeSearchQuery(query: string | null, maxLength: number = 100): string | null {
  if (!query) return null;
  const trimmed = query.trim();
  if (trimmed.length < 2) return null;
  return trimmed.slice(0, maxLength);
}
