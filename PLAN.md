# Plan Struktur Proyek LaporLingkungan

## 1. Daftar Fitur Aplikasi

### Fitur Warga
1. ✅ **Registrasi & Login** - Akun warga untuk membuat laporan
2. ✅ **Buat Laporan** - Upload foto + pilih lokasi (GPS/manual) + kategori + deskripsi masalah
3. ✅ **Peta Interaktif** - Visualisasi semua laporan di map dengan marker (Leaflet.js)
4. ✅ **Lihat Detail Laporan** - Foto, lokasi, status, jumlah vote, deskripsi lengkap
5. ✅ **Upvote/Vote Laporan** - Crowdsourcing validasi (1 user = 1 vote per laporan)
6. ✅ **Tracking Status** - Pantau status laporan (Menunggu → Diproses → Selesai)
7. ✅ **Riwayat Laporan** - Lihat semua laporan yang pernah dibuat oleh user
8. ✅ **Notifikasi Real-time** - Dapat notifikasi saat status laporan berubah (via SSE)
9. ✅ **PWA Support** - Bisa diinstall di smartphone, akses offline untuk halaman tertentu

### Fitur Admin (Pemerintah)
1. ✅ **Dashboard Analytics** - Grafik & statistik laporan (per kategori, per status, trend waktu)
2. ✅ **Kelola Laporan** - Lihat semua laporan dalam bentuk tabel dengan filter
3. ✅ **Update Status Laporan** - Ubah status laporan (Menunggu → Diproses → Selesai)
4. ✅ **Kelola Kategori** - CRUD kategori masalah (tambah, edit, hapus kategori)
5. ✅ **Notifikasi Otomatis** - Sistem otomatis kirim notif ke warga saat update status

### Fitur Teknis/Infrastruktur
- 🗺️ **Leaflet.js** - Map interaktif open source dengan marker clustering
- 📸 **Cloudinary** - Cloud storage untuk foto laporan
- 🔐 **NextAuth.js** - Authentication & authorization (2 role: Warga & Admin)
- 💾 **PostgreSQL + Prisma ORM** - Database relational dengan type-safe queries
- 📱 **PWA (next-pwa)** - Progressive Web App (installable + offline support)
- ⚡ **SSE (Server-Sent Events)** - Real-time notifications tanpa WebSocket

**Total: 14 fitur utama** (9 fitur warga + 5 fitur admin)

---

## 2. Rekomendasi Teknis

### Real-time Notifications
**Rekomendasi: Server-Sent Events (SSE) atau Polling sederhana**

Pilihan:
- ✅ **SSE (Server-Sent Events)** - Cocok untuk notifikasi one-way dari server, mudah diimplementasi di Next.js
- ✅ **Polling sederhana** - Paling simple, cek notifikasi baru setiap X detik
- ⚠️ WebSocket - Overkill untuk use case ini, butuh infrastruktur tambahan
- ⚠️ Pusher/Firebase - Tambah dependency & biaya

**Pilihan saya: SSE** karena lebih efisien dari polling tapi lebih simple dari WebSocket.
---

## 3. Database Schema (Prisma)

```prisma
// User - untuk warga dan admin
model User {
  id            String   @id @default(cuid())
  name          String
  email         String   @unique
  password      String   // hashed
  role          Role     @default(WARGA)
  laporan       Laporan[]
  votes         Vote[]
  notifikasi    Notifikasi[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

enum Role {
  WARGA
  ADMIN
}

// Laporan masalah
model Laporan {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id])
  judul         String
  deskripsi     String
  kategoriId    String
  kategori      Kategori @relation(fields: [kategoriId], references: [id])
  foto          String[] // URLs dari Cloudinary
  latitude      Float
  longitude     Float
  alamat        String?  // Geocoded address
  status        Status   @default(MENUNGGU)
  votes         Vote[]
  voteCount     Int      @default(0)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  selesaiAt     DateTime?
}

enum Status {
  MENUNGGU
  DIPROSES
  SELESAI
}

// Kategori laporan (fleksibel, bisa ditambah admin)
model Kategori {
  id            String   @id @default(cuid())
  nama          String   @unique
  icon          String?  // emoji atau icon name
  warna         String?  // hex color untuk marker di map
  laporan       Laporan[]
  createdAt     DateTime @default(now())
}

// Vote/Upvote
model Vote {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id])
  laporanId     String
  laporan       Laporan  @relation(fields: [laporanId], references: [id])
  createdAt     DateTime @default(now())

  @@unique([userId, laporanId]) // satu user cuma bisa vote 1x per laporan
}

// Notifikasi
model Notifikasi {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id])
  judul         String
  pesan         String
  laporanId     String?  // link ke laporan terkait
  dibaca        Boolean  @default(false)
  createdAt     DateTime @default(now())
}
```

---

## 4. Struktur Folder & File Lengkap

```
LaporLingkungan/
│
├── src/
│   ├── app/                           # Next.js App Router
│   │   ├── (auth)/                   # Route group: halaman auth (no layout navbar)
│   │   │   ├── login/
│   │   │   │   └── page.tsx          # Halaman login
│   │   │   └── register/
│   │   │       └── page.tsx          # Halaman register
│   │   │
│   │   ├── (warga)/                  # Route group: halaman warga (dengan navbar)
│   │   │   ├── layout.tsx            # Layout dengan navbar warga
│   │   │   ├── page.tsx              # Dashboard warga / home
│   │   │   ├── laporan/
│   │   │   │   ├── page.tsx          # List semua laporan
│   │   │   │   ├── buat/
│   │   │   │   │   └── page.tsx      # Form buat laporan baru
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx      # Detail laporan
│   │   │   ├── peta/
│   │   │   │   └── page.tsx          # Peta interaktif dengan marker
│   │   │   ├── riwayat/
│   │   │   │   └── page.tsx          # Riwayat laporan user
│   │   │   └── notifikasi/
│   │   │       └── page.tsx          # List notifikasi
│   │   │
│   │   ├── (admin)/                  # Route group: halaman admin
│   │   │   ├── layout.tsx            # Layout dengan sidebar admin
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx          # Dashboard admin dengan grafik
│   │   │   ├── kelola-laporan/
│   │   │   │   ├── page.tsx          # Tabel semua laporan
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx      # Update status laporan
│   │   │   └── kelola-kategori/
│   │   │       └── page.tsx          # CRUD kategori
│   │   │
│   │   ├── api/                      # API Routes
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts      # NextAuth handler
│   │   │   ├── laporan/
│   │   │   │   ├── route.ts          # GET all, POST create
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts      # GET, PATCH, DELETE by ID
│   │   │   ├── vote/
│   │   │   │   └── route.ts          # POST vote/unvote
│   │   │   ├── upload/
│   │   │   │   └── route.ts          # POST upload foto ke Cloudinary
│   │   │   ├── notifikasi/
│   │   │   │   ├── route.ts          # GET notifikasi user
│   │   │   │   └── sse/
│   │   │   │       └── route.ts      # SSE endpoint untuk real-time
│   │   │   └── kategori/
│   │   │       └── route.ts          # CRUD kategori (admin only)
│   │   │
│   │   ├── layout.tsx                # Root layout (PWA manifest, global styles)
│   │   ├── page.tsx                  # Landing page publik
│   │   └── globals.css               # Tailwind CSS imports
│   │
│   ├── components/                   # Komponen reusable
│   │   ├── map/
│   │   │   ├── MapView.tsx           # Wrapper Leaflet map
│   │   │   ├── MarkerCluster.tsx     # Cluster markers
│   │   │   └── LocationPicker.tsx    # Pick location untuk form laporan
│   │   ├── laporan/
│   │   │   ├── LaporanCard.tsx       # Card item laporan
│   │   │   ├── LaporanForm.tsx       # Form buat/edit laporan
│   │   │   ├── LaporanDetail.tsx     # Detail view laporan
│   │   │   ├── StatusBadge.tsx       # Badge status (Menunggu/Diproses/Selesai)
│   │   │   ├── VoteButton.tsx        # Tombol upvote dengan counter
│   │   │   └── ImageGallery.tsx      # Gallery foto laporan
│   │   ├── admin/
│   │   │   ├── StatsCard.tsx         # Card statistik dashboard
│   │   │   ├── LaporanTable.tsx      # Tabel laporan untuk admin
│   │   │   ├── ChartLaporan.tsx      # Chart analitik (bar/line chart)
│   │   │   └── UpdateStatusModal.tsx # Modal update status laporan
│   │   ├── ui/                       # Komponen UI dasar
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Badge.tsx
│   │   │   └── Spinner.tsx
│   │   ├── layout/
│   │   │   ├── Navbar.tsx            # Navbar warga
│   │   │   ├── AdminSidebar.tsx      # Sidebar admin
│   │   │   └── Footer.tsx
│   │   └── NotificationBell.tsx      # Icon notifikasi dengan badge
│   │
│   ├── lib/                          # Utilities & configs
│   │   ├── prisma.ts                 # Prisma client singleton
│   │   ├── auth.ts                   # NextAuth config & options
│   │   ├── cloudinary.ts             # Cloudinary upload utility
│   │   ├── notifications.ts          # Notification helper functions
│   │   ├── geolocation.ts            # Geocoding utilities
│   │   └── utils.ts                  # General utilities (cn, formatters, dll)
│   │
│   ├── hooks/                        # Custom React hooks
│   │   ├── useGeolocation.ts         # Get user location
│   │   ├── useNotifications.ts       # SSE notifications hook
│   │   └── useDebounce.ts            # Debounce utility
│   │
│   ├── types/                        # TypeScript types
│   │   ├── laporan.ts                # Types untuk laporan
│   │   ├── user.ts                   # Types untuk user
│   │   └── index.ts                  # Export semua types
│   │
│   └── middleware.ts                 # Next.js middleware (auth protection)
│
├── prisma/
│   ├── schema.prisma                 # Database schema
│   ├── seed.ts                       # Seed data (kategori default, admin user)
│   └── migrations/                   # Migration files (auto-generated)
│
├── public/
│   ├── icons/                        # PWA icons (berbagai ukuran)
│   │   ├── icon-72x72.png
│   │   ├── icon-96x96.png
│   │   ├── icon-128x128.png
│   │   ├── icon-144x144.png
│   │   ├── icon-152x152.png
│   │   ├── icon-192x192.png
│   │   ├── icon-384x384.png
│   │   └── icon-512x512.png
│   ├── manifest.json                 # PWA manifest
│   ├── favicon.ico
│   └── images/                       # Static images
│       └── placeholder.png
│
├── .env.local                        # Environment variables (gitignore)
├── .env.example                      # Template env variables
├── .gitignore
├── next.config.js                    # Next.js config + next-pwa
├── package.json                      # Dependencies
├── tsconfig.json                     # TypeScript config
├── tailwind.config.js                # Tailwind CSS config
├── postcss.config.js                 # PostCSS config
├── prettier.config.js                # Prettier config (optional)
├── eslint.config.js                  # ESLint config
└── README.md                         # Dokumentasi proyek
```

---

## 5. Environment Variables (.env.example)

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/laporlingkungan"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Map (optional: jika pakai Mapbox/Google Maps API)
NEXT_PUBLIC_MAP_API_KEY=""
```

---

## 6. Dependencies Utama (package.json)

```json
{
  "dependencies": {
    "next": "^14.x",
    "react": "^18.x",
    "react-dom": "^18.x",
    "next-auth": "^4.x",
    "@prisma/client": "^5.x",
    "leaflet": "^1.9.x",
    "react-leaflet": "^4.x",
    "cloudinary": "^2.x",
    "next-pwa": "^5.x",
    "tailwindcss": "^3.x",
    "recharts": "^2.x",
    "zod": "^3.x",
    "react-hook-form": "^7.x",
    "@hookform/resolvers": "^3.x"
  },
  "devDependencies": {
    "prisma": "^5.x",
    "typescript": "^5.x",
    "@types/react": "^18.x",
    "@types/leaflet": "^1.9.x",
    "eslint": "^8.x",
    "prettier": "^3.x"
  }
}
```

---

## 7. Catatan Penting

### PWA Setup (next-pwa)
- Service worker akan auto-generate untuk caching
- Manifest.json define app name, icons, theme color
- Offline fallback untuk halaman utama

### Auth Flow
- NextAuth.js dengan credential provider
- Middleware protect routes berdasarkan role
- Session management dengan JWT

### Map Integration
- Leaflet.js (open source, no API key needed untuk basic)
- Marker clustering untuk performa
- Geolocation API browser untuk get user location

### File Upload Flow
1. User pilih foto → Preview di frontend
2. Submit form → Upload ke Cloudinary via API route
3. Dapat URL → Simpan di database array

### Real-time Notification Flow (SSE)
1. Client buka connection ke `/api/notifikasi/sse`
2. Server keep connection open
3. Saat ada update status laporan → kirim event
4. Client terima event → update UI + badge notifikasi

---

## 8. Langkah Eksekusi Selanjutnya

Setelah struktur folder dibuat:

1. ✅ Setup project: `npx create-next-app@latest`
2. ✅ Install dependencies
3. ✅ Setup Prisma & database
4. ✅ Buat file struktur kosong (layout, page, component templates)
5. ⏳ Implementasi fitur per modul (phase by phase)

---
