# Spesifikasi Sistem Desain: Civic Clarity

## 1. Gambaran Umum & Visi Utama (Creative North Star)
**Visi Utama: "The Editorial Ledger" (Jurnal Editorial)**
Sistem desain ini bergerak melampaui "dashboard generik" dengan memperlakukan data lingkungan layaknya jurnal arsitektur kelas atas yang prestisius. Kita menolak estetika "widget" yang penuh sesak dan beralih ke filosofi **The Editorial Ledger**—sebuah pendekatan yang memprioritaskan ruang kosong yang disengaja, otoritas tipografi, dan pelapisan tonal (warna).

Meski fondasi yang diinginkan pengguna adalah "Minimalis", eksekusi kita adalah **Utilitas yang Canggih (Sophisticated Utility)**. Kita mendobrak tampilan "template" standar melalui ritme penggunaan ruang kosong (negative space) dan pendekatan arsitektur "Tanpa Garis" (No-Line). Hal ini memastikan bahwa 'PantauKota' tidak terasa seperti sekadar database, melainkan sebuah pusat komando yang terkurasi untuk kemajuan tata kota.

---

## 2. Warna: Arsitektur Tonal
Palet warna berakar pada warna netral yang memberikan nuansa ruang (atmospheric), menggunakan warna hijau pudar (muted green) dan hijau kebiruan (teal) sebagai aksen presisi bedah, bukan sekadar dekorasi.

### Hierarki Permukaan (Surface) & Sarang (Nesting)
Kita tidak menggunakan garis pembatas (border) untuk menentukan struktur. Kedalaman dicapai melalui **Pelapisan Tonal (Tonal Layering)**.
- **Lapisan Dasar:** `surface` (#f7f9fb) – Sebagai kanvas utama.
- **Lapisan Sektoral:** `surface_container_low` (#f0f4f7) – Digunakan untuk area *sidebar* besar atau pengelompokan.
- **Lapisan Aksi:** `surface_container_lowest` (#ffffff) – Digunakan untuk kartu interaktif utama guna memberikan efek "timbul alami".
- **Lapisan Fokus:** `surface_container_high` (#e1e9ee) – Dikhususkan untuk bilah utilitas yang menjorok ke dalam (recessed) atau status aktif.

### Aturan "Tanpa Garis" (The "No-Line" Rule)
**Dilarang menggunakan border solid 1px untuk membuat sekat bagian.** Batas-batas harus didefinisikan murni melalui perubahan warna latar belakang. Sebuah daftar laporan harus diletakkan di atas `surface_container_lowest` dengan latar belakang `surface_container_low`.

---

## 3. Tipografi: Otoritas Huruf Sans
Kita menggunakan strategi dua jenis font untuk menyeimbangkan karakter dengan keterbacaan data yang padat.

| Kategori | Font | Peran |
| :--- | :--- | :--- |
| **Display/Headline (Judul Utama)** | **Manrope** | Tebal, geometris, dan berwibawa. Digunakan untuk judul halaman dan metrik tingkat atas. |
| **Body/Title/Label (Isi/Judul/Label)** | **Inter** | Sangat mudah dibaca, netral, dan fungsional. Digunakan untuk semua entri data, deskripsi laporan, dan navigasi. |

**Aturan Skala:** 
- Gunakan `display-md` untuk angka "Total Laporan" guna memberikan kesan skala pada data lingkungan.
- Gunakan `label-sm` dengan huruf kapital semua (all-caps) dan spasi antar huruf (letter spacing) `0.05em` untuk metadata (misalnya, "TANGGAL LAPORAN") untuk meniru gaya keterangan editorial.

**Responsive Typography:**
- Mobile: `text-2xl` untuk heading utama, `text-sm` untuk body
- Tablet+: `text-3xl` untuk heading utama, `text-base` untuk body
- Desktop: Gunakan skala yang lebih besar untuk readability
- **WAJIB:** Gunakan `truncate` pada text panjang untuk prevent overflow

---

## 4. Elevasi & Kedalaman: Pelapisan Tonal
Bayangan tradisional digantikan oleh **Kedalaman Ambien (Ambient Depth)**.

- **Prinsip Pelapisan:** Alih-alih menggunakan efek *drop shadow*, sebuah kartu (`surface_container_lowest`) diletakkan di dalam suatu bagian (`surface_container_low`). Pergeseran kecerahan sebesar 2% sudah cukup bagi mata manusia untuk merasakan hierarki tanpa menambah kebisingan visual.
- **Garis Bayangan Halus ("Ghost Border"):** Jika sebuah wadah (container) membutuhkan batasan terhadap latar belakang yang identik, gunakan garis (stroke) `1px` dengan warna `outline_variant` (#a9b4b9) pada **opasitas 15%**. Ini menciptakan "kesan" adanya batas, bukan sebuah garis tegas.
- **Bayangan Ambien (Ambient Shadows):** Hanya digunakan untuk komponen yang melayang di atas konten lain (seperti dropdown, kapsul navigasi, atau modal). 
    - `box-shadow: 0 8px 30px rgba(42, 52, 57, 0.12);` (Nilai opasitas 12% memberikan efek mengambang yang jelas namun tetap natural).

### Elemen Melayang & Navigasi (Floating UI)
Sistem ini menolak penggunaan *navbar* statis (edge-to-edge) demi memberikan kesan ruang yang luas, terutama di halaman Peta dan Dashboard.
- **Kapsul Melayang (Floating Capsules):** Elemen kontrol utama seperti kotak pencarian, menu navigasi utama, dan profil *user* harus dibungkus dalam bentuk kapsul melayang yang memiliki sudut bulat penuh (`rounded-full`).
- **Pemisahan Kapsul:** Alih-alih menggabungkan semuanya dalam satu bilah, pisahkan fungsi ke dalam kapsul mandiri (misal: Kapsul Kiri untuk Logo+Navigasi, Kapsul Kanan untuk Profil+Notifikasi). Ini memberi ruang "bernapas" di antara elemen.
- **LARANGAN KERAS GLASSMORPHISM:** Untuk memastikan keterbacaan (readability) yang mutlak bebas hambatan, **dilarang menggunakan efek transparan atau *backdrop-blur*** pada elemen yang melayang. Semua komponen *floating* (kapsul, tombol *filter*, *dropdown*, modal) HARUS menggunakan latar belakang solid: `bg-surface-container-lowest`. Tidak boleh ada teks latar belakang yang menembus komponen UI.

---

## 5. Komponen: Elemen Dasar Industrial

### Tombol (Buttons)
- **Primer (Utama):** Latar belakang `primary` (#426464) dengan teks **putih (`#ffffff`)** untuk contrast maksimal. Jangan gunakan sudut membulat melebihi ukuran `md` (0.375rem) untuk mempertahankan tampilan yang rapi dan profesional.
  - **WAJIB:** Gunakan `text-white` (bukan `text-on-primary`) untuk explicit declaration
  - **Contrast Ratio:** Minimum 7:1 (WCAG AAA compliant)
  - **Responsive:** Full width di mobile (`w-full sm:w-auto`)
- **Sekunder:** Latar belakang `surface_container_highest`. Tanpa garis batas (border).
- **Tersier:** Latar belakang transparan, teks `primary`. Gunakan untuk aksi dengan penekanan rendah seperti "Batal".

### Kolom Input (Input Fields)
- **Gaya:** Bersahaja (Understated). Gunakan `surface_container_low` sebagai latar belakang dengan "Ghost Border" 1px. 
- **Saat Fokus:** Bertransisi menjadi border `primary` 1px. Dilarang menggunakan efek bercahaya ("glow").
- **Responsive:** Full width (`w-full`) dengan padding yang konsisten
- **Font Size:** `text-sm sm:text-base` untuk readability di semua device

### Password Visibility Toggle
- **CRITICAL PATTERN:** Eye icon harus persistent (tidak hilang saat focus change)
- **Implementation:**
  ```tsx
  <button
    type="button"  // Prevent form submission
    onClick={() => setShowPassword(!showPassword)}
    className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 p-1"
    tabIndex={-1}  // Prevent focus interference
  >
    {showPassword ? <EyeOff /> : <Eye />}
  </button>
  ```
- **Positioning:** Responsive (`right-3 sm:right-4`)
- **Touch Target:** Minimum 44x44px dengan padding

### Kartu & Daftar (Cards & Lists)
- **Aturan Pemisah (Divider):** **Dilarang keras menggunakan garis horizontal 1px.** 
- Untuk memisahkan item-item laporan, gunakan ruang kosong vertikal sebesar `8px` atau perubahan latar belakang samar antara `surface_container_lowest` dan `surface` saat disentuh (hover).

### Indikator Kemajuan (Progress Indicators)
- Gunakan `tertiary` (#006d4a) untuk "Selesai".
- Gunakan `primary_dim` (#365858) untuk "Dalam Proses".
- Gunakan `error` (#9f403d) untuk "Mendesak".

### Toast Notifications (NEW)
- **Position:** Fixed top center (`top-6 left-1/2 -translate-x-1/2`)
- **Background:** Solid `surface-container-lowest` (no glassmorphism)
- **Border:** Subtle border dengan warna sesuai type (success/error/info/warning)
- **Animation:** Fade in/out dengan slide effect
- **Auto-dismiss:** 3 seconds default
- **Z-index:** 9999 (above all content)

---

## 6. Panduan Praktis (Do's and Don'ts)

### Lakukan (Do)
- **Gunakan Spasi Berlebih:** Berikan ruang agar data dapat "bernapas". Tingkatkan tinggi baris (line-height) pada teks laporan menjadi `1.6` untuk keterbacaan yang lebih baik.
- **Gunakan Ikon Outlined:** Hanya gunakan ikon dengan ketebalan garis 1.5pt. Hindari ikon blok solid (filled) kecuali ikon tersebut mewakili status navigasi yang sedang "aktif".
- **Hierarki Tonal:** Selalu periksa apakah perubahan warna latar belakang bisa menggantikan fungsi garis pembatas (border).
- **Prevent Horizontal Scroll:** Gunakan `overflow-x: hidden` dan `w-full` untuk semua container
- **Responsive Text:** Gunakan `truncate` pada text panjang untuk prevent overflow
- **High Contrast Buttons:** Gunakan `text-white` pada primary buttons
- **Touch Targets:** Minimum 44x44px untuk semua interactive elements di mobile

### Jangan Lakukan (Don'ts)
- **Jangan Gunakan Bayangan Pekat:** Hindari bayangan apa pun yang terlihat "abu-abu". Bayangan harus terasa seperti cahaya ambien di sekitar elemen.
- **Jangan Gunakan Gradien:** Jaga agar semua permukaan tetap datar (flat). "Jiwa" dari desain ini berasal dari palet warnanya, bukan dari efek visual yang berlebihan.
- **Jangan Gunakan Garis Pemisah (Divider Line):** Hindari tampilan layaknya tabel "Excel". Gunakan pengelompokan (grouping) dan padding untuk memisahkan titik-titik data.
- **Jangan Gunakan Fixed Width:** Hindari `w-[500px]`, gunakan `w-full` atau `max-w-*`
- **Jangan Buat Inline Error Messages:** Gunakan Toast component untuk semua feedback
- **Jangan Lupa tabIndex={-1}:** Pada icon buttons yang tidak perlu keyboard navigation

---

## 7. Responsive Design Standards (CRITICAL)

### Horizontal Overflow Prevention (WAJIB)
**Semua halaman HARUS prevent horizontal scroll di mobile.**

**Global Level:**
```css
/* globals.css */
html, body {
  overflow-x: hidden;
  max-width: 100vw;
}

* {
  box-sizing: border-box;
}
```

**Page Level:**
```tsx
<div className="w-full min-h-screen overflow-x-hidden">
  <div className="max-w-4xl mx-auto w-full">
    {/* Content */}
  </div>
</div>
```

**Element Level:**
```tsx
// Form elements
<div className="w-full">
  <input className="w-full px-4 py-3.5 ..." />
</div>

// Headers with long text
<div className="flex items-center gap-3 sm:gap-4">
  <button className="shrink-0">...</button>
  <div className="min-w-0">
    <h1 className="truncate">...</h1>
  </div>
</div>
```

### Responsive Breakpoints
```
Mobile:  < 640px  (sm)
Tablet:  640-1024px (sm-lg)
Desktop: > 1024px (lg+)
```

### Responsive Patterns
**Typography:**
- Headings: `text-2xl sm:text-3xl`
- Body: `text-sm sm:text-base`
- Labels: `text-xs sm:text-sm`

**Spacing:**
- Padding: `p-4 sm:p-6 lg:p-8`
- Gap: `gap-3 sm:gap-4`
- Margin: `mb-6 sm:mb-8`

**Layout:**
- Stack on mobile: `flex-col sm:flex-row`
- Full width on mobile: `w-full sm:w-auto`
- Responsive positioning: `right-3 sm:right-4`

### Touch Targets (Mobile)
**Minimum size: 44x44px**
- Buttons: `p-2.5` (40px) + border = 44px
- Icon buttons: `p-1` + icon size 20px + clickable area = 44px
- Links: Adequate padding around text

### Safe Area (Mobile)
**Respect device safe areas:**
- Top: Account for navbar/notch
- Bottom: Account for home indicator
- Sides: Minimum 16px padding

---

## 8. Layout Specifications

### Full-Screen Profile Management
**Desktop:**
- Container: `max-w-4xl mx-auto` (wider than standard for form comfort)
- Padding: `p-8`
- Card: `rounded-3xl` dengan ambient shadow

**Mobile:**
- Container: `w-full`
- Padding: `p-4`
- Card: `rounded-3xl` dengan reduced padding

### Back Button Placement
**Position:** Top-left corner of content area
**Style:**
```tsx
<button className="p-2.5 rounded-xl bg-surface-container-lowest hover:bg-surface-container-low transition-colors shadow-[0_2px_8px_rgba(42,52,57,0.08)] shrink-0">
  <ArrowLeft className="w-5 h-5" strokeWidth={2} />
</button>
```
**Behavior:** Navigate to parent route (dashboard/beranda)

### Form Layout
**Structure:**
- Labels: Uppercase, tracking-widest, `text-[11px]`
- Inputs: Full width, `px-4 py-3.5`, `rounded-xl`
- Spacing: `space-y-5 sm:space-y-6`
- Submit: Right-aligned desktop, full-width mobile

---

## 9. Bahasa & Nada Penyampaian (Language & Tone)
Sistem ini menggunakan **Bahasa Indonesia Baku** untuk menjaga otoritas profesionalisme tata kota.
- **Label Tombol:** "Simpan Perubahan" (bukan "Save").
- **State Kosong (Empty States):** "Belum ada laporan masuk" (bukan "Tidak ada data").
- **Pesan Kesalahan (Error Messages):** "Terjadi kendala pada sistem" (bukan "Error").