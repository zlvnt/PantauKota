# PantauKota (Aplikasi Lapor Lingkungan) - Project Context & Status
**Status Terakhir Diperbarui:** Auth Login/Register, Proteksi Route, SessionProvider


## 📌 Deskripsi Proyek
Aplikasi web berbasis **Progressive Web App (PWA)** untuk pelaporan masalah perkotaan (sampah, jalan rusak, fasilitas umum) oleh warga. Laporan ini disertai bukti **foto dan lokasi GPS**, yang ditinjau melalui **peta interaktif**. 

Sistem ini memiliki dua aktor utama:
1. **Warga**: Melaporkan masalah, melihat progres laporan, dan melakukan sinkronisasi dengan masyarakat luas (peta dan status). Warga dibatasi membuat **maksimal 3 laporan per hari** untuk mencegah spam.
2. **Admin (Pemerintah)**: Meninjau laporan, mengubah status penyelesaian, meninjau analitik, dan dapat memberikan **catatan serta bukti foto** setelah masalah terselesaikan.

## 🛠️ Tech Stack Utama
- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS.
- **Backend / API**: Next.js API Routes, NextAuth.js v4.
- **Database**: PostgreSQL dengan Prisma ORM (Prisma 7).
- **Peta & Lokasi**: Leaflet.js, React-Leaflet, Geolocation API.
- **Media Storage**: Cloudinary (Upload foto).
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

## 📅 Progress Proyek Saat Ini

### ✅ SELESAI (DONE)
- [x] Diskusi dan desain arsitektur / _tech stack_.
- [x] Perancangan Model Database (Prisma Schema).
- [x] Inisialisasi Project (Next.js 14 dengan App Router, TS, Tailwind).
- [x] Instalasi seluruh _dependencies_ utama (termasuk library UI: `shadcn`, `lucide-react`).
- [x] Pembuatan Kerangka Struktur Folder (`/app/(warga)`, `/app/(admin)`, `/components`, `/api`, dll).
- [x] Setup `next.config.mjs` untuk PWA dan Next Image (Cloudinary Config & allowed hosts seperti Unsplash).
- [x] Penyesuaian _feedback_ admin (`catatanAdmin` & `fotoPenyelesaian`) serta fitur _soft-delete_ untuk Kategori pada `schema.prisma`.
- [x] Membersihkan file-file lama dari _root_ folder.
- [x] **Setup Sistem Desain "Civic Clarity":** Injeksi palet warna kustom, tipografi ganda (Manrope & Inter), dan integrasi komponen gaya jurnalistik.
- [x] **Pembangunan Antarmuka Visual (UI):** Pembuatan `AuthScreen` menggunakan prinsip _Tonal Layering_ (Halaman Login & Register selesai).
- [x] **PBI-04 Notifikasi Real-time:** SSE endpoint, API notifikasi (GET/PATCH), `useNotifications` hook, `NotificationBell` component.
- [x] **PBI-05 Location Picker:** `LocationPicker` component dengan GPS + reverse geocode Nominatim, `useGeolocation` hook.
- [x] **PBI-06 Komentar Laporan:** API komentar (GET/POST/DELETE), `KomentarSection` component, model `Komentar` di schema.
- [x] **Infra Auth:** `authOptions` NextAuth, wire `[...nextauth]` handler, `next-auth.d.ts` module augmentation.
- [x] **Auth Login & Register:** API register dengan validasi Zod, integrasi `AuthScreen` dengan NextAuth `signIn`, redirect berbasis role (WARGA → `/`, ADMIN → `/dashboard`).
- [x] **Proteksi Route:** `middleware.ts` dengan `withAuth`, server-side guard di layout `(warga)` dan `(admin)`, `SessionProvider` di root layout.

### ✅ SKALA PBI (PRODUCT BACKLOG ITEM) YANG SELESAI
- [x] **PBI-01** Visualisasi Peta Interaktif
- [ ] **PBI-02** Filter & Search Peta
- [ ] **PBI-03** Manajemen Profil
- [ ] **PBI-04** Notifikasi Real-time
- [ ] **PBI-05** Location Picker
- [ ] **PBI-06** Komentar Laporan
- [ ] **PBI-07** Form Laporan
- [ ] **PBI-08** Upload Foto & Geolocation
- [ ] **PBI-09** Lihat Detail Laporan
- [ ] **PBI-10** Upvote/Vote Laporan
- [ ] **PBI-11** Tracking Status
- [ ] **PBI-12** Sistem Prioritas Laporan *(Sebagian selesai: Marker Darurat di Peta Admin)*
- [ ] **PBI-13** Riwayat Laporan
- [ ] **PBI-14** Kelola Laporan
- [ ] **PBI-15** Deteksi Duplikasi
- [ ] **PBI-16** Kelola User / Admin
- [x] **PBI-17** Statistik & Grafik Laporan *(Selesai di Dashboard Admin (Lakukan Penyesuaian Lagi))*
- [x] **PBI-18** Tabel Monitoring Laporan *(Selesai di Dashboard Admin (Lakukan Penyesuain lagi))*
- [ ] **PBI-19** Kelola kategori
- [ ] **PBI-20** Daftar Laporan
- [x] **PBI-21** PWA Support *(Selesai di konfigurasi Next.js)*
- [x] **PBI-22** Update Status Laporan *(Selesai via Aksi Cepat Peta Admin)*
- [ ] **PBI-23** Notifikasi Otomatis

---

## 📁 Struktur File Penting

```
src/
├── app/
│   ├── (auth)/login/page.tsx          # Halaman login
│   ├── (auth)/register/page.tsx       # Halaman register
│   ├── (warga)/
│   │   ├── layout.tsx                 # ← Navbar + auth guard
│   │   ├── peta/page.tsx              # ← PBI-01 Peta Warga
│   │   └── riwayat/, notifikasi/      # Placeholder
│   ├── (admin)/
│   │   ├── layout.tsx                 # ← Sidebar + admin guard
│   │   └── dashboard/
│   │       ├── page.tsx               # ← Dashboard statistik
│   │       └── peta/page.tsx          # ← PBI-01 Peta Admin
│   └── api/
│       ├── auth/[...nextauth]/        # NextAuth handler
│       ├── auth/register/route.ts     # API register
│       └── laporan/
│           ├── route.ts               # GET laporan (filter, search, adminView)
│           └── [id]/route.ts          # PATCH status (admin-only)
├── components/
│   ├── auth/AuthScreen.tsx            # Form login/register + NextAuth
│   ├── layout/WargaNavbar.tsx         # Navbar warga
│   ├── layout/AdminSidebar.tsx        # Sidebar admin
│   ├── map/MapView.tsx                # Peta warga (Leaflet)
│   ├── map/AdminMapView.tsx           # Peta admin (aksi cepat)
│   ├── map/LocationPicker.tsx         # Picker lokasi (dari tim)
│   ├── Providers.tsx                  # SessionProvider wrapper
│   └── NotificationBell.tsx           # Notifikasi (dari tim)
├── hooks/
│   ├── useLaporanMap.ts               # Hook fetch data peta
│   ├── useGeolocation.ts              # Hook GPS (dari tim)
│   └── useNotifications.ts            # Hook notifikasi (dari tim)
├── lib/
│   ├── auth.ts                        # NextAuth config (credentials)
│   └── prisma.ts                      # PrismaClient singleton + PrismaPg adapter
└── types/
    └── laporan.ts                     # Shared types + STATUS_CONFIG
```

---

*File ini adalah representasi utama dari progres dan dokumentasi proyek. Asisten AI mana pun dapat menjadikan file ini sebagai pedoman langkah kerja pengembangan.*
