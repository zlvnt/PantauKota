# AI.md — Otak AI untuk Proyek PantauKota

> File ini adalah **konteks komprehensif** untuk AI agent mana pun yang bekerja di proyek ini.
> Baca file ini sebelum menyentuh satu baris kode pun.
> Diperbarui pada: April 2026 (PBI-02 selesai).

---

## 1. Identitas Proyek

**PantauKota** adalah aplikasi pelaporan masalah perkotaan (PWA) yang dibangun dengan Next.js 14 (App Router).

Dua aktor: **Warga** (melapor, vote, komentar) dan **Admin** (tinjau laporan, ubah status, kelola kategori).

---

## 2. Prinsip Desain — WAJIB DIPATUHI

Semua keputusan UI harus mengikuti sistem **"Editorial Ledger"**. Detail lengkap ada di `DESIGN.md`.

### Aturan Tidak Boleh Dilanggar:
1. **❌ No Glassmorphism** — Tidak ada `backdrop-blur`, `bg-opacity`, atau transparansi latar belakang apapun. Semua elemen menggunakan warna solid.
2. **❌ No-Line Rule** — Tidak ada garis pembatas `border-b` atau `divider` 1px sebagai pemisah antar seksi. Gunakan whitespace atau perbedaan warna background yang samar (`surface-container-low` vs `surface-container-high`).
3. **✅ Floating UI** — Navbar warga dan sidebar admin melayang (tidak menempel ke tepi layar), menggunakan `rounded-3xl` dan shadow ambient tipis.
4. **✅ Tonal Layering** — Hirarki visual menggunakan token warna: `surface` → `surface-container-lowest` → `surface-container-low` → `surface-container-high`.
5. **✅ Responsive First** — Setiap komponen harus bekerja di mobile (360px) dan desktop (1440px+). Navigasi admin di mobile menggunakan bottom nav kapsul, bukan sidebar.

### Token Warna Penting
```
primary          → #426464 (hijau kebiruan gelap)
primary-dim      → #6B9A9A
tertiary         → #006d4a (hijau tua, untuk status SELESAI)
error            → #B3261E
surface          → #F4EFED (background utama)
on-surface       → #2A3439 (teks utama)
```

---

## 3. Arsitektur Aplikasi

### Rute & Layout Groups

```
/app
├── (auth)/              → Login & Register (publik)
├── (warga)/             → Semua halaman warga (guard: harus login)
│   └── layout.tsx       → Pasang WargaNavbar
└── (admin)/             → Semua halaman admin (guard: role === 'ADMIN')
    └── layout.tsx       → Pasang AdminSidebar via AdminLayoutClient
```

### Sistem Navigasi

**Warga:**
- `WargaNavbar.tsx` — Floating navbar di atas. Di halaman `/peta`, navbar ini otomatis `return null` (disembunyikan) karena peta butuh layar penuh.

**Admin:**
- `AdminSidebar.tsx` — Floating sidebar kiri (desktop) + bottom nav kapsul (mobile).
- `AdminLayoutClient.tsx` — Client wrapper yang mengelola state `isOpen` dan menggeser konten utama (`margin-left`) saat sidebar dibuka/ditutup.
- **Aturan peta admin:** Saat rute adalah `/dashboard/peta`, `isLocked = true` → sidebar dipaksa tertutup, tombol toggle disembunyikan, halaman `main` diset `h-[100dvh] overflow-hidden` untuk peta penuh.

---

## 4. Sistem Konfigurasi Peta (Leaflet)

### Sumber Tunggal: `src/lib/map.ts`
Semua konfigurasi Leaflet dipusatkan di sini. **Jangan tulis ulang konfigurasi ini di file lain.**

```typescript
// Konstanta yang tersedia:
OSM_TILE_URL          // URL tile OpenStreetMap
OSM_ATTRIBUTION       // Attribution string
MAP_DEFAULT_CENTER    // [-6.9175, 107.6191] — Bandung
MAP_DEFAULT_ZOOM      // 13
initLeafletIcons()    // Fungsi fix icon Leaflet untuk Next.js (SSR workaround)
```

### Fix Wajib untuk Leaflet + Next.js
Leaflet memiliki bug di lingkungan SSR/bundler. Selalu panggil `initLeafletIcons()` di level module (di luar komponen) pada setiap file yang menggunakan Leaflet.

### MapResizer (Wajib di Semua MapContainer)
```tsx
function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map]);
  return null;
}
```
Ini mencegah peta "abu-abu" saat ukuran kontainer berubah (misalnya sidebar dibuka/tutup).

---

## 5. Komponen UI Reusable (Gunakan Ini, Jangan Buat Ulang)

### `src/components/ui/Badge.tsx` — StatusBadge
```tsx
import StatusBadge from '@/components/ui/Badge';
<StatusBadge status="MENUNGGU" />           // showDot default true
<StatusBadge status="SELESAI" showDot={false} />
```

### `src/components/ui/Spinner.tsx` — Spinner
```tsx
import Spinner from '@/components/ui/Spinner';
<Spinner />                  // md (default)
<Spinner size="sm" />        // sm, md, lg
<Spinner size="lg" className="text-error" />  // bisa custom warna
```

### `src/components/ui/DynamicIcon.tsx` — DynamicIcon
Merender ikon Lucide dari string nama (disimpan di database sebagai `kategori.icon`).
```tsx
import { DynamicIcon } from '@/components/ui/DynamicIcon';
<DynamicIcon iconName={item.kategori.icon} className="w-5 h-5" strokeWidth={1.5} />
```

---

## 6. Hooks Custom (Gunakan Ini, Jangan Buat Ulang)

### `useDebounce` — Delay Nilai
```typescript
import { useDebounce } from '@/hooks/useDebounce';
const debouncedSearch = useDebounce(searchQuery, 400); // delay 400ms
```
**Jangan** gunakan `setTimeout` + `useRef` manual untuk debounce. Selalu pakai hook ini.

### `useLaporanMap` — Fetch Data Peta
```typescript
const { laporan, isLoading, error, refetch } = useLaporanMap({
  adminView: true,          // sertakan data user (nama pelapor)
  search: 'jalan rusak',    // cari berdasarkan judul/nama
  kategoriId: 'abc123',     // filter berdasarkan kategori
});
```
Hook ini otomatis re-fetch saat parameter berubah.

### `useGeolocation` — GPS Browser
```typescript
const { latitude, longitude, loading, error, getCurrentPosition } = useGeolocation();
```

---

## 7. Tipe Data Shared (`src/types/laporan.ts`)

```typescript
// Status laporan
type Status = 'MENUNGGU' | 'DIPROSES' | 'SELESAI';

// Konfigurasi visual status (warna, label, class)
STATUS_CONFIG.MENUNGGU  // { label, color, bgClass, dotClass }
STATUS_CONFIG.DIPROSES
STATUS_CONFIG.SELESAI

// Tipe data utama
LaporanMapItem          // Data laporan untuk peta warga
LaporanAdminMapItem     // Extends LaporanMapItem + user.name (khusus admin)
LaporanDetail           // Data lengkap untuk halaman detail
KategoriItem            // Data kategori (id, nama, icon, warna)
```

---

## 8. API Routes

| Method | Endpoint | Akses | Fungsi |
|--------|----------|-------|--------|
| GET | `/api/laporan` | Login | Daftar laporan. Query: `status`, `kategoriId`, `search`, `adminView` |
| PATCH | `/api/laporan/[id]` | Admin | Update status laporan |
| GET | `/api/kategori` | Login | Daftar kategori aktif (`isActive: true`) |
| POST | `/api/auth/register` | Publik | Daftar akun baru (validasi Zod + hash bcrypt) |
| GET | `/api/notifikasi` | Login | Daftar notifikasi user |
| GET | `/api/notifikasi/sse` | Login | Stream SSE notifikasi real-time |
| POST | `/api/komentar` | Login | Buat komentar baru |
| POST | `/api/vote` | Login | Toggle vote laporan |
| POST | `/api/upload` | Login | Upload foto ke Cloudinary |

---

## 9. Pola & Konvensi Kode

### Debounce Input
✅ **Benar:**
```tsx
const debouncedSearch = useDebounce(searchQuery, 400);
```
❌ **Salah (jangan lakukan ini):**
```tsx
const ref = useRef(null);
const [debouncedSearch, setDebouncedSearch] = useState('');
// lalu setTimeout manual...
```

### Badge Status
✅ **Benar:**
```tsx
<StatusBadge status={item.status} />
```
❌ **Salah:**
```tsx
<span className={`inline-flex ... ${cfg.bgClass}`}>
  <span className={cfg.dotClass} />
  {cfg.label}
</span>
```

### Konfigurasi Leaflet
✅ **Benar:**
```tsx
import { initLeafletIcons, OSM_TILE_URL, OSM_ATTRIBUTION, MAP_DEFAULT_CENTER } from '@/lib/map';
initLeafletIcons();
// ...
<TileLayer attribution={OSM_ATTRIBUTION} url={OSM_TILE_URL} />
<MapContainer center={MAP_DEFAULT_CENTER} zoom={MAP_DEFAULT_ZOOM} ...>
```
❌ **Salah:** Menulis URL `https://{s}.tile.openstreetmap.org/...` atau konfigurasi icon Leaflet langsung di komponen.

### Active State Navigasi (Bug Routing)
Rute `/dashboard/peta` adalah sub-rute dari `/dashboard`. Jika menggunakan `pathname.startsWith(href)`, menu Dashboard akan menyala aktif saat di halaman peta. Gunakan pengecekan eksplisit:
```tsx
const isActive = href === '/dashboard'
  ? pathname === '/dashboard'
  : pathname === href || pathname.startsWith(href + '/');
```

---

## 10. Checklist Sebelum Menambahkan Fitur Baru

- [ ] Apakah ada komponen reusable yang bisa dipakai? (Spinner, StatusBadge, DynamicIcon)
- [ ] Apakah ada hook yang bisa dipakai? (useDebounce, useLaporanMap, useGeolocation)
- [ ] Apakah komponen sudah responsif untuk mobile (360px) dan desktop (1440px)?
- [ ] Apakah ada garis pembatas (border) yang melanggar No-Line Rule?
- [ ] Apakah ada efek glassmorphism yang terselip?
- [ ] Jika menambah rute admin baru: apakah perlu perilaku "locked" seperti halaman peta?
- [ ] Jika menggunakan Leaflet: apakah sudah import dari `lib/map.ts` dan menyertakan `<MapResizer />`?
- [ ] Sudah jalankan `npx tsc --noEmit` sebelum commit?

---

## 11. File yang TIDAK Boleh Dimodifikasi Sembarangan

| File | Alasan |
|------|--------|
| `prisma/schema.prisma` | Perubahan memerlukan migrasi baru |
| `src/middleware.ts` | Proteksi route seluruh aplikasi |
| `src/lib/auth.ts` | Konfigurasi NextAuth + role-based redirect |
| `src/lib/prisma.ts` | Singleton PrismaClient — modifikasi bisa menyebabkan connection leak |
| `src/types/laporan.ts` | Tipe shared — perubahan bisa berdampak ke banyak file |
| `DESIGN.md` | Panduan desain — perubahan harus didiskusikan dengan tim |

---

*File ini diperbarui setiap kali ada PBI baru yang selesai dikerjakan.*
