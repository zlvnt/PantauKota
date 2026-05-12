import { PRIORITY_THRESHOLD } from '@/lib/constants';
import { calculatePriorityScore } from '@/lib/utils';

// ─── Tipe untuk dashboard warga (/api/laporan/saya) ────────────────────────
export interface LaporanSaya {
  id: string;
  judul: string;
  alamat: string | null;
  status: 'MENUNGGU' | 'DIPROSES' | 'SELESAI';
  prioritas: boolean;
  voteCount: number;
  createdAt: string;
  foto: string[];
  catatanAdmin: string | null;
  fotoPenyelesaian: string | null;
  selesaiAt: string | null;
  kategori: {
    id: string;
    nama: string;
    icon: string | null;
    warna: string | null;
  };
  _count: {
    komentar: number;
  };
  _hasVoted?: boolean; // true jika user sudah vote laporan ini
}

// ─── Tipe untuk chips filter di peta (/api/kategori) ───────────────────────
export interface KategoriItem {
  id: string;
  nama: string;
  icon: string | null;
  warna: string | null;
}

// ─── Tipe data untuk peta (subset ringan, hanya field yang dibutuhkan) ──────
export interface LaporanMapItem {
  id: string;
  judul: string;
  latitude: number;
  longitude: number;
  alamat: string | null;
  status: 'MENUNGGU' | 'DIPROSES' | 'SELESAI';
  prioritas: boolean;
  voteCount: number;
  createdAt: string;
  foto: string[];
  kategori: {
    id: string;
    nama: string;
    icon: string | null;
    warna: string | null;
  };
  _count: {
    komentar: number;
  };
  _hasVoted?: boolean; // true jika user sudah vote laporan ini
}

// Tipe admin — sama dengan LaporanMapItem tapi include nama pelapor
export interface LaporanAdminMapItem extends LaporanMapItem {
  user: {
    id: string;
    name: string;
  };
}


// Label & warna untuk status laporan
export const STATUS_CONFIG = {
  MENUNGGU: {
    label: 'Menunggu',
    color: '#f59e0b',    // amber
    bgClass: 'bg-amber-100 text-amber-800',
    dotClass: 'bg-amber-400',
  },
  DIPROSES: {
    label: 'Diproses',
    color: '#3b82f6',    // blue
    bgClass: 'bg-blue-100 text-blue-800',
    dotClass: 'bg-blue-400',
  },
  SELESAI: {
    label: 'Selesai',
    color: '#006d4a',    // tertiary (sesuai DESIGN.md)
    bgClass: 'bg-green-100 text-green-800',
    dotClass: 'bg-green-500',
  },
} as const;

export type LaporanStatus = 'MENUNGGU' | 'DIPROSES' | 'SELESAI';

// Warna prioritas untuk marker (merah untuk laporan prioritas tinggi)
export const PRIORITY_COLOR = '#dc2626'; // red-600

/**
 * Helper function: Menentukan warna marker berdasarkan prioritas dan status
 * 
 * Logic:
 * 1. Jika status = SELESAI → HIJAU (selalu, terlepas dari prioritas)
 * 2. Jika prioritas manual (flag) = true → MERAH
 * 3. Jika skor prioritas ≥ threshold → MERAH
 * 4. Jika tidak prioritas → warna sesuai status
 * 
 * Formula skor: (voteCount × 2) + jumlah_hari_sejak_dibuat
 */
export function getMarkerColor(
  status: LaporanStatus,
  prioritas: boolean,
  voteCount: number,
  createdAt: string
): string {
  // Laporan selesai selalu hijau, terlepas dari prioritas
  if (status === 'SELESAI') {
    return STATUS_CONFIG.SELESAI.color;
  }

  // Prioritas manual untuk laporan yang belum selesai → merah
  if (prioritas) {
    return PRIORITY_COLOR;
  }

  // Hitung skor prioritas otomatis untuk laporan yang belum selesai
  const priorityScore = calculatePriorityScore(voteCount, createdAt);

  // Jika skor ≥ threshold, gunakan warna merah (prioritas darurat)
  if (priorityScore >= PRIORITY_THRESHOLD) {
    return PRIORITY_COLOR;
  }

  // Jika tidak prioritas, gunakan warna status
  return STATUS_CONFIG[status].color;
}

