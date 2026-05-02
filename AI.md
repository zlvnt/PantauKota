# AI.md — Panduan AI untuk PantauKota

> **Baca sebelum coding.** Update: Mei 2026 (PBI-10,11,12 + TC-11.3,12.3 selesai)

## 1. Identitas & Prinsip

**PantauKota** — PWA pelaporan perkotaan (Next.js 14 App Router)  
**Aktor:** Warga (lapor, vote, komentar) | Admin (tinjau, ubah status, kelola)

### Prinsip Desain (Detail: `DESIGN.md`)
- ❌ **No Glassmorphism** — Warna solid, no transparency
- ❌ **No-Line Rule** — Pemisah pakai whitespace/tonal, bukan border 1px
- ✅ **Floating UI** — Navbar/sidebar melayang, `rounded-3xl`, shadow ambient
- ✅ **Tonal Layering** — `surface` → `surface-container-lowest/low/high`
- ✅ **Responsive** — Mobile (360px) to desktop (1440px+)

**Warna:** `primary` #426464 | `tertiary` #006d4a (SELESAI) | `error` #B3261E

---

## 2. Arsitektur

### Rute & Guards
```
/app
├── (auth)/       → Login/Register (publik)
├── (warga)/      → Guard: login | WargaNavbar (auto-hide di /peta)
└── (admin)/      → Guard: ADMIN | AdminSidebar (locked di /dashboard/peta)
```

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
LaporanMapItem, LaporanAdminMapItem, LaporanDetail, KategoriItem
```

### API Routes
| Method | Endpoint | Fungsi |
|--------|----------|--------|
| GET | `/api/laporan` | List (query: status, kategoriId, search, adminView) |
| PATCH | `/api/laporan/[id]` | Update status, prioritas, catatanAdmin, fotoPenyelesaian |
| POST | `/api/vote` | Toggle vote (unlimited) |
| POST | `/api/upload` | Upload foto (max 5MB) |
| GET | `/api/notifikasi/sse` | SSE stream |

---

## 8. Pola Kode (CRITICAL PATTERNS)

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

### Responsive Layout
```tsx
// Prevent horizontal scroll
<div className="w-full overflow-x-hidden">
  <div className="max-w-4xl mx-auto">
    <input className="w-full px-4 py-3.5" />
    <h1 className="truncate">Long Title</h1>
  </div>
</div>
```

### Button Styling
```tsx
// Primary button
<button className="bg-primary text-white">Save</button>

// Active filter chip
<button className="bg-primary text-white">Category</button>
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

## 9. Checklist Fitur Baru

- [ ] Pakai komponen reusable? (Spinner, StatusBadge, Toast, CompletionModal)
- [ ] Pakai hook existing? (useDebounce, useToast, useVote, useLaporanMap)
- [ ] Responsif mobile-desktop?
- [ ] `overflow-x: hidden` untuk prevent horizontal scroll?
- [ ] Password toggle pattern benar? (`type="button"`, `tabIndex={-1}`)
- [ ] Button text `text-white` untuk high contrast?
- [ ] Marker color pakai `getMarkerColor()`?
- [ ] No border 1px untuk pemisah (No-Line Rule)?
- [ ] No glassmorphism?
- [ ] Toast untuk feedback (bukan inline error)?
- [ ] Foto upload max 5MB?
- [ ] Leaflet import dari `lib/map.ts` + `<MapResizer />`?
- [ ] `npx tsc --noEmit` sebelum commit?

---

## 10. Anti-Redundansi

### Jangan Buat Duplikat
- ✅ Cek `src/components/ui/`, `src/hooks/` dulu
- ❌ Jangan buat komponen/hook baru jika sudah ada
- ❌ Jangan buat inline error messages (pakai Toast)
- ❌ Jangan buat password toggle logic sendiri
- ❌ Jangan buat marker color logic sendiri

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
