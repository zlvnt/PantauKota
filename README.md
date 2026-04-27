# PantauKota (Aplikasi Lapor Lingkungan) - Project Context & Status
**Status Terakhir Diperbarui:** PBI-01 Visualisasi Peta Interaktif + Database Cloud + Auth Backend + Admin Dashboard

## 📌 Deskripsi Proyek
Aplikasi web berbasis **Progressive Web App (PWA)** untuk pelaporan masalah perkotaan (sampah, jalan rusak, fasilitas umum) oleh warga. Laporan ini disertai bukti **foto dan lokasi GPS**, yang ditinjau melalui **peta interaktif**. 

Sistem ini memiliki dua aktor utama:
1. **Warga**: Melaporkan masalah, melihat progres laporan, dan melakukan sinkronisasi dengan masyarakat luas (peta dan status). Warga dibatasi membuat **maksimal 3 laporan per hari** untuk mencegah spam.
2. **Admin (Pemerintah)**: Meninjau laporan, mengubah status penyelesaian, meninjau analitik, dan dapat memberikan **catatan serta bukti foto** setelah masalah terselesaikan.

## 🛠️ Tech Stack Utama
- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS.
- **Backend / API**: Next.js API Routes, NextAuth.js v4.
- **Database**: PostgreSQL (Cloud: Neon.tech, v16 Singapore Region) dengan Prisma ORM (Prisma 7 + `@prisma/adapter-pg`).
- **Peta & Lokasi**: Leaflet.js, React-Leaflet, Geolocation API.
- **Media Storage**: Cloudinary (Upload foto).
- **UI Components**: `shadcn/ui`, `lucide-react`.
- **PWA & Form**: `next-pwa`, `react-hook-form`, `zod`.
- **Real-Time Notification**: Server-Sent Events (SSE).

---

## 📂 Struktur Database Utama (Prisma)
Aplikasi ini memiliki 6 model inti:
1. **User**: Mengelola data partisipan (`WARGA` atau `ADMIN`).
2. **Laporan**: Terdapat _field_ penting seperti `status` (MENUNGGU, DIPROSES, SELESAI), bukti `foto` awal, titik lokasi, serta `catatanAdmin` dan `fotoPenyelesaian` bila masalah sudah dibereskan.
3. **Kategori**: Fleksibel dan dirancang dengan _soft-delete_ (`isActive` boolean) agar tidak merusak relasi pelaporan lama jika ada kategori yang dinonaktifkan Admin.
4. **Vote**: Mencegah 1 warga mem-vote 1 laporan lebih dari sekali (`@@unique([userId, laporanId])`).
5. **Notifikasi**: Dicatat dalam database dan nantinya ditransfer real-time via SSE.
6. **Komentar**: Komentar warga dan admin pada laporan. Bisa dihapus oleh pemilik atau admin.

*Schema Prisma lengkap terbaru dapat dilihat pada `prisma/schema.prisma`.*

---

## 🗄️ Database & Environment

### Cloud Database: Neon.tech
Database PostgreSQL 16 dihosting di **Neon.tech (AWS Asia Pacific - Singapore)** agar seluruh tim dapat menggunakan satu database bersama.

**Setup untuk anggota tim baru:**
1. Minta _Connection String_ dari ketua tim.
2. Salin ke file `.env` pada property `DATABASE_URL`.
3. Jalankan `npx prisma generate` untuk generate Prisma Client.
4. Jalankan `npm run seed` untuk isi data dummy (opsional).

> **Catatan:** File `.env` sudah dimasukkan ke `.gitignore`. Gunakan file `.env.example` sebagai referensi key yang dibutuhkan.

### Prisma 7 — Konfigurasi Khusus
Prisma 7 mewajibkan konfigurasi koneksi di `prisma.config.ts` (bukan di `schema.prisma`). Adapter `@prisma/adapter-pg` digunakan untuk koneksi ke PostgreSQL. File penting:
- `prisma.config.ts` — konfigurasi datasource URL
- `src/lib/prisma.ts` — singleton PrismaClient dengan adapter `PrismaPg`
- `tsconfig.seed.json` — konfigurasi TypeScript khusus untuk menjalankan file seed

### Data Seed (Akun Testing)
Jalankan `npm run seed` untuk mengisi data dummy. Akun yang tersedia:
- **Admin**: `admin@pantaukota.id` / `password123`
- **Warga**: `budi@warga.id` / `password123`
- **Warga**: `siti@warga.id` / `password123`
- **Warga**: `andi@warga.id` / `password123`
- 6 Kategori + 8 Laporan tersebar di area Jakarta + 7 Vote

---

## 🔐 Sistem Autentikasi

### Alur Login & Register
- **Login**: Form `AuthScreen.tsx` → `NextAuth signIn('credentials')` → validasi email/password dari DB → redirect berdasarkan role.
- **Register**: Form `AuthScreen.tsx` → `POST /api/auth/register` (validasi Zod + cek duplikat email + hash bcrypt) → auto-login setelah berhasil → redirect ke `/peta`.
- **Error Handling**: Error banner merah di form + loading spinner + disable input saat proses.
- **Session**: Dikelola via `<SessionProvider>` di `src/components/Providers.tsx` yang dibungkus di root layout.

### Proteksi Route (Middleware)
File `src/middleware.ts` menggunakan `withAuth` dari NextAuth:
- Halaman `/dashboard/*`, `/kelola-*` → hanya ADMIN
- Halaman `/laporan/buat`, `/notifikasi/*`, `/riwayat/*` → harus login (semua role)
- Halaman `/peta` → harus login, Admin boleh mengakses

### Redirect Berdasarkan Role
| Role | Setelah Login | Akses /dashboard | Akses /peta |
|------|--------------|------------------|-------------|
| WARGA | → `/peta` | ❌ Redirect | ✅ |
| ADMIN | → `/dashboard` | ✅ | ✅ |

---

## 🗺️ PBI-01: Visualisasi Peta Interaktif (SELESAI)

### Arsitektur Komponen Peta
Terdapat **dua versi peta** yang terpisah untuk dua aktor berbeda:

#### Peta Warga (`/peta`)
- **Komponen**: `src/components/map/MapView.tsx`
- **Halaman**: `src/app/(warga)/peta/page.tsx`
- **Fitur**: Panel daftar laporan (kiri), marker berwarna per status, popup ringkasan (judul, status, vote, komentar), legenda status, tombol "Laporkan Masalah", dynamic import (no SSR)
- **Privasi**: Nama pelapor TIDAK ditampilkan

#### Peta Admin (`/dashboard/peta`)
- **Komponen**: `src/components/map/AdminMapView.tsx`
- **Halaman**: `src/app/(admin)/dashboard/peta/page.tsx`
- **Fitur Eksklusif Admin**:
  - Info pelapor + tanggal di popup dan kartu
  - **Aksi Cepat Ubah Status** langsung dari popup (Menunggu / Diproses / Selesai) via `PATCH /api/laporan/[id]`
  - **Indikator Darurat**: Banner peringatan jika ada laporan dengan ≥30 suara + status MENUNGGU
  - **Marker Prioritas**: Ukuran marker lebih besar berdasarkan jumlah vote, marker darurat memiliki pulse animation + badge angka
  - **Filter Status**: Klik stat card (Menunggu/Diproses/Selesai) untuk filter langsung di peta
  - Kartu laporan dengan highlight merah untuk laporan darurat

### Shared Infrastructure
| File | Fungsi |
|------|--------|
| `src/types/laporan.ts` | Tipe data `LaporanMapItem`, `LaporanAdminMapItem`, `LaporanDetail`, `STATUS_CONFIG` |
| `src/hooks/useLaporanMap.ts` | Hook fetching data laporan dengan support filter & adminView |
| `src/app/api/laporan/route.ts` | `GET /api/laporan` — query params: `status`, `kategoriId`, `search`, `adminView` |
| `src/app/api/laporan/[id]/route.ts` | `PATCH /api/laporan/[id]` — admin update status (auth guard) |

---

## 🧭 Layout & Navigasi Global

### Navbar Warga (`WargaNavbar.tsx`)
- Logo PantauKota + navigasi: Peta Laporan, Riwayat Saya
- Komponen NotificationBell (dari tim)
- User dropdown: nama user, tombol Keluar
- Layout: `src/app/(warga)/layout.tsx` (server-side auth guard + Navbar)

### Sidebar Admin (`AdminSidebar.tsx`)
- Logo + badge "Admin Panel"
- Navigasi: Dashboard, Peta Laporan, Kelola Laporan, Kelola Kategori
- Info nama admin + tombol Keluar
- Layout: `src/app/(admin)/layout.tsx` (server-side auth guard, admin-only)

### Admin Dashboard (`/dashboard`)
- 6 stat card (Total Laporan, Menunggu, Diproses, Selesai, Total Warga, Tingkat Penyelesaian %)
- Tabel 5 laporan terbaru (data langsung dari DB via server component)

---

## 📅 Progress Proyek Saat Ini

### ✅ SELESAI (DONE)
- [x] Diskusi dan desain arsitektur / _tech stack_.
- [x] Perancangan Model Database (Prisma Schema).
- [x] Inisialisasi Project (Next.js 14 dengan App Router, TS, Tailwind).
- [x] Instalasi seluruh _dependencies_ utama (termasuk: `shadcn`, `lucide-react`, `@prisma/adapter-pg`, `tsx`).
- [x] Pembuatan Kerangka Struktur Folder (`/app/(warga)`, `/app/(admin)`, `/components`, `/api`, dll).
- [x] Setup `next.config.mjs` untuk PWA dan Next Image (Cloudinary & Unsplash hosts).
- [x] Penyesuaian _feedback_ admin (`catatanAdmin` & `fotoPenyelesaian`) serta fitur _soft-delete_ Kategori.
- [x] Membersihkan file-file lama dari _root_ folder.
- [x] **Setup Sistem Desain "Civic Clarity":** Palet warna kustom, tipografi ganda (Manrope & Inter), Tonal Layering.
- [x] **Antarmuka Auth (UI):** Pembuatan `AuthScreen` dengan hero section + glassmorphism (Login & Register).
- [x] **Database Cloud (Neon.tech):** PostgreSQL 16 terkoneksi, migrasi `init` berhasil dijalankan.
- [x] **Database Seeding:** File `prisma/seed.ts` dengan data realistis (users, kategori, laporan, vote).
- [x] **Logika Auth Backend:** API register (`POST /api/auth/register` + Zod), NextAuth `signIn`, SessionProvider, redirect berbasis role.
- [x] **Proteksi Route:** `middleware.ts` dengan `withAuth`, server-side guard di kedua layout.
- [x] **Navbar Warga:** Navigasi responsif, NotificationBell, user dropdown + logout.
- [x] **Sidebar Admin:** Navigasi admin, info user, logout.
- [x] **Dashboard Admin:** 6 stat card + tabel laporan terbaru (server component query langsung ke DB).
- [x] **PBI-01 Peta Warga:** MapView + panel daftar laporan + marker berwarna + popup + legenda + tombol lapor.
- [x] **PBI-01 Peta Admin:** AdminMapView + marker prioritas + aksi cepat status + filter + indikator darurat.
- [x] **API Laporan:** `GET /api/laporan` (filter, search, adminView) + `PATCH /api/laporan/[id]` (update status, admin-only).
- [x] **Tipe Data Shared:** `LaporanMapItem`, `LaporanAdminMapItem`, `STATUS_CONFIG` di `src/types/laporan.ts`.

### ⏳ BERIKUTNYA (NEXT STEPS)
- [ ] **Komponen UI Global**: Pembuatan _Navbar_ (Warga) & _Sidebar_ (Admin).
- [ ] **Database Seeding**: Pembuatan file _seed_ awal (Akun Admin pertama & daftar entitas Kategori).
- [ ] **Fitur Inti Warga**: Pembuatan form tambah laporan (dengan penanganan batas limit 3 per hari) beserta integrasi navigasi peta _Leaflet_.
- [ ] **Fitur Inti Admin**: Dashboard statistik rekapitulasi, tabel laporan interaktif, pengelolaan status beserta _feedback_ balasan (termasuk unggahan gambar).

---

*File ini adalah representasi utama dari progres dan dokumentasi proyek. Asisten AI mana pun dapat menjadikan file ini sebagai pedoman langkah kerja pengembangan.*
