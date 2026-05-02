# PantauKota — Aplikasi Lapor Lingkungan

**Update:** 02 Mei 2026 | PBI-03, 10, 11, 12, 14, 22 ✅

---

## 📌 Deskripsi

PWA pelaporan masalah perkotaan (sampah, jalan rusak, fasilitas umum) dengan bukti foto dan GPS.

**Aktor:**
- **Warga** — Lapor, vote, komentar (maks 3 laporan/hari)
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
| UI | `lucide-react`, sistem desain "Editorial Ledger" |
| PWA | `next-pwa` |
| Real-Time | Server-Sent Events (SSE) |

---

## 🚀 Setup

### Prasyarat
- Node.js >= 18
- Connection String Neon.tech

### Langkah
```bash
npm install
# Buat .env dari .env.example
npx prisma generate
npm run seed  # Opsional
npm run dev
```

### Akun Testing
| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@pantaukota.id` | `password123` |
| Warga | `budi@warga.id` | `password123` |

---

## 📂 Struktur Folder

```
src/
├── app/
│   ├── (auth)/login, register
│   ├── (warga)/beranda, peta, laporan, notifikasi
│   ├── (admin)/dashboard, kelola-laporan, kelola-kategori
│   └── api/laporan, kategori, notifikasi, vote, upload
├── components/
│   ├── ui/Badge, Spinner, DynamicIcon, Toast, VoteButton
│   ├── laporan/StatusTimeline, PrioritasScore
│   ├── admin/CompletionModal
│   ├── map/MapView, AdminMapView, LocationPicker
│   └── layout/WargaNavbar, AdminSidebar
├── hooks/useDebounce, useLaporanMap, useVote, useToast, useNotifications
├── lib/auth, map, prisma, notifications
└── types/laporan
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
- **Floating UI** — `rounded-3xl`, shadow ambient
- **Tonal Layering** — `surface-container-lowest/low/high`

---

## ✅ Status PBI

| PBI | Nama | Status |
|-----|------|--------|
| 01 | Visualisasi Peta Interaktif | ✅ Selesai |
| 02 | Filter & Search Peta | ✅ Selesai |
| 03 | Manajemen Profil | ✅ Selesai |
| 04 | Notifikasi Real-time | ✅ Selesai (SSE + UI bell + hapus notif) |
| 05 | Location Picker | ✅ Selesai (GPS + click map + reverse geocode) |
| 06 | Komentar Laporan | ✅ Selesai (CRUD + real-time) |
| 07 | Form Laporan | 🔲 Belum |
| 08 | Upload Foto & Geolocation | 🔲 Belum |
| 09 | Lihat Detail Laporan | ✅ Selesai (warga + admin) |
| 10 | Upvote/Vote Laporan | ✅ Selesai (unlimited, optimistic UI) |
| 11 | Tracking Status | ✅ Selesai (timeline 3 tahap) |
| 12 | Sistem Prioritas Laporan | ✅ Selesai (formula + marker warna) |
| 13 | Riwayat Laporan | 🔲 Belum |
| 14 | Kelola Laporan | ✅ Selesai (filter, search, sorting) |
| 15 | Deteksi Duplikasi | 🔲 Belum |
| 16 | Kelola User / Admin | 🔲 Belum |
| 17 | Statistik & Grafik Laporan | 🟡 Statistik angka selesai, chart belum |
| 18 | Tabel Monitoring Laporan | 🟡 Tabel 5 terbaru selesai |
| 19 | Kelola Kategori | 🔲 Belum |
| 20 | Daftar Laporan | 🔲 Belum |
| 21 | PWA Support | ✅ Selesai (konfigurasi next-pwa) |
| 22 | Update Status Laporan | ✅ Selesai (completion modal + notifikasi) |
| 23 | Notifikasi Otomatis | 🔲 Belum |

**Legenda:**
- ✅ Selesai — Fitur lengkap dan terintegrasi
- 🟡 Sebagian — Fitur dasar ada, perlu enhancement
- 🔲 Belum — Belum dikerjakan

---

## 🎉 Recent Updates (Mei 2026)

### TC-11.3 & TC-12.3 ✅

**Completion Modal (TC-11.3):**
- Modal saat admin klik "Selesai"
- Input: Catatan (wajib), Foto (opsional, max 5MB)
- Toast notifications, loading states
- API: `PATCH /api/laporan/[id]`

**Kelola Laporan (TC-12.3):**
- Route: `/kelola-laporan`
- Search (debounced 400ms), filter kategori & status
- Statistik: total, menunggu, diproses, selesai, urgent
- Sorting: prioritas dulu, lalu terbaru
- Link detail: `/dashboard/laporan/[id]`

**Priority Marker Enhancement:**
- SELESAI → Hijau (selalu)
- Prioritas (belum selesai) → Merah jika flag=true ATAU skor≥50
- Non-Prioritas → Amber/Blue sesuai status

**UI/UX:**
- Kategori text `text-white` saat aktif
- Toast untuk semua feedback
- Responsive, no horizontal scroll

---

### PBI-10, 11, 12 ✅

**Vote (PBI-10):**
- Unlimited vote, optimistic UI
- Rollback auto jika gagal
- Animasi bounce, toast error
- Icon filled/outlined

**Tracking Status (PBI-11):**
- Timeline 3 tahap: MENUNGGU → DIPROSES → SELESAI
- Icon dinamis (Clock, Loader2, CheckCircle)
- Tanggal + jam, catatan admin, foto penyelesaian

**Prioritas (PBI-12):**
- Formula: `score = (voteCount × 2) + hari`
- Badge skor dengan warna dinamis
- Flag manual admin
- Sorting otomatis

---

### PBI-03: Manajemen Profil ✅

- Update nama & password
- Validasi nama unik
- Toast notifications
- Session update real-time
- No logout after password change
- Responsive full-screen layout
- Password visibility toggle persistent
- Back button navigation

---

## 🔐 Proteksi Route

| Rute | Akses |
|------|-------|
| `/dashboard/*`, `/kelola-*` | Admin only |
| `/laporan/buat`, `/notifikasi/*` | Login |
| `/peta` | Login |
| `/login`, `/register` | Publik |

Implementasi: `src/middleware.ts`

---

*Detail arsitektur: `AI.md`*
