# PantauKota (Aplikasi Lapor Lingkungan) - Project Context & Status
**Status Terakhir Diperbarui:** Setup Sistem Desain (Civic Clarity) & Antarmuka Halaman Auth


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
Aplikasi ini memiliki 5 model inti:
1. **User**: Mengelola data partisipan (`WARGA` atau `ADMIN`).
2. **Laporan**: Terdapat _field_ penting seperti `status` (MENUNGGU, DIPROSES, SELESAI), bukti `foto` awal, titik lokasi, serta `catatanAdmin` dan `fotoPenyelesaian` bila masalah sudah dibereskan.
3. **Kategori**: Fleksibel dan dirancang dengan _soft-delete_ (`isActive` boolean) agar tidak merusak relasi pelaporan lama jika ada kategori yang dinonaktifkan Admin.
4. **Vote**: Mencegah 1 warga mem-vote 1 laporan lebih dari sekali (`@@unique([userId, laporanId])`).
5. **Notifikasi**: Dicatat dalam database dan nantinya ditransfer real-time via SSE.

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

### ⏳ BERIKUTNYA (NEXT STEPS)
- [ ] **Logika Autentikasi Backend**: Mengintegrasikan antarmuka Login/Register dengan **NextAuth.js** dan database (Prisma).
- [ ] **Komponen UI Global**: Pembuatan _Navbar_ (Warga) & _Sidebar_ (Admin).
- [ ] **Database Seeding**: Pembuatan file _seed_ awal (Akun Admin pertama & daftar entitas Kategori).
- [ ] **Fitur Inti Warga**: Pembuatan form tambah laporan (dengan penanganan batas limit 3 per hari) beserta integrasi navigasi peta _Leaflet_.
- [ ] **Fitur Inti Admin**: Dashboard statistik rekapitulasi, tabel laporan interaktif, pengelolaan status beserta _feedback_ balasan (termasuk unggahan gambar).

---

*File ini adalah representasi utama dari progres dan dokumentasi proyek. Asisten AI mana pun dapat menjadikan file ini sebagai pedoman langkah kerja pengembangan.*
