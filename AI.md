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

### `src/components/ui/Toast.tsx` — Toast Notification (NEW)
**WAJIB DIGUNAKAN** untuk semua notifikasi user feedback. Jangan buat inline error/success messages.
```tsx
import Toast from '@/components/ui/Toast';
import { useToast } from '@/hooks/useToast';

const { success, error, info, warning, toasts, removeToast } = useToast();

// Show notifications
success('Profil berhasil diperbarui');
error('Nama sudah digunakan oleh pengguna lain');

// Render toasts
{toasts.map((toast) => (
  <Toast
    key={toast.id}
    message={toast.message}
    type={toast.type}
    onClose={() => removeToast(toast.id)}
  />
))}
```

**Aturan Toast:**
- ✅ Gunakan untuk semua feedback (success, error, info, warning)
- ✅ Auto-dismiss setelah 3 detik (configurable)
- ✅ Manual close dengan tombol X
- ✅ Multiple toasts supported
- ❌ Jangan buat inline `<div className="bg-error/10">` untuk error messages
- ❌ Jangan buat custom notification components

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

## 7. Sistem Notifikasi Real-Time (SSE)

Infrastruktur notifikasi sudah **lengkap dan aktif**. Berikut alur kerjanya:

```
Admin ubah status laporan
        │
        ▼
PATCH /api/laporan/[id]
        │
        ├─ Update DB (prisma.laporan.update)
        │
        └─ kirimNotifikasi({ userId, judul, pesan, laporanId })
                │
                ├─ Simpan ke DB (prisma.notifikasi.create)
                │
                └─ Push real-time via SSE jika user sedang online
                        (sseClients.get(userId) → controller.enqueue)
```

### File-file Kunci Notifikasi

| File | Fungsi |
|------|--------|
| `src/lib/notifications.ts` | Fungsi `kirimNotifikasi()` + manajemen SSE client in-memory |
| `src/app/api/notifikasi/route.ts` | `GET` ambil daftar, `PATCH` tandai dibaca |
| `src/app/api/notifikasi/sse/route.ts` | Stream SSE per user (ReadableStream) |
| `src/hooks/useNotifications.ts` | Hook: fetch + listen SSE + tandai baca |
| `src/components/NotificationBell.tsx` | UI bell dengan badge unread count + dropdown list |

### Kapan Notifikasi Dikirim (saat ini)
- ✅ **Admin ubah status laporan** → notifikasi real-time ke pemilik laporan

### Fitur Notifikasi yang Sudah Aktif
- ✅ Simpan ke database (`prisma.notifikasi.create`)
- ✅ Push real-time via SSE (jika user sedang online)
- ✅ Fetch daftar notifikasi saat halaman dimuat
- ✅ Tandai satu notifikasi sebagai dibaca
- ✅ Tandai semua notifikasi sebagai dibaca
- ✅ **Hapus notifikasi** yang sudah dibaca (`DELETE /api/notifikasi?id=xxx`)
- ✅ Badge unread count di bell icon

### Notifikasi yang Perlu Ditambahkan di Masa Depan
- 🔲 Laporan baru masuk → notifikasi ke semua admin (untuk PBI-23)
- 🔲 Laporan jadi prioritas (≥30 vote + MENUNGGU) → notifikasi ke admin (untuk PBI-12)
- 🔲 Ada komentar baru pada laporan → notifikasi ke pemilik laporan

### Cara Menambah Trigger Notifikasi Baru
Cukup panggil `kirimNotifikasi()` di API route mana pun setelah operasi DB:
```typescript
import { kirimNotifikasi } from '@/lib/notifications';

await kirimNotifikasi({
  userId: 'user-yang-dituju',
  judul: 'Judul notifikasi',
  pesan: 'Isi pesan notifikasi.',
  laporanId: 'id-laporan-terkait', // opsional
});
```

### Posisi NotificationBell
- **Admin Desktop**: Fixed di sudut kanan atas (`AdminLayoutClient.tsx`)
- **Admin Mobile**: Di header mobile, sebelah kiri avatar (`AdminMobileHeader.tsx`)
- **Warga**: Di `WargaNavbar.tsx`, sudah terintegrasi sejak awal

### Keterbatasan SSE Saat Ini & Fix yang Sudah Diterapkan

**Fix HMR (Development Mode):** `sseClients` Map disimpan di `globalThis` agar tidak di-reset
saat Next.js Hot Module Replacement terjadi:
```typescript
// src/lib/notifications.ts
declare global { var sseClients: Map<string, ReadableStreamDefaultController> | undefined; }
const sseClients = globalThis.sseClients ?? (globalThis.sseClients = new Map());
```

**Keterbatasan yang masih ada:**
- Tidak bekerja di environment multi-instance (misalnya deployment dengan beberapa server)
- Untuk produksi skala besar, pertimbangkan Redis Pub/Sub sebagai pengganti

---

## 8. Tipe Data Shared (`src/types/laporan.ts`)

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

### Password Visibility Toggle (CRITICAL FIX)
**Bug yang HARUS dihindari:** Eye icon hilang saat user pindah focus ke field lain.

✅ **Benar (Pattern yang WAJIB diikuti):**
```tsx
const [showPassword, setShowPassword] = useState(false);

<div className="relative w-full">
  <input
    type={showPassword ? 'text' : 'password'}
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    className="w-full px-4 py-3.5 pr-12 ..."
  />
  <button
    type="button"  // WAJIB: Prevent form submission
    onClick={() => setShowPassword(!showPassword)}
    className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 p-1"
    tabIndex={-1}  // WAJIB: Prevent focus interference
  >
    {showPassword ? <EyeOff /> : <Eye />}
  </button>
</div>
```

**Key Points:**
1. State terpisah untuk setiap password field (`showCurrentPassword`, `showNewPassword`, `showConfirmPassword`)
2. Button `type="button"` untuk prevent form submission
3. Button `tabIndex={-1}` untuk prevent focus interference
4. Button positioned absolutely, outside input focus logic
5. Responsive positioning: `right-3 sm:right-4`
6. Padding `p-1` untuk larger touch target

❌ **Salah (Jangan lakukan ini):**
```tsx
// ❌ Menggunakan onBlur/onFocus pada input
<input onBlur={() => setShowIcon(false)} />

// ❌ Conditional rendering icon berdasarkan focus
{isFocused && <Eye />}

// ❌ Tidak ada type="button"
<button onClick={...}>  // Will submit form!

// ❌ Tidak ada tabIndex={-1}
<button onClick={...}>  // Will interfere with tab navigation
```

### Responsive Layout (CRITICAL PATTERN)
**Horizontal scroll HARUS dicegah di semua halaman.**

✅ **Benar:**
```tsx
// Global prevention (sudah ada di globals.css)
html, body {
  overflow-x: hidden;
  max-width: 100vw;
}

// Page container
<div className="w-full min-h-screen overflow-x-hidden">
  <div className="max-w-4xl mx-auto w-full">
    {/* Content */}
  </div>
</div>

// Form elements
<div className="w-full">
  <input className="w-full px-4 py-3.5 ..." />
</div>

// Responsive header
<div className="flex items-center gap-3 sm:gap-4">
  <button className="shrink-0">...</button>
  <div className="min-w-0">
    <h1 className="truncate">...</h1>
  </div>
</div>
```

❌ **Salah:**
```tsx
// ❌ Fixed width yang bisa overflow
<div className="w-[500px]">

// ❌ Tidak ada overflow-x prevention
<div className="min-h-screen">

// ❌ Tidak ada truncate pada text panjang
<h1>{veryLongTitle}</h1>

// ❌ Tidak ada shrink-0 pada button
<button>...</button>  // Bisa menyusut dan hilang
```

### Button Styling (DESIGN COMPLIANCE)
**Primary button HARUS menggunakan text putih untuk contrast.**

✅ **Benar:**
```tsx
<button className="bg-primary text-white ...">
  Simpan Perubahan
</button>
```

❌ **Salah:**
```tsx
// ❌ text-on-primary tidak cukup explicit
<button className="bg-primary text-on-primary ...">

// ❌ Contrast rendah
<button className="bg-primary text-gray-600 ...">
```

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

- [ ] Apakah ada komponen reusable yang bisa dipakai? (Spinner, StatusBadge, DynamicIcon, **Toast**)
- [ ] Apakah ada hook yang bisa dipakai? (useDebounce, useLaporanMap, useGeolocation, **useToast**)
- [ ] Apakah komponen sudah responsif untuk mobile (360px) dan desktop (1440px)?
- [ ] **Apakah sudah ada `overflow-x: hidden` untuk prevent horizontal scroll?**
- [ ] **Apakah password visibility toggle menggunakan pattern yang benar? (type="button", tabIndex={-1})**
- [ ] **Apakah button text menggunakan `text-white` untuk high contrast?**
- [ ] Apakah ada garis pembatas (border) yang melanggar No-Line Rule?
- [ ] Apakah ada efek glassmorphism yang terselip?
- [ ] Jika menambah rute admin baru: apakah perlu perilaku "locked" seperti halaman peta?
- [ ] Jika menggunakan Leaflet: apakah sudah import dari `lib/map.ts` dan menyertakan `<MapResizer />`?
- [ ] **Apakah menggunakan Toast untuk user feedback (bukan inline error messages)?**
- [ ] Sudah jalankan `npx tsc --noEmit` sebelum commit?

---

## 11. Aturan Anti-Redundansi (WAJIB DIPATUHI)

### Jangan Buat Komponen Duplikat
Sebelum membuat komponen baru, **WAJIB** cek apakah sudah ada di:
- `src/components/ui/` - UI primitives (Button, Badge, Spinner, Toast, DynamicIcon)
- `src/components/` - Feature components (NotificationBell, Providers)
- `src/hooks/` - Custom hooks (useDebounce, useToast, useGeolocation, useLaporanMap, useNotifications)

### Jangan Buat Style Duplikat
- ✅ Gunakan Tailwind utility classes
- ✅ Gunakan CSS variables dari `globals.css` (--primary, --surface, dll)
- ❌ Jangan buat file CSS baru untuk styling individual
- ❌ Jangan buat inline styles dengan `style={{...}}`

### Jangan Buat Notification System Baru
- ✅ Gunakan `useToast` hook dan `Toast` component
- ❌ Jangan buat `<div className="bg-error/10">` untuk error messages
- ❌ Jangan buat custom alert/notification components
- ❌ Jangan gunakan `window.alert()` atau `window.confirm()`

### Jangan Buat Overflow Fix Duplikat
- ✅ Overflow-x prevention sudah ada di `globals.css` dan `layout.tsx`
- ❌ Jangan tambahkan `overflow-x: hidden` di setiap component
- ✅ Gunakan `w-full` dan `max-w-*` untuk width control
- ❌ Jangan gunakan fixed width (`w-[500px]`)

### Jangan Buat Password Toggle Duplikat
- ✅ Gunakan pattern yang sudah ada (lihat section 9)
- ❌ Jangan buat custom password toggle logic
- ❌ Jangan gunakan onBlur/onFocus untuk show/hide icon

---

## 12. File yang TIDAK Boleh Dimodifikasi Sembarangan

| File | Alasan |
|------|--------|
| `prisma/schema.prisma` | Perubahan memerlukan migrasi baru |
| `src/middleware.ts` | Proteksi route seluruh aplikasi |
| `src/lib/auth.ts` | Konfigurasi NextAuth + role-based redirect |
| `src/lib/prisma.ts` | Singleton PrismaClient — modifikasi bisa menyebabkan connection leak |
| `src/types/laporan.ts` | Tipe shared — perubahan bisa berdampak ke banyak file |
| `src/app/globals.css` | Global styles + overflow prevention — perubahan bisa break layout |
| `src/app/layout.tsx` | Root layout + overflow classes — perubahan bisa break semua halaman |
| `src/components/ui/Toast.tsx` | Global notification system — sudah final, jangan modifikasi |
| `src/hooks/useToast.ts` | Toast hook — sudah final, jangan modifikasi |
| `DESIGN.md` | Panduan desain — perubahan harus didiskusikan dengan tim |

---

*File ini diperbarui setiap kali ada PBI baru yang selesai dikerjakan.*
