# 📚 Panduan Maintenance PantauKota

> **Update:** Mei 2026 — Tambah halaman /laporan-saya, hapus laporan, kamera web, kelola user, deteksi duplikasi, notifikasi email via Resend.

## 🏗️ Struktur Project

```
pantaukota/
├── prisma/                 # Database schema & migrations
│   ├── schema.prisma      # Model database
│   ├── seed.ts            # Data dummy untuk development
│   └── migrations/        # History migrasi database
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── (admin)/      # Route group untuk admin
│   │   │   ├── dashboard/ → Dashboard, detail laporan admin
│   │   │   ├── kelola-laporan/ → List semua laporan
│   │   │   ├── kelola-kategori/ → Manajemen kategori
│   │   │   └── kelola-user/ → Manajemen user
│   │   ├── (auth)/       # Login, Register
│   │   ├── (warga)/      # Route group untuk warga
│   │   │   ├── beranda/  → Dashboard (limit 3 laporan)
│   │   │   ├── laporan-saya/ → Daftar lengkap laporan warga
│   │   │   ├── laporan/buat/ → Form buat laporan
│   │   │   ├── laporan/[id]/ → Detail laporan warga
│   │   │   ├── peta/     → Peta interaktif
│   │   │   ├── notifikasi/ → Notifikasi
│   │   │   └── profil/   → Profil & ubah password
│   │   └── api/          # API endpoints
│   ├── components/        # React components
│   │   ├── admin/        # CompletionModal
│   │   ├── komentar/     # KomentarSection
│   │   ├── laporan/      # StatusTimeline, PrioritasScore, DeleteLaporanButton
│   │   ├── map/          # MapView, AdminMapView, LocationPicker
│   │   └── ui/           # Badge, Spinner, DynamicIcon, Toast, VoteButton, CameraModal
│   ├── hooks/            # useDebounce, useLaporanMap, useVote, useToast, useNotifications, useGeolocation
│   ├── lib/              # auth, map, prisma, notifications
│   └── types/            # laporan.ts (STATUS_CONFIG, LaporanSaya, getMarkerColor, dll)
└── public/               # Static assets
```

---

## 🔑 File Penting

### Database & ORM
- `prisma/schema.prisma` — Definisi model database (6 model: User, Laporan, Kategori, Vote, Notifikasi, Komentar)
- `src/lib/prisma.ts` — Konfigurasi Prisma Client dengan adapter PostgreSQL

### Autentikasi & Layanan Eksternal
- `src/lib/auth.ts` — Konfigurasi NextAuth.js
- `src/middleware.ts` — Middleware untuk proteksi route
- `src/lib/email.ts` — Utilitas pengiriman email via Resend

### API Endpoints
| File | Method | Fungsi |
|------|--------|--------|
| `src/app/api/laporan/route.ts` | GET, POST | List & buat laporan |
| `src/app/api/laporan/[id]/route.ts` | GET, PATCH, DELETE | Detail, update, hapus laporan |
| `src/app/api/kategori/route.ts` | GET, POST, PATCH, DELETE | Manajemen kategori |
| `src/app/api/vote/route.ts` | POST | Sistem voting |
| `src/app/api/komentar/route.ts` | GET, POST, DELETE | Sistem komentar |
| `src/app/api/upload/route.ts` | POST | Upload foto ke Cloudinary |
| `src/app/api/notifikasi/sse/route.ts` | GET | SSE real-time |

### Komponen Kritis
- `src/components/laporan/DeleteLaporanButton.tsx` — Tombol hapus laporan warga (validasi 24 jam + status)
- `src/components/ui/CameraModal.tsx` — Modal kamera web langsung
- `src/components/map/LocationPicker.tsx` — Picker lokasi dengan GPS + klik peta + reverse geocode
- `src/app/(warga)/laporan-saya/LaporanSayaClient.tsx` — Tabel lengkap laporan warga (search, filter, pagination)

---

## 🛠️ Cara Kerja Fitur Utama

### 1. Search & Filter Laporan
**File:** `src/app/api/laporan/route.ts`

```typescript
where: {
  AND: [
    ...(status ? [{ status }] : []),
    ...(kategoriId ? [{ kategoriId }] : []),
    ...(userId ? [{ userId }] : []),          // filter by user (laporan-saya)
    ...(search ? [{ OR: [...] }] : []),
    { OR: [/* auto-hide SELESAI > 24 jam */] }
  ]
}
```

### 2. Auto-Hide Laporan Selesai
Laporan dengan status SELESAI otomatis hilang dari peta setelah 24 jam.  
**Logic:** Tampilkan jika (BELUM SELESAI) ATAU (SELESAI tapi < 24 jam)

### 3. Sistem Prioritas
- **Manual:** Admin set flag `prioritas = true`
- **Otomatis:** Skor ≥ 50 (formula: `voteCount × 2 + hari_sejak_dibuat`)
- **Warna Marker:** Gunakan `getMarkerColor()` dari `src/types/laporan.ts`

### 4. Real-time Notifications
**File:** `src/app/api/notifikasi/sse/route.ts`  
Server-Sent Events — tidak perlu WebSocket.  
Trigger otomatis saat admin ubah status laporan.

### 5. Hapus Laporan (DELETE)
**File:** `src/app/api/laporan/[id]/route.ts`  
**Syarat (semua harus terpenuhi):**
1. User adalah pemilik (`userId === session.user.id`)
2. Laporan < 24 jam (`createdAt > now - 24h`)
3. Status = `MENUNGGU`

Gunakan `prisma.$transaction` untuk hapus relasi (komentar, votes, notifikasi) sebelum hapus laporan.

### 6. Dashboard Warga — Limit 3 Laporan
**File:** `src/app/(warga)/beranda/DashboardClient.tsx`  
- Tampilkan hanya 3 laporan terbaru (`laporan.slice(0, 3)`)
- Link "Lihat Semua →" di header section
- Tombol "Lihat Semua X Laporan" di bawah daftar jika total > 3

### 7. Halaman Laporan Saya
**Files:** `src/app/(warga)/laporan-saya/page.tsx` (Server Component) + `LaporanSayaClient.tsx` (Client Component)
- Fetch semua laporan user via `prisma.laporan.findMany({ where: { userId } })`
- Client: search real-time, filter status pills, pagination (10/halaman), stat strip
- Tombol hapus ikon `Trash2` muncul otomatis jika laporan masih bisa dihapus

### 8. Kamera Web (CameraModal)
**File:** `src/components/ui/CameraModal.tsx`  
- Gunakan `navigator.mediaDevices.getUserMedia({ video: true })`
- Capture via `<canvas>` → blob → upload ke Cloudinary
- Di mobile: `facingMode: 'environment'` (kamera belakang)
- Selalu `stopMediaStream()` saat modal ditutup untuk matikan kamera

### 9. Deteksi Duplikasi
**File:** `src/app/api/laporan/duplikat/route.ts`
- Menggunakan formula Haversine untuk menghitung jarak antara 2 koordinat (max 50 meter).
- Mengecek laporan pada kategori yang sama dan dibuat dalam 30 hari terakhir.

### 10. Kelola User API
**File:** `src/app/api/user/profile/[id]/route.ts`
- Endpoint untuk PATCH (toggle aktif/nonaktif) dan DELETE user.
- Terdapat validasi: Admin tidak bisa menonaktifkan atau menghapus akunnya sendiri.

### 11. Notifikasi Email Otomatis
**File:** `src/lib/email.ts` & `src/app/api/laporan/[id]/route.ts`
- Menggunakan **Resend** (`RESEND_API_KEY`).
- Berjalan asinkron secara *fire-and-forget* (tanpa `await`) setelah update status laporan, agar waktu respon API admin tidak tertunda.
- Base URL email di-generate via `process.env.NEXTAUTH_URL`.

---

## 🔧 Task Maintenance Umum

### Mengubah Limit Dashboard
**File:** `src/app/(warga)/beranda/DashboardClient.tsx`
```typescript
const LIMIT = 3; // Ubah nilai ini
```

### Mengubah Threshold Prioritas
**File:** `src/types/laporan.ts`
```typescript
if (priorityScore >= 50) { // Ubah 50 sesuai kebutuhan
  return PRIORITY_COLOR;
}
```

### Mengubah Durasi Hapus Laporan
**File:** `src/app/api/laporan/[id]/route.ts`
```typescript
const BATAS_JAM = 24; // Ubah menjadi jam yang diinginkan
const batasWaktu = new Date(createdAt.getTime() + BATAS_JAM * 60 * 60 * 1000);
```

### Mengubah Durasi Auto-Hide Peta
**File:** `src/app/api/laporan/route.ts`
```typescript
const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
```

### Menambah Field Search
**File:** `src/app/api/laporan/route.ts`
```typescript
OR: [
  { judul: { contains: search, mode: 'insensitive' as const } },
  { deskripsi: { contains: search, mode: 'insensitive' as const } },
  { alamat: { contains: search, mode: 'insensitive' as const } },
  // Tambah field baru di sini
]
```

---

## 📐 Pola Layout Halaman Detail (STANDAR)

Semua halaman detail laporan (warga & admin) menggunakan **grid 2 kolom** yang sama:

```
DESKTOP (lg):                    MOBILE:
┌─────────────┬──────────┐      ┌──────────────────┐
│  Foto       │  Peta    │      │  Foto            │
│  Deskripsi  │  Timeline│      │  Deskripsi       │
├─────────────┤  (sticky)│      │  Peta            │
│  Komentar   │          │      │  Timeline        │
└─────────────┴──────────┘      │  Komentar ← LAST │
                                 └──────────────────┘
```

**Grid Classes:**
- Kiri atas: `lg:col-span-7`
- Kanan: `lg:col-span-5 lg:row-span-2`
- Komentar (grid item ke-3): `lg:col-span-7`

---

## 📝 Konvensi Kode

### Naming
- **Components:** PascalCase (`DeleteLaporanButton.tsx`)
- **Hooks:** camelCase + prefix `use` (`useDebounce.ts`)
- **API Routes:** lowercase (`route.ts`)
- **Types:** PascalCase (`LaporanSaya`)
- **Page Client:** `[NamaHalaman]Client.tsx` (co-located dengan `page.tsx`)

### Struktur Component
```typescript
// 1. Imports
import { ... } from '...';

// 2. Types/Interfaces (jika tidak ada di types/laporan.ts)
interface Props { ... }

// 3. Helper/sub-components kecil (jika digunakan hanya di sini)
function SubComponent({ ... }) { ... }

// 4. Main component
export default function Component({ props }: Props) {
  // 4a. State & hooks
  // 4b. Derived values (useMemo)
  // 4c. Effects
  // 4d. Handlers
  // 4e. Render
}
```

### Server vs Client Component
- **Server Component (`page.tsx`):** Fetch data dari DB, tidak ada state/event
- **Client Component (`*Client.tsx`):** State, event handler, interaktivitas
- **Pattern:** `page.tsx` (server) fetch data → pass ke `*Client.tsx` (client)

### Comments
- `//` untuk komentar pendek
- `// ──` untuk section divider
- `// KOLOM KIRI`, `// KOLOM KANAN` untuk grid section

---

## 🚀 Deployment Checklist

### Developer Baru
- [ ] Clone repository
- [ ] `npm install`
- [ ] Pastikan `.env` ada (dengan `DATABASE_URL`)
- [ ] `npx prisma generate`
- [ ] `npm run dev`
- [ ] ❌ **JANGAN** jalankan `npm run seed` (data sudah ada)
- [ ] ❌ **JANGAN** jalankan migrasi (database sudah ter-setup)

### Sebelum Commit
- [ ] `npx tsc --noEmit` — pastikan tidak ada TypeScript error
- [ ] Test di mobile viewport (360px) dan desktop (1280px+)
- [ ] Tidak ada kode duplikat tertumpuk di file

### Production Deployment
- [ ] Update `NEXTAUTH_SECRET` dengan nilai random yang kuat
- [ ] Set `NEXTAUTH_URL` ke URL production
- [ ] Verifikasi `DATABASE_URL` production
- [ ] Set Cloudinary credentials
- [ ] `npm run build`
- [ ] `npx prisma migrate deploy`

---