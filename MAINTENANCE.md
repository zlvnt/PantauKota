# 📚 Panduan Maintenance PantauKota

## 🏗️ Struktur Project

```
pantaukota/
├── prisma/                 # Database schema & migrations
│   ├── schema.prisma      # Model database
│   ├── seed.ts            # Data dummy untuk development
│   └── migrations/        # History migrasi database
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── (admin)/      # Route group untuk admin
│   │   ├── (auth)/       # Route group untuk autentikasi
│   │   ├── (warga)/      # Route group untuk warga
│   │   └── api/          # API endpoints
│   ├── components/        # React components
│   │   ├── admin/        # Komponen khusus admin
│   │   ├── auth/         # Komponen autentikasi
│   │   ├── laporan/      # Komponen laporan
│   │   ├── map/          # Komponen peta
│   │   └── ui/           # Komponen UI reusable
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions & configs
│   └── types/            # TypeScript type definitions
└── public/               # Static assets
```

## 🔑 File Penting

### Database & ORM
- `prisma/schema.prisma` - Definisi model database
- `src/lib/prisma.ts` - Konfigurasi Prisma Client dengan adapter PostgreSQL

### Autentikasi
- `src/lib/auth.ts` - Konfigurasi NextAuth.js
- `src/app/api/auth/[...nextauth]/route.ts` - NextAuth API handler
- `src/middleware.ts` - Middleware untuk proteksi route

### API Endpoints
- `src/app/api/laporan/route.ts` - CRUD laporan (dengan search & filter)
- `src/app/api/kategori/route.ts` - Manajemen kategori
- `src/app/api/vote/route.ts` - Sistem voting
- `src/app/api/komentar/route.ts` - Sistem komentar

### Komponen Utama
- `src/components/map/AdminMapView.tsx` - Peta untuk admin
- `src/components/map/MapView.tsx` - Peta untuk warga
- `src/components/admin/CompletionModal.tsx` - Modal penyelesaian laporan

## 🛠️ Cara Kerja Fitur Utama

### 1. Search & Filter Laporan
**File**: `src/app/api/laporan/route.ts`

Query menggunakan struktur `AND` array untuk menggabungkan filter:
```typescript
where: {
  AND: [
    // Filter status
    ...(status ? [{ status }] : []),
    
    // Filter kategori
    ...(kategoriId ? [{ kategoriId }] : []),
    
    // Search (judul, deskripsi, alamat, nama user untuk admin)
    ...(search ? [{ OR: [...] }] : []),
    
    // Auto-hide laporan SELESAI > 24 jam
    { OR: [...] }
  ]
}
```

### 2. Auto-Hide Laporan Selesai
Laporan dengan status SELESAI akan otomatis hilang dari peta setelah 24 jam.

**Logic**: Tampilkan jika (BELUM SELESAI) ATAU (SELESAI tapi < 24 jam)

### 3. Sistem Prioritas
- **Manual**: Admin bisa set flag `prioritas = true`
- **Otomatis**: Skor ≥ 50 (formula: `voteCount × 2 + hari_sejak_dibuat`)
- **Warna Marker**: Merah untuk prioritas, warna status untuk normal

### 4. Real-time Notifications
**File**: `src/app/api/notifikasi/sse/route.ts`

Menggunakan Server-Sent Events (SSE) untuk notifikasi real-time.

## 🔧 Task Maintenance Umum

### Menambah Kategori Baru
1. Tambahkan di `prisma/seed.ts` (untuk development)
2. Atau gunakan UI admin di `/kelola-kategori`

### Mengubah Threshold Prioritas
**File**: `src/types/laporan.ts` - Function `getMarkerColor()`
```typescript
if (priorityScore >= 50) { // Ubah angka 50 sesuai kebutuhan
  return PRIORITY_COLOR;
}
```

### Mengubah Durasi Auto-Hide
**File**: `src/app/api/laporan/route.ts`
```typescript
const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
// Ubah 24 menjadi durasi jam yang diinginkan
```

### Menambah Field Search
**File**: `src/app/api/laporan/route.ts`
```typescript
OR: [
  { judul: { contains: search, mode: 'insensitive' as const } },
  { deskripsi: { contains: search, mode: 'insensitive' as const } },
  { alamat: { contains: search, mode: 'insensitive' as const } },
  // Tambahkan field baru di sini
]
```

## 🐛 Troubleshooting

### Search Tidak Berfungsi
- Pastikan struktur query menggunakan `AND` array
- Cek apakah `mode: 'insensitive' as const` ada di semua field search
- Verifikasi tidak ada konflik antara multiple `OR` clause

### Peta Tidak Muncul
- Cek apakah Leaflet CSS ter-import: `import 'leaflet/dist/leaflet.css'`
- Pastikan `initLeafletIcons()` dipanggil
- Verifikasi koordinat latitude/longitude valid

### Error Prisma Client
- Jalankan `npx prisma generate` untuk regenerate client
- Pastikan `DATABASE_URL` di `.env` valid
- Cek apakah adapter PrismaPg ter-install

### Session/Auth Tidak Bekerja
- Verifikasi `NEXTAUTH_SECRET` di `.env` sudah diisi
- Cek `NEXTAUTH_URL` sesuai dengan URL aplikasi
- Pastikan middleware di `src/middleware.ts` aktif

## 📝 Konvensi Kode

### Naming
- **Components**: PascalCase (`AdminMapView.tsx`)
- **Hooks**: camelCase dengan prefix `use` (`useLaporanMap.ts`)
- **API Routes**: lowercase (`route.ts`)
- **Types**: PascalCase (`LaporanMapItem`)

### Struktur Component
```typescript
// 1. Imports
import { ... } from '...';

// 2. Types/Interfaces
interface Props { ... }

// 3. Helper functions (jika ada)
function helperFunction() { ... }

// 4. Main component
export default function Component({ props }: Props) {
  // 4a. State & hooks
  const [state, setState] = useState();
  
  // 4b. Effects
  useEffect(() => { ... }, []);
  
  // 4c. Handlers
  const handleClick = () => { ... };
  
  // 4d. Render
  return ( ... );
}
```

### Comments
- Gunakan `//` untuk single-line comments
- Gunakan `// ───` untuk section dividers
- Tambahkan JSDoc untuk function yang kompleks

## 🚀 Deployment Checklist

### Development Setup (Developer Baru)
- [ ] Clone repository
- [ ] `npm install`
- [ ] Pastikan `.env` ada (dengan DATABASE_URL yang di-share)
- [ ] `npx prisma generate`
- [ ] `npm run dev`
- [ ] ❌ **JANGAN** jalankan `npm run seed` (data sudah ada di database)
- [ ] ❌ **JANGAN** jalankan migrasi (database sudah ter-setup)

### Production Deployment
- [ ] Update `NEXTAUTH_SECRET` dengan nilai random yang kuat
- [ ] Set `NEXTAUTH_URL` ke URL production
- [ ] Verifikasi `DATABASE_URL` production
- [ ] Set Cloudinary credentials jika menggunakan upload gambar
- [ ] Jalankan `npm run build` untuk test build
- [ ] Jalankan migrasi database: `npx prisma migrate deploy`
- [ ] Seed data production (jika perlu): `npm run seed`

## 📞 Kontak

Untuk pertanyaan atau issue, silakan buat issue di repository atau hubungi tim development.