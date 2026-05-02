# Spesifikasi Sistem Desain: Civic Clarity

## 1. Visi: "The Editorial Ledger"

Jurnal arsitektur prestisius, bukan dashboard generik. **Sophisticated Utility** — ruang kosong disengaja, otoritas tipografi, pelapisan tonal.

---

## 2. Warna: Arsitektur Tonal

### Hierarki Permukaan
- **surface** (#f7f9fb) — Kanvas utama
- **surface_container_low** (#f0f4f7) — Sidebar, pengelompokan
- **surface_container_lowest** (#ffffff) — Kartu interaktif (timbul)
- **surface_container_high** (#e1e9ee) — Bilah utilitas, status aktif

### Aksen
- **primary** (#426464) — Hijau kebiruan gelap
- **primary_dim** (#6B9A9A) — Dalam proses
- **tertiary** (#006d4a) — Hijau tua (SELESAI)
- **error** (#B3261E) — Merah
- **on-surface** (#2A3439) — Teks utama

### Aturan "Tanpa Garis" (No-Line Rule)
**❌ Dilarang border solid 1px untuk sekat.** Batas didefinisikan murni melalui perubahan warna latar belakang.

---

## 3. Tipografi

| Kategori | Font | Peran |
|----------|------|-------|
| **Display/Headline** | **Manrope** | Tebal, geometris, judul halaman & metrik |
| **Body/Title/Label** | **Inter** | Mudah dibaca, data, deskripsi, navigasi |

**Skala:**
- Display: `display-md` untuk angka besar
- Label: `label-sm` uppercase, `letter-spacing: 0.05em` untuk metadata
- Responsive: `text-2xl sm:text-3xl` (heading), `text-sm sm:text-base` (body)
- **WAJIB:** `truncate` pada text panjang untuk prevent overflow

---

## 4. Elevasi & Kedalaman

### Pelapisan Tonal
Alih-alih drop shadow, kartu (`surface_container_lowest`) diletakkan di dalam bagian (`surface_container_low`). Pergeseran kecerahan 2% cukup untuk hierarki.

### Ghost Border
Jika container butuh batasan: `1px` stroke `outline_variant` (#a9b4b9) pada **opasitas 15%**.

### Bayangan Ambien
Hanya untuk floating elements (dropdown, modal, kapsul navigasi):
```css
box-shadow: 0 8px 30px rgba(42, 52, 57, 0.12);
```

### Floating UI
- **Kapsul Melayang:** Navbar, sidebar, search box → `rounded-full` atau `rounded-3xl`
- **Pemisahan:** Pisahkan fungsi ke kapsul mandiri (Logo+Nav | Profil+Notif)
- **❌ LARANGAN GLASSMORPHISM:** Semua floating HARUS `bg-surface-container-lowest` solid. No `backdrop-blur`, no transparency.

---

## 5. Komponen

### Tombol
- **Primer:** `bg-primary text-white` (contrast 7:1, WCAG AAA)
- **Sekunder:** `bg-surface_container_highest`, no border
- **Tersier:** Transparan, `text-primary`
- **Responsive:** `w-full sm:w-auto`

### Input
- **Style:** `bg-surface_container_low` + ghost border 1px
- **Focus:** Border `primary` 1px, no glow
- **Responsive:** `w-full`, `text-sm sm:text-base`

### Password Toggle
**CRITICAL PATTERN:**
```tsx
<button
  type="button"  // Prevent form submit
  onClick={() => setShowPassword(!showPassword)}
  tabIndex={-1}  // Prevent focus interference
  className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 p-1"
>
  {showPassword ? <EyeOff /> : <Eye />}
</button>
```

### Kartu & Daftar
**❌ Dilarang garis horizontal 1px.** Pisahkan item dengan ruang vertikal 8px atau perubahan background saat hover.

### Progress Indicators
- **Selesai:** `tertiary` (#006d4a)
- **Dalam Proses:** `primary_dim` (#365858)
- **Mendesak:** `error` (#9f403d)

### Map Marker Colors (CRITICAL)
1. **SELESAI** → Hijau (#006d4a) — selalu, terlepas prioritas
2. **Prioritas (belum selesai)** → Merah (#dc2626) jika:
   - Flag manual = true, ATAU
   - Skor ≥ 50 (formula: `voteCount × 2 + hari`)
3. **Non-Prioritas** → MENUNGGU=Amber (#f59e0b), DIPROSES=Blue (#3b82f6)

**Implementasi:** Gunakan `getMarkerColor()` dari `src/types/laporan.ts`

### Category Filter Chips
- **Active:** `bg-primary text-white` (contrast 7:1)
- **Inactive:** `bg-surface-container-low text-[#677177]`

### Toast Notifications
- **Position:** Fixed top center (`top-6 left-1/2 -translate-x-1/2`)
- **Background:** Solid `surface-container-lowest`
- **Border:** Subtle, warna sesuai type
- **Animation:** Fade in/out + slide
- **Auto-dismiss:** 3s, z-index 9999

### Completion Modal
- **Trigger:** Admin klik "Selesai"
- **Background:** Solid `surface-container-lowest`, ambient shadow
- **Border Radius:** `rounded-3xl`
- **Input:** Catatan (textarea, min 4 rows), Foto (upload area, 2 tombol)
- **Validation:** Catatan wajib, foto opsional (max 5MB)
- **Buttons:** Batal (`bg-surface-container-highest`), Selesaikan (`bg-primary text-white`)
- **Feedback:** Toast (bukan inline error)

---

## 6. Responsive Design (CRITICAL)

### Horizontal Overflow Prevention (WAJIB)
```css
/* globals.css */
html, body {
  overflow-x: hidden;
  max-width: 100vw;
}
```

```tsx
// Page container
<div className="w-full overflow-x-hidden">
  <div className="max-w-4xl mx-auto">
    <input className="w-full px-4 py-3.5" />
    <h1 className="truncate">Long Title</h1>
  </div>
</div>
```

### Breakpoints
- Mobile: < 640px (sm)
- Tablet: 640-1024px (sm-lg)
- Desktop: > 1024px (lg+)

### Patterns
- **Typography:** `text-2xl sm:text-3xl`, `text-sm sm:text-base`
- **Spacing:** `p-4 sm:p-6 lg:p-8`, `gap-3 sm:gap-4`
- **Layout:** `flex-col sm:flex-row`, `w-full sm:w-auto`
- **Touch Targets:** Minimum 44x44px

---

## 7. Do's and Don'ts

### ✅ Lakukan
- Spasi berlebih, `line-height: 1.6`
- Ikon outlined 1.5pt (filled hanya untuk aktif)
- Hierarki tonal (cek apakah bisa ganti border)
- `overflow-x: hidden`, `w-full`, `truncate`
- `text-white` pada primary buttons & active chips
- Touch targets ≥44px
- `getMarkerColor()` untuk marker
- Toast untuk feedback
- File upload max 5MB

### ❌ Jangan
- Bayangan pekat (abu-abu)
- Gradien
- Garis pemisah 1px (divider line)
- Fixed width (`w-[500px]`)
- Inline error messages
- `tabIndex={-1}` lupa pada icon buttons

---

## 8. Bahasa & Nada

**Bahasa Indonesia Baku:**
- Label: "Simpan Perubahan" (bukan "Save")
- Empty State: "Belum ada laporan masuk"
- Error: "Terjadi kendala pada sistem"
