# Cloudinary Images

PantauKota memakai Cloudinary untuk penyimpanan dan delivery gambar laporan. Database tetap memakai field lama agar tidak perlu migrasi besar:

- `Laporan.foto String[]`
- `Laporan.fotoPenyelesaian String?`

## Data Baru

Data baru menyimpan Cloudinary `public_id`, bukan full `secure_url`.

Contoh:

```text
pantaukota/cxhdtvf11r0ubzikzk93
pantaukota/nihr7yfpp7myi2kymgzy
```

`/api/upload` tetap mengembalikan `url` untuk kompatibilitas, tetapi client harus memilih `publicId` lebih dulu:

```ts
const value = data.publicId ?? data.url;
```

## Upload Flow

1. Client kompres foto dengan `browser-image-compression` lewat `src/lib/client-image.ts`.
2. Client upload ke `/api/upload`.
3. API upload ke Cloudinary tanpa opsi `transformation` di `upload_stream()`.
4. API response:

```ts
{ publicId: result.public_id, url: result.secure_url }
```

5. Client menyimpan `publicId` ke `foto` atau `fotoPenyelesaian`.

## Render Flow

Semua render gambar laporan harus lewat `getCloudinaryImageUrl()` dari `src/lib/cloudinary.ts`.

Preset:

- Detail: `CLOUDINARY_DETAIL_IMAGE_OPTIONS` -> `c_limit,w_1200/f_auto,q_auto`
- Thumbnail/list/peta: `CLOUDINARY_THUMBNAIL_IMAGE_OPTIONS` -> `c_fill,w_320,h_220,g_auto/f_auto,q_auto`

Helper menerima:

- `public_id` baru seperti `pantaukota/...`
- URL Cloudinary lama
- URL eksternal lama seperti Unsplash seed

URL eksternal non-Cloudinary dikembalikan apa adanya.

## Aturan Maintenance

- Jangan rename kolom `foto` atau `fotoPenyelesaian` tanpa rencana migrasi terpisah.
- Jangan tambahkan eager transformation di `/api/upload`.
- Jangan render langsung `src={laporan.foto[0]}` untuk data laporan.
- Jangan hardcode transformasi Cloudinary baru di komponen; tambahkan preset di `src/lib/cloudinary.ts` jika perlu.
