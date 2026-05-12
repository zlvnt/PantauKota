# PantauKota

PWA pelaporan masalah perkotaan untuk warga dan admin.

Warga dapat membuat laporan dengan foto/lokasi, vote, komentar, melihat notifikasi, dan menghapus laporan sendiri jika masih memenuhi aturan. Admin dapat meninjau laporan, mengubah status, mengelola kategori, user, dan melihat dashboard.

## Stack

| Area | Teknologi |
| --- | --- |
| Frontend | Next.js 14 App Router, React 18, TypeScript, Tailwind CSS |
| Backend | Next.js Route Handlers |
| Auth | Supabase Auth |
| Database | Supabase PostgreSQL + Prisma 7 |
| Realtime | Supabase Realtime |
| Images | Cloudinary public id + delivery transformations |
| Maps | Leaflet + React-Leaflet |
| Email | Resend |
| Deploy | Vercel |

## Setup

```bash
npm install
npx prisma generate
npm run dev
```

Buka `http://localhost:3000`.

## Environment

Lihat `.env.example`. Minimal:

```env
DATABASE_URL="postgresql://postgres.<project-ref>:<password>@<pooler-host>:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.<project-ref>:<password>@<pooler-host>:5432/postgres"

NEXT_PUBLIC_SUPABASE_URL="https://<project-ref>.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="sb_publishable_xxx"
SUPABASE_SERVICE_ROLE_KEY="sb_secret_or_service_role_xxx"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
RESEND_API_KEY="..."
```

`NEXT_PUBLIC_APP_URL` dipakai untuk link konfirmasi Supabase Auth dan link email aplikasi. Di production isi dengan domain Vercel/custom domain.

## Database Baru

Jika database Supabase masih kosong:

```bash
npx prisma migrate deploy
npm run seed
```

Jika `migrate deploy` gagal karena koneksi direct/session pooler, jalankan isi `prisma/supabase-init.sql` di Supabase SQL Editor, lalu:

```bash
npx prisma generate
npm run seed
```

Seed akan membuat data dummy dan akun Supabase Auth jika `SUPABASE_SERVICE_ROLE_KEY` valid.

## Akun Testing

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@pantaukota.id` | `password123` |
| Warga | `budi@warga.id` | `password123` |
| Warga | `siti@warga.id` | `password123` |
| Warga | `dewi@warga.id` | `password123` |

## Struktur Singkat

```text
prisma/
  schema.prisma
  seed.ts
  supabase-init.sql
src/
  app/                 Next.js routes dan API
  components/          UI, layout, laporan, map, komentar
  hooks/               auth session, notification, vote, map, toast
  lib/                 auth, supabase, prisma, email, cloudinary, helpers
  types/               shared types laporan
public/                assets PWA dan logo
```

## Gambar Laporan

Upload gambar tetap lewat `/api/upload` server-side ke Cloudinary. Response API berisi `publicId` dan `url`, tetapi data baru menyimpan `publicId` ke field lama:

- `foto: string[]`
- `fotoPenyelesaian: string | null`

Kolom database belum di-rename agar data lama aman. Render gambar memakai `getCloudinaryImageUrl()` di `src/lib/cloudinary.ts`, sehingga nilai baru berbentuk `pantaukota/...` dan URL lama Cloudinary/Unsplash tetap bisa ditampilkan. Kompresi client memakai `browser-image-compression` lewat `src/lib/client-image.ts` sebelum upload.

## Dokumentasi

- `AGENTS.md`: panduan coding untuk AI/agent.
- `MAINTENANCE.md`: operasional, env, deploy, troubleshooting.
- `DESIGN.md`: desain visual.
- `docs/SUPABASE-ARCHITECTURE.md`: arsitektur Supabase.
- `docs/SUPABASE-MIGRATION.md`: setup/migrasi Supabase.
- `docs/CLOUDINARY-IMAGES.md`: flow gambar Cloudinary dan kompatibilitas data lama.
- `docs/EMAIL-SERVICE.md`: konfigurasi email Resend.

## Verifikasi

```bash
npx tsc --noEmit
npx tsc -p tsconfig.seed.json --noEmit
```

Manual smoke test:
- Login warga dan admin.
- Register user baru, cek banner konfirmasi email, lalu klik link konfirmasi.
- Buat laporan dengan foto; DB harus menyimpan `pantaukota/...` public id.
- Vote dan komentar.
- Admin update status dan upload foto penyelesaian; `fotoPenyelesaian` juga public id.
- Notifikasi realtime muncul.
- Peta tampil tanpa area abu-abu.
- UI rapi di mobile 360px.