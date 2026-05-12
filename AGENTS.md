# AGENTS.md - Panduan AI PantauKota

Update: 12 Mei 2026 (rev 3). Baca sebelum mengubah kode.

## Ringkasan

PantauKota adalah PWA pelaporan perkotaan berbasis Next.js 14 App Router.

Aktor:
- Warga: membuat laporan, vote, komentar, melihat notifikasi, menghapus laporan sendiri jika memenuhi syarat.
- Admin: meninjau laporan, mengubah status, mengelola kategori dan user.

Arsitektur final:
- Database: Supabase PostgreSQL, diakses lewat Prisma 7 + `@prisma/adapter-pg`.
- Auth: Supabase Auth via `@supabase/ssr`.
- Realtime: Supabase Realtime untuk tabel `Notifikasi`.
- Images: Cloudinary public id + delivery transformations.
- Deployment: Vercel.

## File Penting

- `src/lib/auth.ts`: helper server `getCurrentSession()` dan `getCurrentUser()`.
- `src/lib/supabase/`: Supabase browser/server/middleware client.
- `src/hooks/useAuthSession.tsx`: session client pengganti NextAuth.
- `src/middleware.ts`: refresh session Supabase dan guard route.
- `src/lib/prisma.ts`: Prisma singleton.
- `src/lib/notifications.ts`: create notifikasi di database.
- `src/hooks/useNotifications.ts`: fetch notifikasi + subscribe Supabase Realtime.
- `src/lib/cloudinary.ts`: helper URL Cloudinary backward-compatible untuk `public_id` dan URL lama.
- `src/lib/client-image.ts`: kompresi client + upload foto sebelum simpan laporan.
- `src/lib/constants.ts`, `src/lib/utils.ts`, `src/lib/api-helpers.ts`: pakai sebelum menulis logic baru.
- `src/types/laporan.ts`: shared types, `STATUS_CONFIG`, `getMarkerColor()`.
- `src/lib/map.ts`: Leaflet config.
- `prisma/schema.prisma`: schema utama.
- `prisma/seed.ts`: seed database dan akun Supabase Auth jika `SUPABASE_SERVICE_ROLE_KEY` valid.
- `prisma/supabase-init.sql`: fallback init schema via Supabase SQL Editor.

## Route Guard

Route warga wajib login:
- `/beranda`
- `/laporan/buat`
- `/laporan-saya`
- `/notifikasi`
- `/profil`

Route admin wajib login dan role `ADMIN`:
- `/dashboard`
- `/kelola-laporan`
- `/kelola-kategori`
- `/kelola-user`

Untuk server code, jangan pakai NextAuth. Pakai:

```ts
import { getCurrentSession } from '@/lib/auth';

const session = await getCurrentSession();
if (!session?.user?.id) {
  // unauthorized
}
```

Role aplikasi tetap di tabel `User`. Mapping Supabase Auth ke tabel `User` menggunakan email.

## Desain

Detail ada di `DESIGN.md`. Prinsip wajib:
- No glassmorphism.
- No-Line Rule: hindari border 1px sebagai pemisah utama; pakai whitespace/tonal layering.
- Floating UI untuk navbar/sidebar.
- Tonal layering: `surface`, `surface-container-lowest`, `surface-container-low`, `surface-container-high`.
- Halaman warga pakai `max-w-6xl`, admin pakai `max-w-7xl`.
- Mobile 360px sampai desktop 1440px+ harus rapi.

Warna utama:
- `primary`: `#426464`
- `tertiary`: `#006d4a`
- `error`: `#B3261E`

## Komponen dan Hook Reusable

Gunakan yang sudah ada sebelum membuat baru:
- `StatusBadge` dari `@/components/ui/Badge`
- `Spinner` dari `@/components/ui/Spinner`
- `DynamicIcon` dari `@/components/ui/DynamicIcon`
- `Toast` + `useToast`
- `VoteButton`
- `StatusTimeline`
- `PrioritasScore`
- `CompletionModal`
- `DeleteLaporanButton`
- `CameraModal`
- `LocationPicker`

Hook:
- `useAuthSession`
- `useDebounce`
- `useLaporanMap`
- `useGeolocation`
- `useVote`
- `useToast`
- `useNotifications`

Feedback user harus lewat Toast bila memungkinkan, bukan inline error baru yang tidak konsisten.

## Pola Layout Detail Laporan

Komentar harus menjadi grid item terpisah agar tampil paling bawah di mobile.

```tsx
<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
  <div className="lg:col-span-7 space-y-6">
    {/* Foto, deskripsi */}
  </div>

  <div className="lg:col-span-5 lg:row-span-2">
    <div className="lg:sticky lg:top-24 space-y-6">
      {/* Peta, timeline */}
    </div>
  </div>

  <div className="lg:col-span-7">
    {/* Komentar */}
  </div>
</div>
```

## Aturan Bisnis

Hapus laporan hanya jika semua benar:
- Pemilik laporan adalah user saat ini.
- Umur laporan kurang dari 24 jam.
- Status masih `MENUNGGU`.

Dashboard warga:
- `/beranda` menampilkan maksimal 3 laporan terbaru.
- Daftar lengkap ada di `/laporan-saya`.

Prioritas:
- Formula: `voteCount * 2 + hari_sejak_dibuat`.
- Threshold dari `PRIORITY_THRESHOLD`.
- Warna marker wajib pakai `getMarkerColor()`.

Duplikasi laporan:
- Cek radius 50m, kategori sama, dalam 30 hari.
- Endpoint saat ini: `/api/laporan/cek-duplikasi`.

Kategori:
- CRUD di `/kelola-kategori`.
- Ikon kategori harus tampil seragam: `bg-primary/10`, `text-primary`.
- Tambah ikon baru lewat `src/components/ui/DynamicIcon.tsx`.

Realtime notifikasi:
- Insert tetap lewat `kirimNotifikasi()`.
- Client subscribe di `useNotifications()`.
- Pastikan `Notifikasi` masuk publication `supabase_realtime`.
- **PENTING:** Filter realtime `postgres_changes` di `useNotifications.ts` TIDAK menggunakan `filter:` option karena kolom camelCase PostgreSQL tidak dikenali parser Supabase. Validasi `userId` dilakukan client-side di callback menggunakan `RealtimePostgresInsertPayload<Notifikasi>` dari `@supabase/supabase-js`.

## API Utama

| Method | Endpoint | Fungsi |
| --- | --- | --- |
| GET/POST | `/api/laporan` | List dan buat laporan |
| GET/PATCH/DELETE | `/api/laporan/[id]` | Detail, update, hapus laporan |
| GET | `/api/laporan/saya` | Laporan user |
| GET | `/api/laporan/cek-duplikasi` | Cek laporan mirip |
| POST | `/api/vote` | Toggle vote |
| GET/POST | `/api/komentar` | List dan tambah komentar |
| DELETE | `/api/komentar/[id]` | Hapus komentar |
| GET/PATCH/DELETE | `/api/notifikasi` | Notifikasi user |
| GET/POST | `/api/kategori` | List dan tambah kategori |
| PATCH/DELETE | `/api/kategori/[id]` | Edit/hapus kategori |
| POST | `/api/upload` | Upload foto Cloudinary |
| GET/PATCH | `/api/user/profile` | Profil sendiri |
| GET/PATCH/DELETE | `/api/user/profile/[id]` | Kelola user admin |

## Checklist Sebelum Selesai

- Pakai helper, constants, dan component existing.
- Auth server memakai `getCurrentSession()`, bukan NextAuth.
- Query DB lewat Prisma.
- Upload media tetap ke Cloudinary.
- Realtime notifikasi lewat Supabase Realtime.
- Layout responsive dan tidak ada horizontal scroll.
- Tidak membuat logic warna marker sendiri.
- Tidak hardcode magic number jika sudah ada di `constants.ts`.
- Jalankan:

```bash
npx tsc --noEmit
npx tsc -p tsconfig.seed.json --noEmit
```

## Catatan Implementasi Penting

### Auth: Sinkronisasi Profil User

`getCurrentUser()` di `src/lib/auth.ts` menggunakan `prisma.user.upsert()` (bukan `create()`) untuk membuat profil User saat pertama kali login via Supabase Auth. Ini mencegah race condition ketika beberapa request paralel memanggil `getCurrentSession()` secara bersamaan sehingga tidak terjadi error `P2002 Unique constraint` yang menyebabkan pesan "Akun belum tersinkron".

### Upload Cloudinary

`/api/upload` di `src/app/api/upload/route.ts` **tidak** boleh menggunakan opsi `transformation` di dalam `upload_stream()`. Transformation di saat upload bekerja sebagai eager transform yang dapat mengubah format URL `secure_url` sehingga gambar tidak bisa langsung diakses. Optimasi gambar dilakukan via URL parameter saat delivery, bukan saat upload.

Response upload harus mempertahankan bentuk:

```ts
{ publicId: result.public_id, url: result.secure_url }
```

Data baru disimpan ke field lama sebagai `public_id`:
- `Laporan.foto`: `String[]` berisi `pantaukota/...`.
- `Laporan.fotoPenyelesaian`: `String?` berisi `pantaukota/...`.

Jangan rename kolom database untuk tahap ini. Data lama yang masih berupa URL harus tetap aman dengan `getCloudinaryImageUrl()` dari `src/lib/cloudinary.ts`.

Render gambar laporan wajib lewat `getCloudinaryImageUrl()`:
- Detail: `CLOUDINARY_DETAIL_IMAGE_OPTIONS` (`c_limit,w_1200/f_auto,q_auto`).
- Thumbnail/peta/list: `CLOUDINARY_THUMBNAIL_IMAGE_OPTIONS` (`c_fill,w_320,h_220,g_auto/f_auto,q_auto`).

Client wajib kompres foto lewat `uploadCompressedImage()` di `src/lib/client-image.ts` sebelum menyimpan laporan atau penyelesaian. Jangan simpan full `secure_url` untuk data baru kecuali fallback jika response lama tidak punya `publicId`.

### CSP Headers

`next.config.mjs` sudah mengandung `Content-Security-Policy` dan `Permissions-Policy` headers untuk mengizinkan domain Cloudinary (`res.cloudinary.com`) dan Supabase, sehingga Edge Tracking Prevention tidak memblokir gambar. Jika menambah domain eksternal baru, update header ini.

## File Sensitif

Jangan ubah sembarangan:
- `prisma/schema.prisma`
- `src/middleware.ts`
- `src/lib/auth.ts`
- `src/lib/prisma.ts`
- `src/lib/constants.ts`
- `src/types/laporan.ts`
- `src/app/globals.css`
- `next.config.mjs` (berisi CSP headers)
- `DESIGN.md`