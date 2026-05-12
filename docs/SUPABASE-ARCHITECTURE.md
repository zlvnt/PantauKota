# Arsitektur Supabase PantauKota

Target arsitektur:

- Database: Supabase PostgreSQL
- Auth: Supabase Auth
- Real-time: Supabase Realtime untuk tabel `Notifikasi`
- Images: Cloudinary
- Deployment: Vercel

## Auth

Session browser/server dikelola oleh `@supabase/ssr`.

File utama:

- `src/lib/supabase/browser.ts`
- `src/lib/supabase/server.ts`
- `src/lib/supabase/middleware.ts`
- `src/lib/auth.ts`
- `src/hooks/useAuthSession.tsx`

Tabel aplikasi `User` tetap menjadi sumber role (`ADMIN`/`WARGA`) dan `isActive`. Mapping Supabase Auth ke `User` memakai email, karena email aplikasi dibuat read-only.

Email confirmation memakai redirect `/auth/callback`. Pastikan environment memiliki:

```env
NEXT_PUBLIC_APP_URL="https://your-domain.vercel.app"
```

Di Supabase Dashboard > Authentication > URL Configuration, tambahkan redirect URL:

- `http://localhost:3000/auth/callback`
- `https://your-domain.vercel.app/auth/callback`

## Realtime

Notifikasi tetap dibuat lewat Prisma di `src/lib/notifications.ts`. Client subscribe ke Supabase Realtime di `src/hooks/useNotifications.ts`.

Jalankan SQL berikut jika belum:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE "Notifikasi";
```

File `prisma/supabase-init.sql` sudah memuat statement tersebut secara idempotent.

## Images

Cloudinary tetap menjadi storage gambar. Database Supabase hanya menyimpan referensi gambar di field Prisma lama:

- `foto String[]`
- `fotoPenyelesaian String?`

Untuk data baru, isi field adalah Cloudinary `public_id` seperti `pantaukota/...`. Data lama yang masih berupa URL tetap didukung oleh `getCloudinaryImageUrl()` di `src/lib/cloudinary.ts`.

Upload tetap melalui `/api/upload`, lalu client menyimpan `publicId` dari response. Delivery gambar memakai URL transformasi Cloudinary saat render, bukan eager transformation saat upload.

## Seed Auth

`npm run seed` dapat membuat akun Supabase Auth dummy jika `.env` memiliki:

```env
NEXT_PUBLIC_SUPABASE_URL="https://<project-ref>.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="sb_secret_xxx"
```

Jika `SUPABASE_SERVICE_ROLE_KEY` tidak diset, seed tetap membuat data aplikasi di database, tetapi akun login Supabase Auth harus dibuat manual di dashboard Supabase Auth dengan email yang sama.
