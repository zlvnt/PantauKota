# PantauKota — Aplikasi Lapor Lingkungan

**Status:** PBI-02 Filter & Search Peta ✅ | Notifikasi Admin & Real-Time Delete ✅  
**Terakhir Diperbarui:** April 2026

---

## 📌 Deskripsi Proyek

Aplikasi web berbasis **Progressive Web App (PWA)** untuk pelaporan masalah perkotaan (sampah, jalan rusak, fasilitas umum) oleh warga. Laporan disertai bukti foto dan lokasi GPS yang ditinjau melalui peta interaktif.

Dua aktor utama:
- **Warga** — Melaporkan masalah, melihat progres, vote laporan (maks. 3 laporan/hari)
- **Admin (Pemerintah)** — Meninjau laporan, mengubah status, melihat analitik, memberikan catatan & foto penyelesaian

---

## 🛠️ Tech Stack

| Kategori | Teknologi |
|---------|-----------|
| Frontend | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS |
| Backend | Next.js API Routes, NextAuth.js v4 |
| Database | PostgreSQL 16 via Neon.tech (Prisma 7 + `@prisma/adapter-pg`) |
| Peta | Leaflet.js + React-Leaflet |
| Media | Cloudinary |
| UI | `lucide-react`, sistem desain custom "Editorial Ledger" |
| PWA | `next-pwa` |
| Real-Time | Server-Sent Events (SSE) |

---

## 🚀 Setup & Menjalankan Proyek

### Prasyarat
- Node.js >= 18
- Akses ke Connection String Neon.tech (minta ke ketua tim)

### Langkah Setup

```bash
# 1. Clone dan install dependencies
npm install

# 2. Buat file .env berdasarkan .env.example dan isi variable yang dibutuhkan

# 3. Generate Prisma Client
npx prisma generate

# 4. (Opsional) Isi data dummy
npm run seed

# 5. Jalankan development server
npm run dev
```

### Akun Testing (setelah seed)
| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@pantaukota.id` | `password123` |
| Warga | `budi@warga.id` | `password123` |
| Warga | `siti@warga.id` | `password123` |
| Warga | `andi@warga.id` | `password123` |

---

## 📂 Struktur Folder

```
src/
├── app/
│   ├── (auth)/login/              # Halaman login
│   ├── (auth)/register/           # Halaman register
│   ├── (warga)/
│   │   ├── layout.tsx             # Guard + WargaNavbar
│   │   ├── beranda/               # Dashboard warga (riwayat laporan saya)
│   │   ├── peta/page.tsx          # ← Peta Warga (PBI-01, PBI-02)
│   │   ├── laporan/               # Detail & buat laporan
│   │   ├── riwayat/               # Riwayat laporan saya
│   │   └── notifikasi/            # Halaman notifikasi
│   ├── (admin)/
│   │   ├── layout.tsx             # Guard + AdminSidebar
│   │   └── dashboard/
│   │       ├── page.tsx           # Dashboard statistik
│   │       └── peta/page.tsx      # ← Peta Admin (PBI-01, PBI-02)
│   └── api/
│       ├── auth/                  # NextAuth + register
│       ├── laporan/               # GET (filter, search) + PATCH status
│       ├── kategori/              # GET daftar kategori
│       ├── notifikasi/            # GET + SSE
│       ├── komentar/              # POST komentar
│       ├── vote/                  # POST vote
│       └── upload/                # POST upload Cloudinary
├── components/
│   ├── auth/AuthScreen.tsx        # Form login/register
│   ├── layout/
│   │   ├── WargaNavbar.tsx        # Navbar floating warga
│   │   ├── AdminSidebar.tsx       # Sidebar lipat admin + bottom nav mobile
│   │   ├── AdminLayoutClient.tsx  # State manager sidebar (open/close/locked)
│   │   └── AdminMobileHeader.tsx  # Header admin khusus mobile
│   ├── map/
│   │   ├── MapView.tsx            # Peta warga (Leaflet)
│   │   ├── AdminMapView.tsx       # Peta admin + aksi cepat status
│   │   └── LocationPicker.tsx     # Picker lokasi GPS untuk form laporan
│   ├── komentar/KomentarSection.tsx
│   ├── ui/
│   │   ├── Badge.tsx              # StatusBadge reusable (MENUNGGU/DIPROSES/SELESAI)
│   │   ├── Button.tsx             # Tombol reusable
│   │   ├── DynamicIcon.tsx        # Render ikon Lucide dari string nama
│   │   └── Spinner.tsx            # Loading spinner reusable
│   ├── NotificationBell.tsx       # Bell notifikasi real-time
│   └── Providers.tsx              # SessionProvider wrapper
├── hooks/
│   ├── useDebounce.ts             # Debounce value (generic)
│   ├── useLaporanMap.ts           # Fetch data laporan (filter, search, adminView)
│   ├── useGeolocation.ts          # Akses GPS browser
│   └── useNotifications.ts        # Fetch + SSE notifikasi
├── lib/
│   ├── auth.ts                    # NextAuth config (credentials provider)
│   ├── map.ts                     # Konstanta Leaflet terpusat (URL tile, center, zoom)
│   └── prisma.ts                  # PrismaClient singleton + PrismaPg adapter
└── types/
    └── laporan.ts                 # Shared types: LaporanMapItem, STATUS_CONFIG, dll
```

---

## 🗄️ Database (Prisma)

6 model inti: `User`, `Laporan`, `Kategori`, `Vote`, `Notifikasi`, `Komentar`.

Lihat `prisma/schema.prisma` untuk schema lengkap.

> **Catatan Prisma 7:** Konfigurasi koneksi ada di `prisma.config.ts` (bukan di `schema.prisma`). Adapter `@prisma/adapter-pg` digunakan untuk koneksi ke PostgreSQL.

---

## 🎨 Sistem Desain

Dokumen desain lengkap: **`DESIGN.md`** dan **`AI.md`**

Ringkasan prinsip utama:
- **Editorial Ledger** — tidak ada glassmorphism, semua warna solid
- **No-Line Rule** — tidak ada garis pembatas (divider 1px), pisahkan elemen dengan whitespace atau perubahan warna background
- **Floating UI** — komponen navigasi (navbar warga, sidebar admin) melayang dengan `rounded-3xl` dan shadow ambient
- **Tonal Layering** — menggunakan `surface`, `surface-container-lowest/low/high` untuk hirarki visual

---

## ✅ Status PBI (Product Backlog Item)

| PBI | Nama | Status |
|-----|------|--------|
| PBI-01 | Visualisasi Peta Interaktif | ✅ Selesai |
| PBI-02 | Filter & Search Peta | ✅ Selesai |
| PBI-03 | Manajemen Profil | 🔲 Belum |
| PBI-04 | Notifikasi Real-time | 🟡 Sebagian (infrastruktur SSE + push aktif, UI bell admin & warga selesai, trigger hapus notif selesai) |
| PBI-05 | Location Picker | 🔲 Belum |
| PBI-06 | Komentar Laporan | 🔲 Belum |
| PBI-07 | Form Laporan | 🔲 Belum |
| PBI-08 | Upload Foto & Geolocation | 🔲 Belum |
| PBI-09 | Lihat Detail Laporan | 🔲 Belum |
| PBI-10 | Upvote/Vote Laporan | 🔲 Belum |
| PBI-11 | Tracking Status | 🔲 Belum |
| PBI-12 | Sistem Prioritas Laporan | 🟡 Sebagian (marker darurat di peta admin) |
| PBI-13 | Riwayat Laporan | 🔲 Belum |
| PBI-14 | Kelola Laporan | 🔲 Belum |
| PBI-15 | Deteksi Duplikasi | 🔲 Belum |
| PBI-16 | Kelola User / Admin | 🔲 Belum |
| PBI-17 | Statistik & Grafik | 🟡 Sebagian (statistik angka di dashboard, belum chart) |
| PBI-18 | Tabel Monitoring Laporan | 🟡 Sebagian (tabel 5 terbaru di dashboard) |
| PBI-19 | Kelola Kategori | 🔲 Belum |
| PBI-20 | Daftar Laporan | 🔲 Belum |
| PBI-21 | PWA Support | ✅ Selesai (konfigurasi next.config) |
| PBI-22 | Update Status Laporan | ✅ Selesai (aksi cepat peta admin + notifikasi otomatis ke warga) |
| PBI-23 | Notifikasi Otomatis | 🔲 Belum |

---

## 🔐 Proteksi Route

| Rute | Akses |
|------|-------|
| `/dashboard/*`, `/kelola-*` | Admin only |
| `/laporan/buat`, `/notifikasi/*`, `/riwayat/*` | Login (semua role) |
| `/peta` | Login (warga + admin) |
| `/login`, `/register` | Publik |

Lihat `src/middleware.ts` untuk implementasi `withAuth`.

---

*Untuk pemahaman arsitektur yang lebih dalam, baca `AI.md`.*
