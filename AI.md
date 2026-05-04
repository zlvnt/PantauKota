# AI.md — Panduan AI untuk PantauKota

> **Baca sebelum coding.** Update: Mei 2026 (Responsivitas Desktop, Dashboard Limit, Halaman /laporan-saya, Hapus Laporan, Kamera Web)

## 1. Identitas & Prinsip

**PantauKota** — PWA pelaporan perkotaan (Next.js 14 App Router)  
**Aktor:** Warga (lapor, vote, komentar) | Admin (tinjau, ubah status, kelola)

### Prinsip Desain (Detail: `DESIGN.md`)
- ❌ **No Glassmorphism** — Warna solid, no transparency
- ❌ **No-Line Rule** — Pemisah pakai whitespace/tonal, bukan border 1px
- ✅ **Floating UI** — Navbar/sidebar melayang, `rounded-2xl`, shadow ambient
- ✅ **Tonal Layering** — `surface` → `surface-container-lowest/low/high`
- ✅ **Responsive** — Mobile (360px) to desktop (1440px+), `max-w-6xl` untuk halaman warga

**Warna:** `primary` #426464 | `tertiary` #006d4a (SELESAI) | `error` #B3261E

---

## 2. Arsitektur

### Rute & Guards
```
/app
├── (auth)/         → Login/Register (publik)
├── (warga)/        → Guard: login | WargaNavbar
│   ├── beranda/    → Dashboard warga (limit 3 laporan + link Lihat Semua)
│   ├── laporan-saya/ → Halaman penuh daftar laporan warga
│   ├── laporan/buat/ → Form buat laporan (grid 2 kolom desktop)
│   ├── laporan/[id]/ → Detail laporan warga (grid 2 kolom desktop)
│   ├── peta/       → Peta warga
│   ├── notifikasi/ → Notifikasi warga
│   └── profil/     → Profil warga
└── (admin)/        → Guard: ADMIN | AdminSidebar
    ├── dashboard/  → Dashboard admin
    ├── dashboard/laporan/[id]/ → Detail laporan admin (grid 2 kolom desktop)
    ├── kelola-laporan/ → List semua laporan
    ├── kelola-kategori/ → Manajemen kategori
    └── kelola-user/ → Manajemen user
```

### Layout Grid Dua Kolom (POLA STANDAR — halaman detail)
```tsx
// Desktop: 2 kolom | Mobile: 1 kolom, urutan DOM = urutan tampil
<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
  {/* Kolom kiri atas: konten utama */}
  <div className="lg:col-span-7 space-y-6">
    {/* Foto, Deskripsi */}
  </div>

  {/* Kolom kanan: sidebar sticky, row-span-2 */}
  <div className="lg:col-span-5 lg:row-span-2">
    <div className="lg:sticky lg:top-24 space-y-6">
      {/* Peta, Timeline */}
    </div>
  </div>

  {/* Kolom kiri bawah: SELALU TERAKHIR (komentar) */}
  <div className="lg:col-span-7">
    {/* Komentar */}
  </div>
</div>
```

> **PENTING:** Komentar **harus** menjadi grid item terpisah di bawah, bukan di dalam `lg:col-span-7` atas. Ini memastikan komentar tampil di bawah di mobile (setelah Peta & Timeline).

### Leaflet Config
**File:** `src/lib/map.ts` — `OSM_TILE_URL`, `MAP_DEFAULT_CENTER`, `initLeafletIcons()`  
**Fix SSR:** Panggil `initLeafletIcons()` di level module  
**MapResizer:** Wajib di `<MapContainer>` untuk prevent abu-abu saat resize

---

## 3. Komponen Reusable (WAJIB PAKAI)

| Komponen | Import | Usage |
|----------|--------|-------|
| **StatusBadge** | `@/components/ui/Badge` | `<StatusBadge status="MENUNGGU" />` |
| **Spinner** | `@/components/ui/Spinner` | `<Spinner size="sm\|md\|lg" />` |
| **DynamicIcon** | `@/components/ui/DynamicIcon` | `<DynamicIcon iconName={kat.icon} />` |
| **Toast** | `@/components/ui/Toast` + `useToast` | `success('OK')` `error('Fail')` |
| **VoteButton** | `@/components/ui/VoteButton` | Optimistic UI, unlimited vote |
| **StatusTimeline** | `@/components/laporan/StatusTimeline` | 3 tahap tracking |
| **PrioritasScore** | `@/components/laporan/PrioritasScore` | Badge skor prioritas |
| **CompletionModal** | `@/components/admin/CompletionModal` | Modal selesaikan laporan |
| **DeleteLaporanButton** | `@/components/laporan/DeleteLaporanButton` | Hapus laporan (warga, < 24 jam, MENUNGGU) |
| **CameraModal** | `@/components/ui/CameraModal` | Ambil foto langsung via kamera |
| **LocationPicker** | `@/components/map/LocationPicker` | Pilih lokasi + GPS + klik peta |

**Toast Rules:** ✅ Semua feedback | ❌ Jangan inline error `<div className="bg-error/10">`

---

## 4. Hooks Custom (WAJIB PAKAI)

| Hook | Fungsi |
|------|--------|
| **useDebounce** | Delay nilai (jangan setTimeout manual) |
| **useLaporanMap** | Fetch peta dengan filter |
| **useGeolocation** | GPS browser |
| **useVote** | Vote optimistic UI, unlimited |
| **useToast** | Toast notifications |
| **useNotifications** | Fetch + SSE real-time |

---

## 5. Notifikasi Real-Time (SSE)

**Files:** `src/lib/notifications.ts`, `src/app/api/notifikasi/sse/route.ts`  
**Trigger:** Admin ubah status → notif ke pemilik

**Tambah Trigger:**
```typescript
import { kirimNotifikasi } from '@/lib/notifications';
await kirimNotifikasi({ userId, judul, pesan, laporanId });
```

---

## 6. Prioritas & Marker Warna

### Formula
```typescript
score = (voteCount × 2) + hari_sejak_dibuat
```

### Warna Marker (CRITICAL)
**File:** `src/types/laporan.ts` → `getMarkerColor()`

1. **SELESAI** → Hijau (#006d4a) — selalu
2. **Prioritas (belum selesai)** → Merah (#dc2626) jika flag=true ATAU skor≥50
3. **Non-Prioritas** → MENUNGGU=Amber, DIPROSES=Blue

**WAJIB:** Gunakan `getMarkerColor()`, jangan buat logic sendiri

### Completion Modal (TC-11.3)
**File:** `src/components/admin/CompletionModal.tsx`  
**Input:** Catatan (wajib), Foto (opsional, max 5MB)  
**API:** `PATCH /api/laporan/[id]` → `{ status, catatanAdmin, fotoPenyelesaian: string|null }`

---

## 7. Tipe Data & API

### Tipe (`src/types/laporan.ts`)
```typescript
STATUS_CONFIG.MENUNGGU/DIPROSES/SELESAI
PRIORITY_COLOR, getMarkerColor()
LaporanMapItem, LaporanAdminMapItem, LaporanDetail, LaporanSaya, KategoriItem
```

### API Routes
| Method | Endpoint | Fungsi |
|--------|----------|--------|
| GET | `/api/laporan` | List (query: status, kategoriId, search, adminView, userId) |
| PATCH | `/api/laporan/[id]` | Update status, prioritas, catatanAdmin, fotoPenyelesaian |
| DELETE | `/api/laporan/[id]` | Hapus laporan (owner, < 24 jam, status MENUNGGU) |
| POST | `/api/vote` | Toggle vote (unlimited) |
| POST | `/api/upload` | Upload foto (max 5MB) |
| GET | `/api/notifikasi/sse` | SSE stream |

---

## 8. Aturan Bisnis Penting

### Hapus Laporan (DELETE /api/laporan/[id])
Laporan hanya bisa dihapus jika **semua** syarat terpenuhi:
1. User adalah pemilik laporan (`userId === session.user.id`)
2. Laporan berusia < 24 jam (`createdAt > now - 24h`)
3. Status masih **MENUNGGU** (belum diproses admin)

Penghapusan dilakukan via `prisma.$transaction` untuk menghapus relasi (komentar, votes, notifikasi) terlebih dahulu sebelum laporan dihapus.

### Dashboard Warga — Limit Laporan
Di `/beranda`, daftar laporan dibatasi **3 item terbaru** saja. Ada tombol "Lihat Semua →" menuju `/laporan-saya` di header section, dan tombol "Lihat Semua X Laporan" di bagian bawah daftar jika total > 3.

### Kamera Web (CameraModal)
Komponen `CameraModal` mengakses `navigator.mediaDevices.getUserMedia()`. Di desktop (Chromium), kamera aktif hanya setelah user grant permission browser. Hindari memanggil getUserMedia di luar interaksi user (klik button).

---

## 9. Pola Kode (CRITICAL PATTERNS)

### Responsive Layout — max-width standard
```tsx
// Halaman warga: max-w-6xl (mengisi penuh desktop)
<div className="max-w-6xl mx-auto px-4 sm:px-6">

// Halaman admin: max-w-7xl (sidebar menyempitkan ruang)
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
```

### Box Foto & Konten — Ukuran Seragam
```tsx
// Foto card (fixed height agar sama tinggi dengan deskripsi)
<div className="relative bg-surface-container-lowest rounded-2xl shadow-ambient overflow-hidden h-72 sm:h-80">
  <img className="w-full h-full object-cover" />
</div>

// Deskripsi card (min-height sesuai foto)
<div className="bg-surface-container-lowest rounded-2xl shadow-ambient p-6 sm:p-8 min-h-[288px] sm:min-h-[320px] flex flex-col">
  <p className="flex-1">...</p>
</div>
```

### Password Visibility Toggle
```tsx
const [showPassword, setShowPassword] = useState(false);
<button
  type="button"  // Prevent form submit
  onClick={() => setShowPassword(!showPassword)}
  tabIndex={-1}  // Prevent focus interference
>
  {showPassword ? <EyeOff /> : <Eye />}
</button>
```

### Debounce
```tsx
const debouncedSearch = useDebounce(searchQuery, 400);
```

### Badge Status
```tsx
<StatusBadge status={item.status} />
```

### Leaflet Config
```tsx
import { initLeafletIcons, OSM_TILE_URL, MAP_DEFAULT_CENTER } from '@/lib/map';
initLeafletIcons();
<TileLayer url={OSM_TILE_URL} />
```

---

## 10. Checklist Fitur Baru

- [ ] Pakai komponen reusable? (Spinner, StatusBadge, Toast, CompletionModal, DeleteLaporanButton)
- [ ] Pakai hook existing? (useDebounce, useToast, useVote, useLaporanMap)
- [ ] Responsif mobile-desktop? (`max-w-6xl`, grid `lg:grid-cols-12`)
- [ ] `overflow-x: hidden` untuk prevent horizontal scroll?
- [ ] Password toggle pattern benar? (`type="button"`, `tabIndex={-1}`)
- [ ] Button text `text-white` untuk high contrast?
- [ ] Marker color pakai `getMarkerColor()`?
- [ ] No border 1px untuk pemisah (No-Line Rule)?
- [ ] No glassmorphism?
- [ ] Toast untuk feedback (bukan inline error)?
- [ ] Foto upload max 5MB?
- [ ] Leaflet import dari `lib/map.ts` + `<MapResizer />`?
- [ ] Komentar sebagai grid item terpisah (selalu paling bawah di mobile)?
- [ ] Aturan bisnis hapus laporan diterapkan di API (< 24 jam + MENUNGGU + owner)?
- [ ] `npx tsc --noEmit` sebelum commit?

---

## 11. Anti-Redundansi

### Jangan Buat Duplikat
- ✅ Cek `src/components/ui/`, `src/hooks/` dulu
- ❌ Jangan buat komponen/hook baru jika sudah ada
- ❌ Jangan buat inline error messages (pakai Toast)
- ❌ Jangan buat password toggle logic sendiri
- ❌ Jangan buat marker color logic sendiri
- ❌ Jangan biarkan kode duplikat tertumpuk di file (tulis ulang bersih)

### File Sensitif (Jangan Modifikasi Sembarangan)
- `prisma/schema.prisma` — Perlu migrasi
- `src/middleware.ts` — Route protection
- `src/lib/auth.ts` — NextAuth config
- `src/lib/prisma.ts` — Singleton
- `src/types/laporan.ts` — Shared types
- `src/app/globals.css` — Global styles
- `DESIGN.md` — Design system

---

*Update setiap PBI selesai.*
