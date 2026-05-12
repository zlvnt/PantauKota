# MAINTENANCE.md - PantauKota

Panduan singkat untuk menjalankan, mengecek, dan merawat PantauKota.

## Arsitektur

- Frontend: Next.js 14 App Router, React 18, Tailwind CSS.
- Backend: Next.js Route Handlers.
- Database: Supabase PostgreSQL via Prisma 7.
- Auth: Supabase Auth.
- Realtime: Supabase Realtime untuk `Notifikasi`.
- Images: Cloudinary public id + delivery transformations.
- Email: Resend.
- Deploy: Vercel.

## Environment

Minimal `.env` development:

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
RESEND_FROM_EMAIL="PantauKota <onboarding@resend.dev>"
```

Catatan:
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` dipakai browser untuk login/session.
- `SUPABASE_SERVICE_ROLE_KEY` hanya server/seed. Jangan expose ke client.
- `NEXT_PUBLIC_APP_URL` dipakai untuk link konfirmasi Supabase Auth dan link email aplikasi.

## Setup Lokal

```bash
npm install
npx prisma generate
npm run dev
```

Jika Supabase kosong dan `migrate deploy` gagal karena pooler/direct connection:

1. Jalankan isi `prisma/supabase-init.sql` di Supabase SQL Editor.
2. Jalankan:

```bash
npx prisma generate
npm run seed
```

`npm run seed` akan reset data dummy laporan, vote, komentar, dan notifikasi. Jika `SUPABASE_SERVICE_ROLE_KEY` valid, seed juga membuat akun Supabase Auth testing.

## Akun Testing

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@pantaukota.id` | `password123` |
| Warga | `budi@warga.id` | `password123` |
| Warga | `siti@warga.id` | `password123` |
| Warga | `dewi@warga.id` | `password123` |

Jika login gagal tetapi tabel `User` ada, cek Supabase Dashboard > Authentication > Users. Email Auth harus sama dengan email di tabel `User`.

## File yang Sering Disentuh

| Area | File |
| --- | --- |
| Auth server | `src/lib/auth.ts` |
| Supabase client | `src/lib/supabase/*` |
| Session client | `src/hooks/useAuthSession.tsx` |
| Route guard | `src/middleware.ts` |
| Prisma client | `src/lib/prisma.ts` |
| Schema DB | `prisma/schema.prisma` |
| Seed | `prisma/seed.ts` |
| Fallback SQL Supabase | `prisma/supabase-init.sql` |
| Notifikasi create | `src/lib/notifications.ts` |
| Notifikasi realtime | `src/hooks/useNotifications.ts` |
| Email | `src/lib/email.ts` |
| Upload | `src/app/api/upload/route.ts`, `src/lib/client-image.ts`, `src/lib/cloudinary.ts` |
| Map config | `src/lib/map.ts` |
| Constants/helpers | `src/lib/constants.ts`, `src/lib/utils.ts`, `src/lib/api-helpers.ts` |

## Flow Auth

1. Login/register UI ada di `src/components/auth/AuthScreen.tsx`.
2. Register membuat akun Supabase Auth dan profil awal di tabel `User`.
3. Jika email confirmation aktif, user melihat banner untuk membuka email dan link diarahkan ke `/auth/callback`.
4. `/auth/callback` menukar confirmation code menjadi session Supabase, lalu redirect ke `/beranda`.
5. `src/middleware.ts` refresh session dan melindungi route.
6. Server code memakai `getCurrentSession()`.
7. `getCurrentSession()` mengambil Supabase Auth user lalu mencari profil aplikasi di tabel `User` berdasarkan email. Jika profil belum ada, dibuat otomatis dengan `upsert` (bukan `create`) untuk mencegah race condition.
8. Role dan `isActive` selalu dari tabel `User`.

Jika muncul pesan "Akun belum tersinkron dengan profil aplikasi":
- Biasanya disebabkan race condition saat `getCurrentSession()` dipanggil parallel. Sudah ditangani dengan `upsert` di `src/lib/auth.ts`.
- Cek apakah email di Supabase Auth (Dashboard > Authentication > Users) sama persis dengan email di tabel `User`.
- Cek apakah user `isActive = true`.

Jangan pakai NextAuth. Paket lama bisa muncul sebagai extraneous di `node_modules`, tetapi source tidak lagi menggunakannya.

## Flow Notifikasi

1. API membuat notifikasi lewat `kirimNotifikasi()`.
2. Data masuk tabel `Notifikasi`.
3. `useNotifications()` fetch awal dari `/api/notifikasi`.
4. Client subscribe insert baru via Supabase Realtime.

Jika realtime tidak masuk:
- Pastikan `ALTER PUBLICATION supabase_realtime ADD TABLE "Notifikasi";` sudah dijalankan.
- Cek `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- Cek user login punya `User.id` yang sama dengan `Notifikasi.userId`.
- **Filter `postgres_changes` menggunakan validasi client-side** (bukan `filter:` option) karena kolom camelCase seperti `userId` tidak dikenali Supabase Realtime filter parser. Jangan tambahkan `filter:` option di `useNotifications.ts`.

## Maintenance Umum

Ubah limit dashboard warga:
- Gunakan `DASHBOARD_LAPORAN_LIMIT` dari `src/lib/constants.ts`.

Ubah pagination laporan:
- Gunakan `LAPORAN_PER_PAGE`.

Ubah batas hapus laporan:
- Gunakan `HOURS_24_MS` dan helper `canDeleteLaporan()`.

Ubah threshold prioritas:
- Gunakan `PRIORITY_THRESHOLD`.

Ubah warna marker:
- Edit `src/types/laporan.ts`, tetap lewat `getMarkerColor()`.

Tambah kategori icon:
- Daftarkan di `src/components/ui/DynamicIcon.tsx`.

Tambah query berat:
- Cek index di `prisma/schema.prisma` sebelum menambah filter/sort baru.

## Flow Gambar Cloudinary

1. Client memilih/mengambil foto.
2. Client kompres file lewat `uploadCompressedImage()` di `src/lib/client-image.ts`.
3. `/api/upload` upload ke Cloudinary tanpa eager `transformation`.
4. API mengembalikan `{ publicId, url }`.
5. Data baru menyimpan `publicId` ke field lama:
   - `foto: string[]`
   - `fotoPenyelesaian: string | null`
6. UI render lewat `getCloudinaryImageUrl()` di `src/lib/cloudinary.ts`.

Aturan:
- Jangan rename kolom `foto` / `fotoPenyelesaian` tanpa migrasi terpisah.
- Jangan simpan `secure_url` untuk data baru kecuali fallback response lama tidak punya `publicId`.
- Data lama boleh tetap full URL. Helper Cloudinary harus tetap backward-compatible.
- Detail memakai `CLOUDINARY_DETAIL_IMAGE_OPTIONS`; thumbnail/list/peta memakai `CLOUDINARY_THUMBNAIL_IMAGE_OPTIONS`.

## Verifikasi

Sebelum commit:

```bash
npx tsc --noEmit
npx tsc -p tsconfig.seed.json --noEmit
```

Manual smoke test:
- Register/login warga.
- Konfirmasi email register dan pastikan redirect tidak ke domain yang salah.
- Login admin.
- Buat laporan dengan foto -> pastikan DB `foto` berisi `pantaukota/...` public id dan gambar tampil di halaman detail.
- Vote dan komentar.
- Admin update status dan upload foto penyelesaian -> pastikan `fotoPenyelesaian` juga `pantaukota/...`.
- Notifikasi muncul **otomatis tanpa refresh** (realtime).
- Email terkirim jika Resend diset.
- Peta tampil di mobile dan desktop.
- Tidak ada horizontal scroll di 360px.
- Cek browser console: tidak ada `Tracking Prevention` error atau `ERR_CONNECTION_REFUSED` untuk gambar Cloudinary.

## Deploy Vercel

Set env var di Vercel:
- `DATABASE_URL`: Supabase Transaction Pooler port `6543` + `?pgbouncer=true`.
- `DIRECT_URL`: Supabase Session Pooler port `5432`.
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` jika seed/admin server task dibutuhkan.
- `NEXT_PUBLIC_APP_URL`: URL production untuk link konfirmasi Supabase Auth dan email.
- Cloudinary keys.
- Resend keys.

Build:

```bash
npm run build
```

Jika `npx prisma migrate deploy` tidak bisa reach pooler, gunakan `prisma/supabase-init.sql` di SQL Editor lalu deploy ulang.

## Known Issues & Fixes (12 Mei 2026)

| Issue | Penyebab | Fix |
| --- | --- | --- |
| "Akun belum tersinkron" saat login pertama | Race condition di `prisma.user.create()` dipanggil paralel | Ubah ke `prisma.user.upsert()` di `src/lib/auth.ts` |
| Notifikasi tidak muncul realtime (harus refresh) | Filter `userId=eq.xxx` di `postgres_changes` tidak dikenali untuk kolom camelCase | Hapus `filter:` option, validasi `userId` secara client-side di callback |
| Gambar laporan tidak muncul (`ERR_CONNECTION_REFUSED`) | Opsi `transformation` di `upload_stream()` menghasilkan `secure_url` yang tidak langsung valid | Hapus `transformation` dari `upload_stream()` options |
| Edge Tracking Prevention memblokir Cloudinary | Browser menganggap `res.cloudinary.com` sebagai third-party tracker | Tambahkan `Content-Security-Policy` header di `next.config.mjs` yang eksplisit mengizinkan domain Cloudinary |
| Gambar lama tidak tampil setelah migrasi public id | Render langsung memakai isi `foto` sebagai `src` | Pakai `getCloudinaryImageUrl()` agar public id dan URL lama sama-sama valid |
