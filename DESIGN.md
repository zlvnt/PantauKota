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
- **Primer (Utama):** Latar belakang `primary` (#426464) dengan teks `on_primary`. Jangan gunakan sudut membulat melebihi ukuran `md` (0.375rem) untuk mempertahankan tampilan yang rapi dan profesional.
- **Sekunder:** Latar belakang `surface_container_highest`. Tanpa garis batas (border).
- **Tersier:** Latar belakang transparan, teks `primary`. Gunakan untuk aksi dengan penekanan rendah seperti "Batal".

### Kolom Input (Input Fields)
- **Gaya:** Bersahaja (Understated). Gunakan `surface_container_low` sebagai latar belakang dengan "Ghost Border" 1px. 
- **Saat Fokus:** Bertransisi menjadi border `primary` 1px. Dilarang menggunakan efek bercahaya ("glow").

### Kartu & Daftar (Cards & Lists)
- **Aturan Pemisah (Divider):** **Dilarang keras menggunakan garis horizontal 1px.** 
- Untuk memisahkan item-item laporan, gunakan ruang kosong vertikal sebesar `8px` atau perubahan latar belakang samar antara `surface_container_lowest` dan `surface` saat disentuh (hover).

### Indikator Kemajuan (Progress Indicators)
- Gunakan `tertiary` (#006d4a) untuk "Selesai".
- Gunakan `primary_dim` (#365858) untuk "Dalam Proses".
- Gunakan `error` (#9f403d) untuk "Mendesak".

---

## 6. Panduan Praktis (Do's and Don'ts)

### Lakukan (Do)
- **Gunakan Spasi Berlebih:** Berikan ruang agar data dapat "bernapas". Tingkatkan tinggi baris (line-height) pada teks laporan menjadi `1.6` untuk keterbacaan yang lebih baik.
- **Gunakan Ikon Outlined:** Hanya gunakan ikon dengan ketebalan garis 1.5pt. Hindari ikon blok solid (filled) kecuali ikon tersebut mewakili status navigasi yang sedang "aktif".
- **Hierarki Tonal:** Selalu periksa apakah perubahan warna latar belakang bisa menggantikan fungsi garis pembatas (border).

### Jangan Lakukan (Don'ts)
- **Jangan Gunakan Bayangan Pekat:** Hindari bayangan apa pun yang terlihat "abu-abu". Bayangan harus terasa seperti cahaya ambien di sekitar elemen.
- **Jangan Gunakan Gradien:** Jaga agar semua permukaan tetap datar (flat). "Jiwa" dari desain ini berasal dari palet warnanya, bukan dari efek visual yang berlebihan.
- **Jangan Gunakan Garis Pemisah (Divider Line):** Hindari tampilan layaknya tabel "Excel". Gunakan pengelompokan (grouping) dan padding untuk memisahkan titik-titik data.

---

## 7. Bahasa & Nada Penyampaian (Language & Tone)
Sistem ini menggunakan **Bahasa Indonesia Baku** untuk menjaga otoritas profesionalisme tata kota.
- **Label Tombol:** "Simpan Perubahan" (bukan "Save").
- **State Kosong (Empty States):** "Belum ada laporan masuk" (bukan "Tidak ada data").
- **Pesan Kesalahan (Error Messages):** "Terjadi kendala pada sistem" (bukan "Error").