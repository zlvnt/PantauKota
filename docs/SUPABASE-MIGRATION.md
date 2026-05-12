# Migrasi Database Neon ke Supabase

Panduan ini memindahkan database PantauKota dari Neon PostgreSQL ke Supabase PostgreSQL tanpa mengubah model Prisma.

## Ringkasan Konfigurasi

PantauKota memakai Prisma 7 dengan `@prisma/adapter-pg`, jadi Supabase cukup dipakai sebagai PostgreSQL host baru.

Gunakan dua URL:

```env
# Runtime aplikasi. Untuk Vercel/serverless, pakai Transaction Pooler port 6543.
DATABASE_URL="postgresql://postgres.<project-ref>:<password>@<region>.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Prisma CLI/migration. Pakai Direct Connection jika IPv6 tersedia,
# atau Session Pooler port 5432 jika direct connection tidak bisa dipakai.
DIRECT_URL="postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres"
```

`prisma.config.ts` sudah membaca `DIRECT_URL` lebih dulu untuk command Prisma, lalu fallback ke `DATABASE_URL`.

## 1. Siapkan Supabase

1. Buat project baru di Supabase.
2. Buka **Project Settings -> Database -> Connection string**.
3. Ambil:
   - Transaction Pooler untuk `DATABASE_URL`.
   - Direct Connection atau Session Pooler untuk `DIRECT_URL`.
4. Simpan password database dengan aman.

Opsional tetapi direkomendasikan: buat user database khusus Prisma di SQL Editor sesuai dokumentasi Supabase, lalu gunakan user itu pada connection string.

## 2. Jalankan Schema Prisma di Supabase Kosong

Untuk database Supabase baru yang masih kosong:

```bash
npx prisma migrate deploy
npx prisma generate
```

Jika `npx prisma migrate deploy` gagal dengan `P1001` ke Session Pooler atau Direct Connection, jalankan isi file berikut di **Supabase SQL Editor**:

```text
prisma/supabase-init.sql
```

Setelah SQL berhasil, lanjutkan:

```bash
npx prisma generate
npm run seed
```

Untuk Supabase Auth, tambahkan juga `SUPABASE_SERVICE_ROLE_KEY` di `.env` sebelum `npm run seed` jika ingin akun testing dibuat otomatis di Supabase Auth:

```env
SUPABASE_SERVICE_ROLE_KEY="sb_secret_xxx"
```

Tanpa service role key, seed hanya mengisi tabel aplikasi. Akun login perlu dibuat manual di Supabase Auth dengan email yang sama.

Jika hanya ingin data dummy:

```bash
npm run seed
```

## 3. Pindahkan Data Neon ke Supabase

Gunakan `pg_dump` dari Neon dan restore ke Supabase. Jalankan dari terminal lokal yang punya `pg_dump` dan `psql`.

```bash
pg_dump "<NEON_DATABASE_URL>" \
  --format=custom \
  --no-owner \
  --no-acl \
  --file pantaukota-neon.dump
```

Restore ke Supabase:

```bash
pg_restore \
  --dbname "<SUPABASE_DIRECT_OR_SESSION_URL>" \
  --clean \
  --if-exists \
  --no-owner \
  --no-acl \
  pantaukota-neon.dump
```

Catatan:
- Jika restore memakai database Supabase yang sudah berisi schema dari `prisma migrate deploy`, perintah di atas akan drop dan buat ulang object yang ada.
- Untuk menghindari konflik, lakukan restore ke project Supabase baru/kosong.
- Foto laporan tetap aman. Data lama mungkin berisi URL Cloudinary/eksternal, sedangkan data baru berisi Cloudinary `public_id` (`pantaukota/...`). UI harus render lewat `getCloudinaryImageUrl()` agar kedua bentuk tetap valid.

## 4. Verifikasi

Setelah `.env` mengarah ke Supabase:

```bash
npx prisma migrate status
npx prisma generate
npx tsc --noEmit
npm run dev
```

Cek manual:
- Login admin dan warga.
- Dashboard admin menampilkan total laporan.
- Peta warga/admin menampilkan marker.
- Buat laporan baru.
- Vote dan komentar.
- Admin ubah status, lalu cek notifikasi.
- Upload foto laporan dan foto penyelesaian, lalu pastikan field `foto` / `fotoPenyelesaian` untuk data baru berisi `pantaukota/...`.

## 5. Update Deployment

Di Vercel/hosting production, ubah environment variable:

```env
DATABASE_URL="postgresql://postgres.<project-ref>:<password>@<region>.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres"
```

Lalu redeploy aplikasi.

## Rollback

Jika ada masalah, kembalikan `DATABASE_URL` dan `DIRECT_URL` ke Neon lama, lalu redeploy. Jangan hapus database Neon sampai semua flow production di Supabase sudah diverifikasi.
