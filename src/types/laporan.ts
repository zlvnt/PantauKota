<<<<<<< Updated upstream
// Tipe data untuk peta (subset ringan, hanya field yang dibutuhkan)
=======
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
>>>>>>> Stashed changes
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


// Tipe data lengkap untuk halaman detail (PBI-09)
export interface LaporanDetail extends LaporanMapItem {
  deskripsi: string;
  foto: string[];
  catatanAdmin: string | null;
  fotoPenyelesaian: string | null;
  selesaiAt: string | null;
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
