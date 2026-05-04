# PantauKota — Aplikasi Lapor Lingkungan

**Update:** 04 Mei 2026 | PBI-03, 07, 08, 09, 10, 11, 12, 13, 14, 22 ✅

---

## 📌 Deskripsi

PWA pelaporan masalah perkotaan (sampah, jalan rusak, fasilitas umum) dengan bukti foto dan GPS.

**Aktor:**
- **Warga** — Lapor, vote, komentar, hapus laporan sendiri (< 24 jam & belum diproses)
- **Admin** — Tinjau, ubah status, analitik, catatan & foto penyelesaian

---

## 🛠️ Tech Stack

| Kategori | Teknologi |
|---------|-----------|
| Frontend | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS |
| Backend | Next.js API Routes, NextAuth.js v4 |
| Database | PostgreSQL 16 (Neon.tech), Prisma 7 + `@prisma/adapter-pg` |
| Peta | Leaflet.js + React-Leaflet |
| Media | Cloudinary |
| UI | `lucide-react`, sistem desain "Civic Clarity / Editorial Ledger" |
| PWA | `next-pwa` |
| Real-Time | Server-Sent Events (SSE) |

---

## 🚀 Setup

### Prasyarat
- Node.js >= 18
- Connection String Neon.tech (sudah di-share di `.env`)

### Langkah Setup untuk Developer Baru

```bash
# 1. Clone repository
git clone <repository-url>
cd pantaukota

# 2. Install dependencies
npm install

# 3. Pastikan .env ada (dengan DATABASE_URL)

# 4. Generate Prisma Client
npx prisma generate

# 5. Jalankan development server
npm run dev
```

**📝 Catatan Penting:**
- ❌ **TIDAK perlu** menjalankan `npm run seed` (database sudah berisi data)
- ❌ **TIDAK perlu** menjalankan migrasi (database sudah ter-setup)
- ✅ Database PostgreSQL di-host di Neon.tech dan di-share antar developer

### Akun Testing
| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@pantaukota.id` | `password123` |
| Warga | `budi@warga.id` | `password123` |
| Warga | `siti@warga.id` | `password123` |

### Troubleshooting

**Error: Prisma Client tidak ditemukan**
```bash
npx prisma generate
```

**Error: TypeScript tidak mengenali field baru**
- Restart TypeScript Server: `Ctrl+Shift+P` → "TypeScript: Restart TS Server"

**Ingin reset data development**
```bash
npm run seed  # Hanya jika ingin reset ke data dummy awal
```

---

## 📂 Struktur Folder

```
src/
├── app/
│   ├── (auth)/login, register
│   ├── (warga)/
│   │   ├── beranda/          → Dashboard (limit 3 laporan + link Lihat Semua)
│   │   ├── laporan-saya/     → Daftar lengkap laporan warga (search, filter, pagination)
│   │   ├── laporan/buat/     → Form buat laporan (grid responsif)
│   │   ├── laporan/[id]/     → Detail laporan warga (grid 2 kolom desktop)
│   │   ├── peta/             → Peta interaktif
│   │   ├── notifikasi/       → Notifikasi warga
│   │   └── profil/           → Profil & ubah password
│   ├── (admin)/
│   │   ├── dashboard/        → Dashboard admin + detail laporan admin
│   │   ├── kelola-laporan/   → List & filter semua laporan
│   │   ├── kelola-kategori/  → Manajemen kategori
│   │   └── kelola-user/      → Manajemen user
│   └── api/laporan, kategori, notifikasi, vote, upload, komentar
├── components/
│   ├── ui/Badge, Spinner, DynamicIcon, Toast, VoteButton, CameraModal
│   ├── laporan/StatusTimeline, PrioritasScore, DeleteLaporanButton
│   ├── admin/CompletionModal
│   ├── komentar/KomentarSection
│   ├── map/MapView, AdminMapView, LocationPicker
│   └── layout/WargaNavbar, AdminSidebar, AdminLayoutClient
├── hooks/useDebounce, useLaporanMap, useVote, useToast, useNotifications, useGeolocation
├── lib/auth, map, prisma, notifications
└── types/laporan (STATUS_CONFIG, LaporanSaya, getMarkerColor, dll)
```

---

## 🗄️ Database

6 model: `User`, `Laporan`, `Kategori`, `Vote`, `Notifikasi`, `Komentar`  
Schema: `prisma/schema.prisma` | Config: `prisma.config.ts`

---

## 🎨 Sistem Desain

**Dokumen:** `DESIGN.md`, `AI.md`

**Prinsip:**
- **Editorial Ledger** — No glassmorphism, warna solid
- **No-Line Rule** — Pemisah pakai whitespace/tonal, bukan border 1px
- **Floating UI** — `rounded-2xl`/`rounded-3xl`, shadow ambient
- **Tonal Layering** — `surface-container-lowest/low/high`
- **Responsive Grid** — `max-w-6xl` warga, `max-w-7xl` admin, grid 12 kolom untuk halaman detail

---

## ✅ Status PBI

| PBI | Nama | Status |
|-----|------|--------|
| 01 | Visualisasi Peta Interaktif | ✅ Selesai |
| 02 | Filter & Search Peta | ✅ Selesai |
| 03 | Manajemen Profil | ✅ Selesai |
| 04 | Notifikasi Real-time | ✅ Selesai (SSE + UI bell + hapus notif) |
| 05 | Location Picker | ✅ Selesai (GPS + klik peta + reverse geocode) |
| 06 | Komentar Laporan | ✅ Selesai (CRUD + real-time) |
| 07 | Form Laporan | ✅ Selesai (grid responsif, kamera langsung, drag marker) |
| 08 | Upload Foto & Geolocation | ✅ Selesai (Cloudinary, GPS, reverse geocode, kamera web) |
| 09 | Lihat Detail Laporan | ✅ Selesai (warga + admin, grid 2 kolom desktop) |
| 10 | Upvote/Vote Laporan | ✅ Selesai (unlimited, optimistic UI) |
| 11 | Tracking Status | ✅ Selesai (timeline 3 tahap) |
| 12 | Sistem Prioritas Laporan | ✅ Selesai (formula + marker warna) |
| 13 | Riwayat Laporan | ✅ Selesai (halaman /laporan-saya + dashboard limit 3) |
| 14 | Kelola Laporan | ✅ Selesai (filter, search, sorting) |
| 15 | Deteksi Duplikasi | 🔲 Belum |
| 16 | Kelola User / Admin | 🔲 Belum |
| 17 | Statistik & Grafik Laporan | 🟡 Statistik angka selesai, chart belum |
| 18 | Tabel Monitoring Laporan | 🟡 Tabel 5 terbaru selesai |
| 19 | Kelola Kategori | 🔲 Belum |
| 20 | Hapus Laporan (Warga) | ✅ Selesai (< 24 jam + status MENUNGGU) |
| 21 | PWA Support | ✅ Selesai (konfigurasi next-pwa) |
| 22 | Update Status Laporan | ✅ Selesai (completion modal + notifikasi) |
| 23 | Notifikasi Otomatis | 🔲 Belum |

**Legenda:**
- ✅ Selesai — Fitur lengkap dan terintegrasi
- 🟡 Sebagian — Fitur dasar ada, perlu enhancement
- 🔲 Belum — Belum dikerjakan

---

## 🎉 Recent Updates (Mei 2026)

### Responsivitas Desktop & Layout Grid ✅

**Halaman Detail Laporan (Warga & Admin):**
- Layout grid 12 kolom: Foto+Deskripsi (kiri, 7 kolom) | Peta+Timeline (kanan sticky, 5 kolom)
- Komentar sebagai grid item ke-3 yang berdiri sendiri → selalu paling bawah di mobile
- Box foto fixed height (`h-72 sm:h-80`) = sama proporsional dengan box deskripsi
- `max-w-6xl` untuk halaman warga, `max-w-7xl` untuk admin

**Halaman Buat Laporan:**
- Grid 2 kolom responsive (form kiri | location picker kanan sticky)

### Dashboard Warga — Limit 3 Laporan ✅

- Daftar laporan dibatasi 3 item terbaru di `/beranda`
- Link "Lihat Semua →" di header section
- Tombol "Lihat Semua X Laporan" di bawah daftar jika total > 3

### Halaman /laporan-saya ✅

- Server Component fetch semua laporan user dari DB
- Client Component dengan: search real-time, filter status (pills), pagination (10/hal)
- Stat strip: Total, Menunggu, Diproses, Selesai
- Tombol hapus otomatis muncul jika laporan masih bisa dihapus
- Back button ke dashboard, tombol Buat Laporan di toolbar

### Hapus Laporan (Warga) ✅

- `DELETE /api/laporan/[id]`
- Syarat: owner + < 24 jam + status MENUNGGU
- `prisma.$transaction` untuk hapus relasi sebelum laporan
- Client: `DeleteLaporanButton.tsx` dengan konfirmasi modal + countdown timer

### Kamera Web (PBI-08 enhancement) ✅

- `CameraModal.tsx` — akses kamera langsung di browser
- Capture via canvas → blob → upload Cloudinary
- Support desktop (getUserMedia) dan mobile (facingMode: environment)

---

### TC-11.3 & TC-12.3 ✅

**Completion Modal (TC-11.3):**
- Modal saat admin klik "Selesai"
- Input: Catatan (wajib), Foto (opsional, max 5MB)
- API: `PATCH /api/laporan/[id]`

**Kelola Laporan (TC-12.3):**
- Route: `/kelola-laporan`
- Search (debounced 400ms), filter kategori & status
- Statistik: total, menunggu, diproses, selesai, urgent
- Sorting: prioritas dulu, lalu terbaru

---

## 🔐 Proteksi Route

| Rute | Akses |
|------|-------|
| `/dashboard/*`, `/kelola-*` | Admin only |
| `/laporan/buat`, `/laporan-saya`, `/notifikasi/*` | Login |
| `/peta` | Login |
| `/login`, `/register` | Publik |

Implementasi: `src/middleware.ts`

---

*Detail arsitektur: `AI.md` | Detail desain: `DESIGN.md` | Detail maintenance: `MAINTENANCE.md`*
