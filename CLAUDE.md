# Context Session - LaporLingkungan Project

*Terakhir update: 2 April 2026*

---

## 📌 Project Overview

**Nama Project:** LaporLingkungan (sebelumnya: PantauKota)

**Deskripsi:**
Aplikasi web berbasis Progressive Web App (PWA) untuk pelaporan masalah perkotaan (sampah, jalan rusak, banjir, dll) oleh warga dengan foto dan lokasi GPS. Laporan ditampilkan di peta interaktif dan bisa di-track statusnya. Ada 2 role: Warga dan Admin (pemerintah).

**Jenis Project:**
- Tugas kelompok kuliah
- Menggunakan Agile Scrum Framework
- Proposal (Bab 5: Sprint Planning)
- Timeline: 6 minggu (3 sprint × 2 minggu)

---

## 🛠️ Tech Stack (Final - Sudah Disepakati)

### Frontend
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS

### Backend
- Next.js API Routes
- NextAuth.js v4 (credential provider)

### Database
- PostgreSQL (cloud: Supabase/Railway/Neon)
- Prisma ORM

### Map
- Leaflet.js
- React Leaflet
- Geolocation API

### Storage
- Cloudinary (upload foto)

### Charts
- Recharts (dashboard admin)

### Form & Validation
- React Hook Form
- Zod

### PWA
- next-pwa

### Real-time
- Server-Sent Events (SSE) - untuk notifikasi

### Deployment
- Vercel (hosting)
- Cloud PostgreSQL (production DB)

---

## 📋 Fitur Utama (14 Fitur)

### Fitur Warga (9):
1. Registrasi & Login
2. Buat Laporan (foto + lokasi + kategori + deskripsi)
3. Peta Interaktif (visualisasi laporan)
4. Lihat Detail Laporan
5. Upvote/Vote Laporan
6. Tracking Status (Menunggu → Diproses → Selesai)
7. Riwayat Laporan
8. Notifikasi Real-time (saat status berubah)
9. PWA Support (installable + offline)

### Fitur Admin (5):
1. Dashboard Analytics (grafik & statistik)
2. Kelola Laporan (table view)
3. Update Status Laporan
4. Kelola Kategori (CRUD)
5. Notifikasi Otomatis ke warga

---

## 🗄️ Database Schema (Prisma)

### 5 Model Utama:

1. **User**
   - id, name, email, password (hashed), role (WARGA/ADMIN)
   - Relations: laporan[], votes[], notifikasi[]

2. **Laporan**
   - id, userId, judul, deskripsi, kategoriId, foto[] (URLs), latitude, longitude, alamat, status (MENUNGGU/DIPROSES/SELESAI), voteCount
   - Relations: user, kategori, votes[]

3. **Kategori**
   - id, nama, icon, warna
   - Relations: laporan[]
   - **Note:** Fleksibel, admin bisa tambah/edit/delete

4. **Vote**
   - id, userId, laporanId
   - Constraint: @@unique([userId, laporanId]) → 1 user = 1 vote per laporan

5. **Notifikasi**
   - id, userId, judul, pesan, laporanId (optional), dibaca (boolean)
   - Relations: user

---

## 📅 Sprint Planning (3 Sprint - Agile Scrum)

### Sprint 1: Requirement Gathering, System Design, Environment Setup
**Durasi:** 2 minggu (Minggu 1-2)

**Deliverables:**
- Product backlog, ERD, API docs, wireframe, architecture diagram
- Project foundation siap

### Sprint 2: Core Development, Database Integration, API Implementation
**Durasi:** 2 minggu (Minggu 3-4)

**Deliverables:**
- API lengkap & tested
- UI components + pages terintegrasi
- Peta interaktif functional
- App end-to-end

### Sprint 3: Testing & QA, UI/UX Polish, Deployment
**Durasi:** 2 minggu (Minggu 5-6)

**Deliverables:**
- App bebas bug, polished, accessible
- PWA & SSE (optional)
- Deployed & documented

---

## 📝 Keputusan Penting

1. **Real-time:** SSE (bukan WebSocket)
2. **Database:** Cloud PostgreSQL (TIDAK pakai Docker)
3. **Styling:** Tailwind CSS
4. **Map:** Leaflet.js (open source, gratis)
5. **Kategori:** Fleksibel (admin CRUD)

---

## 📂 File yang Sudah Dibuat

1. `intruksi-awal.md` - Instruksi project
2. `PLAN.md` - Tech stack, database schema, struktur folder
3. `PEMBAGIAN-TUGAS.md` - Detail sprint & pembagian tugas
4. `SPRINT-PLANNING-PROPOSAL.md` - Simple sprint untuk Bab 5 proposal ⭐
5. `CLAUDE.md` - Context session (file ini)

---

## ⚠️ Catatan PBI (Belum Diimplementasikan)

**Requirement:**
- 12-16 PBI (exclude login/logout)
- 1 anggota : 3 PBI
- 1 PBI = 6 hari part-time
- 1 PBI = 1 tujuan bisnis
- Medium complexity

**Status:**
- Sudah dibahas 16 PBI breakdown
- Belum buat PRODUCT-BACKLOG.md formal
- Nanti baru didetailkan (user bilang "PBI nya nanti aja deh")

---

## 📌 Current Status

### ✅ Sudah:
- Tech stack final
- Database schema designed
- Sprint planning documented (for proposal)
- File SPRINT-PLANNING-PROPOSAL.md siap untuk Bab 5

### ⏳ Belum:
- Implementasi kode
- PBI formal dengan user stories
- Struktur folder actual
- Git repo setup

### 🎯 Next Steps:
1. **Bab 5 Proposal:** Pakai SPRINT-PLANNING-PROPOSAL.md ✅
2. **Mulai coding:** Buat struktur folder sesuai PLAN.md
3. **Detail PBI:** Buat PRODUCT-BACKLOG.md
4. **Setup:** Init Next.js, Prisma, Git

---

## 💡 Hal Penting

- Ini tugas KELOMPOK (4-5 orang)
- Agile Scrum (PO, SM, Dev Team)
- 3 Sprint × 2 minggu = 6 minggu
- PBI = per fitur lengkap (bukan task)
- No Docker (pakai cloud)
- SSE untuk notif
- Kategori fleksibel

---

**Session saved.** Untuk session baru: baca file ini! ✅
