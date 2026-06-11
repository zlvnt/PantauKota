# Test Skenario PantauKota

> Dokumen ini berisi skenario pengujian manual (smoke test & functional test) berdasarkan Product Backlog Item (PBI) PantauKota.
> Pengujian dilakukan dengan akun testing yang sudah tersedia (lihat bagian Persiapan).

---

## Daftar Isi

1. [Persiapan & Data Testing](#1-persiapan--data-testing)
2. [TS-01 Autentikasi — Register](#2-ts-01-autentikasi--register)
3. [TS-02 Autentikasi — Login & Logout](#3-ts-02-autentikasi--login--logout)
4. [TS-03 Buat Laporan (Warga)](#4-ts-03-buat-laporan-warga)
5. [TS-04 Lihat Daftar & Detail Laporan (Warga)](#5-ts-04-lihat-daftar--detail-laporan-warga)
6. [TS-05 Vote Laporan (Warga)](#6-ts-05-vote-laporan-warga)
7. [TS-06 Komentar (Warga)](#7-ts-06-komentar-warga)
8. [TS-07 Laporan Saya & Hapus Laporan (Warga)](#8-ts-07-laporan-saya--hapus-laporan-warga)
9. [TS-08 Peta Laporan (Warga)](#9-ts-08-peta-laporan-warga)
10. [TS-09 Notifikasi Realtime (Warga)](#10-ts-09-notifikasi-realtime-warga)
11. [TS-10 Profil (Warga)](#11-ts-10-profil-warga)
12. [TS-11 Dashboard Admin](#12-ts-11-dashboard-admin)
13. [TS-12 Kelola Laporan (Admin)](#13-ts-12-kelola-laporan-admin)
14. [TS-13 Update Status & Penyelesaian (Admin)](#14-ts-13-update-status--penyelesaian-admin)
15. [TS-14 Kelola Kategori (Admin)](#15-ts-14-kelola-kategori-admin)
16. [TS-15 Kelola User (Admin)](#16-ts-15-kelola-user-admin)
17. [TS-16 Prioritas Laporan](#17-ts-16-prioritas-laporan)
18. [TS-17 Upload & Tampilan Gambar (Cloudinary)](#18-ts-17-upload--tampilan-gambar-cloudinary)
19. [TS-18 Notifikasi Email (Resend)](#19-ts-18-notifikasi-email-resend)
20. [TS-19 Responsive & Mobile (360px)](#20-ts-19-responsive--mobile-360px)
21. [TS-20 Guard Akses & Keamanan Route](#21-ts-20-guard-akses--keamanan-route)

---

## 1. Persiapan & Data Testing

Sebelum menjalankan skenario, pastikan:

- Aplikasi berjalan di `http://localhost:3000` (atau domain staging).
- Database sudah di-seed (`npm run seed`).
- Cloudinary dan Resend sudah terkonfigurasi di `.env`.

### Akun Testing yang Tersedia

| Role  | Email                  | Password      |
|-------|------------------------|---------------|
| Admin | `admin@pantaukota.id`  | `password123` |
| Warga | `budi@warga.id`        | `password123` |
| Warga | `siti@warga.id`        | `password123` |
| Warga | `dewi@warga.id`        | `password123` |

### Status Laporan yang Diuji

| Status     | Keterangan                          |
|------------|-------------------------------------|
| `MENUNGGU` | Laporan baru, belum ditinjau admin  |
| `DIPROSES` | Admin sudah mengkonfirmasi laporan  |
| `SELESAI`  | Admin menandai laporan selesai      |

---

## 2. TS-01 Autentikasi — Register

**PBI:** Sebagai warga baru, saya ingin bisa membuat akun agar dapat membuat laporan.

---

### TS-01-001: Register dengan Data Valid

**Aktor:** Warga baru (belum punya akun)

**Langkah:**
1. Buka halaman `/register`.
2. Isi nama lengkap, email baru yang belum terdaftar, dan password (minimal 6 karakter).
3. Klik tombol **Daftar**.

**Yang diharapkan:**
- Tidak ada error validasi.
- Muncul banner/pesan konfirmasi yang menginstruksikan user untuk mengecek email.
- Akun belum bisa digunakan sampai email dikonfirmasi.
- Di Supabase Dashboard → Authentication → Users: email baru muncul dengan status `Unconfirmed`.

---

### TS-01-002: Konfirmasi Email Setelah Register

**Aktor:** Warga baru (sudah register, belum konfirmasi)

**Langkah:**
1. Buka email yang digunakan saat register.
2. Klik link konfirmasi dari email PantauKota.

**Yang diharapkan:**
- Browser diarahkan ke `/auth/callback`.
- Setelah callback berhasil, redirect otomatis ke `/beranda`.
- User sudah dalam keadaan login.
- Di Supabase Dashboard: status email berubah menjadi `Confirmed`.

---

### TS-01-003: Register dengan Email yang Sudah Terdaftar

**Langkah:**
1. Buka halaman `/register`.
2. Isi email yang sudah ada di sistem (contoh: `budi@warga.id`).
3. Klik **Daftar**.

**Yang diharapkan:**
- Muncul pesan error bahwa email sudah terdaftar.
- Akun baru tidak dibuat.

---

### TS-01-004: Register dengan Field Kosong / Password Terlalu Pendek

**Langkah:**
1. Buka halaman `/register`.
2. Klik **Daftar** tanpa mengisi field apa pun, atau isi password kurang dari 6 karakter.

**Yang diharapkan:**
- Muncul validasi di field yang belum diisi / tidak valid.
- Form tidak dikirim ke server.

---

## 3. TS-02 Autentikasi — Login & Logout

**PBI:** Sebagai warga/admin, saya ingin bisa login agar dapat mengakses fitur yang memerlukan akun.

---

### TS-02-001: Login Warga dengan Kredensial Valid

**Langkah:**
1. Buka halaman `/login`.
2. Masukkan email `budi@warga.id` dan password `password123`.
3. Klik **Masuk**.

**Yang diharapkan:**
- Redirect ke `/beranda`.
- Nama user muncul di navbar/header.
- Tidak ada pesan error.

---

### TS-02-002: Login Admin dengan Kredensial Valid

**Langkah:**
1. Buka halaman `/login`.
2. Masukkan email `admin@pantaukota.id` dan password `password123`.
3. Klik **Masuk**.

**Yang diharapkan:**
- Redirect ke halaman dashboard admin (misalnya `/admin/dashboard`).
- Navigasi admin (Kelola Laporan, Kelola Kategori, Kelola User, Dashboard) tampil.

---

### TS-02-003: Login dengan Password Salah

**Langkah:**
1. Buka halaman `/login`.
2. Masukkan email valid tetapi password salah.
3. Klik **Masuk**.

**Yang diharapkan:**
- Muncul pesan error "Email atau password salah" atau serupa.
- User tetap di halaman login.

---

### TS-02-004: Toggle Tampilkan/Sembunyikan Password

**Langkah:**
1. Di halaman `/login` atau `/register`, isi field password.
2. Klik ikon mata (👁) di sebelah kanan field password.

**Yang diharapkan:**
- Password berubah dari karakter `•••` menjadi teks terlihat.
- Klik lagi, password kembali tersembunyi.
- Klik ikon tidak memicu submit form.

---

### TS-02-005: Logout

**Langkah:**
1. Login sebagai warga.
2. Klik tombol / menu **Keluar** di navbar atau profil.

**Yang diharapkan:**
- Session dihapus.
- Redirect ke halaman `/login`.
- Jika mencoba akses `/beranda` setelah logout, diarahkan kembali ke `/login`.

---

## 4. TS-03 Buat Laporan (Warga)

**PBI:** Sebagai warga, saya ingin membuat laporan masalah kota dengan foto dan lokasi agar pemerintah bisa menindaklanjuti.

---

### TS-03-001: Buat Laporan dengan Semua Field Valid

**Aktor:** Warga (login sebagai `budi@warga.id`)

**Langkah:**
1. Navigasi ke halaman buat laporan (tombol "Laporkan" atau `/laporan/baru`).
2. Isi judul laporan.
3. Pilih kategori dari dropdown.
4. Isi deskripsi masalah.
5. Pilih lokasi di peta atau izinkan GPS untuk deteksi otomatis.
6. Upload minimal 1 foto (gunakan file JPG/PNG ≤ 5MB).
7. Klik **Kirim Laporan**.

**Yang diharapkan:**
- Laporan berhasil disimpan ke database.
- Field `foto` di database berisi public ID Cloudinary (format `pantaukota/...`), **bukan** URL langsung.
- Gambar tampil di halaman detail laporan.
- Status laporan otomatis `MENUNGGU`.
- User diarahkan ke halaman detail laporan atau halaman laporan saya.
- Toast notifikasi muncul: "Laporan berhasil dikirim" atau serupa.

---

### TS-03-002: Buat Laporan Tanpa Foto

**Langkah:**
1. Isi semua field laporan kecuali foto.
2. Klik **Kirim Laporan**.

**Yang diharapkan:**
- Tergantung konfigurasi: jika foto wajib → muncul validasi error.
- Jika foto opsional → laporan berhasil disimpan tanpa foto.

---

### TS-03-003: Upload Foto Melebihi Batas Ukuran (>5MB)

**Langkah:**
1. Di form buat laporan, coba upload file gambar berukuran lebih dari 5MB.

**Yang diharapkan:**
- Muncul pesan error bahwa file terlalu besar.
- File tidak diunggah ke Cloudinary.
- Form tidak bisa di-submit dengan file tersebut.

---

### TS-03-004: Buat Laporan Tanpa Login

**Langkah:**
1. Logout dari akun.
2. Coba akses URL halaman buat laporan secara langsung.

**Yang diharapkan:**
- Middleware mengarahkan ke `/login`.
- Halaman buat laporan tidak bisa diakses tanpa sesi aktif.

---

## 5. TS-04 Lihat Daftar & Detail Laporan (Warga)

**PBI:** Sebagai warga, saya ingin melihat semua laporan yang ada beserta detailnya.

---

### TS-04-001: Melihat Daftar Laporan di Beranda

**Langkah:**
1. Login sebagai warga.
2. Buka halaman `/beranda`.

**Yang diharapkan:**
- Daftar laporan terbaru tampil (sesuai limit konstanta `DASHBOARD_LAPORAN_LIMIT`).
- Setiap kartu menampilkan: judul, kategori (ikon + nama), status (badge warna), jumlah vote, waktu dibuat.
- Foto thumbnail laporan tampil jika ada.

---

### TS-04-002: Filter Laporan Berdasarkan Kategori

**Langkah:**
1. Di halaman beranda atau daftar laporan, klik chip filter kategori (misal: "Jalan Rusak").

**Yang diharapkan:**
- Daftar laporan difilter, hanya menampilkan laporan dengan kategori yang dipilih.
- Chip kategori aktif berubah tampilan (background primary, teks putih).
- Klik kategori yang sama lagi → filter dibatalkan, semua laporan tampil kembali.

---

### TS-04-003: Melihat Detail Laporan

**Langkah:**
1. Klik salah satu laporan dari daftar.

**Yang diharapkan:**
- Halaman detail laporan terbuka.
- Layout dua kolom tampil di desktop: kolom kiri (foto + deskripsi, komentar), kolom kanan (peta lokasi + timeline status).
- Foto laporan tampil dengan ukuran yang tepat (`h-72 sm:h-80`).
- Box deskripsi memiliki tinggi minimal yang setara dengan box foto.
- Peta menampilkan pin lokasi laporan.
- Timeline status laporan tampil di sisi kanan.
- Jumlah vote dan komentar tampil.

---

### TS-04-004: Pagination Daftar Laporan

**Langkah:**
1. Pastikan jumlah laporan di database melebihi `LAPORAN_PER_PAGE`.
2. Buka halaman daftar laporan.
3. Scroll ke bawah atau klik tombol "Muat Lebih Banyak" / navigasi halaman.

**Yang diharapkan:**
- Laporan dimuat secara bertahap (sesuai nilai `LAPORAN_PER_PAGE`).
- Data tidak duplikat saat halaman berikutnya dimuat.

---

## 6. TS-05 Vote Laporan (Warga)

**PBI:** Sebagai warga, saya ingin bisa vote laporan agar laporan prioritas mendapat perhatian lebih.

---

### TS-05-001: Vote Laporan (Pertama Kali)

**Aktor:** Warga login

**Langkah:**
1. Buka detail laporan yang belum pernah di-vote.
2. Klik tombol **Vote** (ikon/tombol upvote).

**Yang diharapkan:**
- Jumlah vote bertambah 1 secara langsung (optimistic update atau setelah refresh).
- Tampilan tombol vote berubah (menandakan sudah di-vote).
- Data `voteCount` bertambah di database.
- Record Vote baru dibuat di tabel `Vote`.

---

### TS-05-002: Batalkan Vote (Unvote)

**Langkah:**
1. Di laporan yang sudah di-vote, klik tombol vote lagi.

**Yang diharapkan:**
- Jumlah vote berkurang 1.
- Tampilan tombol kembali ke kondisi belum di-vote.
- Record Vote dihapus dari tabel `Vote`.

---

### TS-05-003: Vote Laporan Sendiri

**Langkah:**
1. Login sebagai `budi@warga.id`.
2. Buka laporan yang dibuat oleh `budi@warga.id`.
3. Coba klik tombol vote.

**Yang diharapkan:**
- Tergantung implementasi: jika vote laporan sendiri dilarang → tombol vote dinonaktifkan atau muncul pesan error.
- Jika diizinkan → proses vote berjalan normal.

---

### TS-05-004: Vote Tanpa Login

**Langkah:**
1. Logout dari akun.
2. Buka detail laporan.
3. Coba klik tombol vote.

**Yang diharapkan:**
- Diarahkan ke halaman `/login`, atau muncul pesan "Silakan login untuk vote".

---

## 7. TS-06 Komentar (Warga)

**PBI:** Sebagai warga, saya ingin bisa berkomentar di laporan untuk menambahkan informasi atau bertanya.

---

### TS-06-001: Tulis Komentar

**Aktor:** Warga login

**Langkah:**
1. Buka halaman detail laporan.
2. Gulir ke bagian komentar (bagian bawah / kolom kiri bawah di desktop).
3. Ketik komentar di textarea.
4. Klik **Kirim**.

**Yang diharapkan:**
- Komentar muncul di daftar komentar setelah berhasil.
- Nama pengguna dan waktu komentar tampil.
- Jumlah komentar (`_count.komentar`) bertambah.

---

### TS-06-002: Komentar Kosong

**Langkah:**
1. Buka textarea komentar.
2. Klik **Kirim** tanpa mengetik apa pun.

**Yang diharapkan:**
- Form tidak dikirim.
- Muncul validasi atau tombol **Kirim** dalam kondisi disabled.

---

### TS-06-003: Komentar Tanpa Login

**Langkah:**
1. Logout.
2. Akses halaman detail laporan.

**Yang diharapkan:**
- Form komentar tidak tampil, atau tampil dengan pesan "Login untuk berkomentar".
- Klik area komentar diarahkan ke `/login`.

---

### TS-06-004: Urutan Komentar di Mobile

**Langkah:**
1. Buka halaman detail laporan di perangkat mobile (atau resize browser ke ≤640px).

**Yang diharapkan:**
- Urutan konten dari atas ke bawah: Foto → Deskripsi → Peta & Timeline → Komentar.
- Komentar tampil **di bawah** peta & timeline (bukan di antara foto dan peta).

---

## 8. TS-07 Laporan Saya & Hapus Laporan (Warga)

**PBI:** Sebagai warga, saya ingin melihat dan mengelola laporan yang pernah saya buat.

---

### TS-07-001: Melihat Daftar Laporan Milik Sendiri

**Langkah:**
1. Login sebagai warga.
2. Buka halaman `/laporan-saya`.

**Yang diharapkan:**
- Hanya laporan milik user yang sedang login yang ditampilkan.
- Setiap laporan menampilkan status, tanggal buat, dan jumlah vote.

---

### TS-07-002: Hapus Laporan dalam Batas Waktu 24 Jam

**Langkah:**
1. Buat laporan baru.
2. Buka halaman `/laporan-saya`.
3. Klik tombol **Hapus** pada laporan yang baru dibuat (usia < 24 jam).

**Yang diharapkan:**
- Muncul dialog konfirmasi "Hapus Laporan?" dengan penjelasan syarat.
- Setelah konfirmasi, laporan dihapus dari database.
- Laporan tidak lagi muncul di daftar.
- Toast notifikasi muncul: "Laporan berhasil dihapus".

---

### TS-07-003: Hapus Laporan Setelah Lebih dari 24 Jam

**Langkah:**
1. Cari laporan yang sudah berusia lebih dari 24 jam (`createdAt` > 24 jam lalu).
2. Coba klik tombol hapus.

**Yang diharapkan:**
- Tombol hapus dinonaktifkan (disabled), atau muncul pesan "Laporan tidak bisa dihapus setelah 24 jam".
- Laporan tidak terhapus.

---

### TS-07-004: Hapus Laporan Milik User Lain (Akses Tidak Sah)

**Langkah:**
1. Login sebagai `budi@warga.id`.
2. Coba kirim request `DELETE /api/laporan/{id}` menggunakan ID laporan milik `siti@warga.id`.

**Yang diharapkan:**
- API mengembalikan response `403 Forbidden` atau `401 Unauthorized`.
- Laporan milik `siti@warga.id` tidak terhapus.

---

## 9. TS-08 Peta Laporan (Warga)

**PBI:** Sebagai warga, saya ingin melihat laporan di peta kota agar tahu persebaran masalah.

---

### TS-08-001: Peta Tampil Penuh Tanpa Area Abu-abu

**Langkah:**
1. Login sebagai warga.
2. Buka halaman `/peta`.

**Yang diharapkan:**
- Peta Leaflet tampil penuh tanpa tile yang hilang (area abu-abu).
- Semua laporan yang memiliki koordinat ditampilkan sebagai marker.

---

### TS-08-002: Warna Marker Sesuai Logika Prioritas

**Langkah:**
1. Di halaman peta, amati warna marker laporan.

**Yang diharapkan:**
- **Hijau** (#006d4a): laporan berstatus `SELESAI` (terlepas dari prioritas).
- **Merah** (#dc2626): laporan berstatus `MENUNGGU`/`DIPROSES` dengan prioritas manual = true, ATAU skor ≥ 50.
- **Amber** (#f59e0b): laporan `MENUNGGU` non-prioritas.
- **Biru** (#3b82f6): laporan `DIPROSES` non-prioritas.

---

### TS-08-003: Klik Marker Menampilkan Popup Laporan

**Langkah:**
1. Di halaman peta, klik salah satu marker laporan.

**Yang diharapkan:**
- Popup muncul dengan informasi singkat laporan: judul, kategori, status.
- Tersedia tombol/link untuk menuju halaman detail laporan.

---

### TS-08-004: Filter Peta Berdasarkan Kategori

**Langkah:**
1. Di halaman peta, klik chip filter kategori.

**Yang diharapkan:**
- Hanya marker laporan dengan kategori yang dipilih yang tampil.
- Marker lain disembunyikan sementara.

---

### TS-08-005: Peta Tampil di Mobile (360px)

**Langkah:**
1. Resize browser ke lebar 360px atau gunakan DevTools mobile emulation.
2. Buka halaman `/peta`.

**Yang diharapkan:**
- Peta tampil penuh secara vertikal.
- Tidak ada horizontal scroll.
- Marker dan popup tetap dapat diklik.

---

## 10. TS-09 Notifikasi Realtime (Warga)

**PBI:** Sebagai warga, saya ingin mendapatkan notifikasi otomatis saat status laporan saya berubah tanpa harus refresh halaman.

---

### TS-09-001: Notifikasi Muncul Otomatis Saat Status Diubah Admin

**Langkah:**
1. Buka dua browser tab:
   - Tab A: Login sebagai warga (`budi@warga.id`), buka halaman `/notifikasi` atau tetap di beranda.
   - Tab B: Login sebagai admin, ubah status laporan milik `budi@warga.id`.
2. Amati Tab A.

**Yang diharapkan:**
- Di Tab A, notifikasi baru muncul **secara otomatis tanpa refresh** (via Supabase Realtime).
- Badge notifikasi di navbar berubah / jumlah notifikasi bertambah.

---

### TS-09-002: Notifikasi Ditandai Sudah Dibaca

**Langkah:**
1. Buka halaman `/notifikasi`.
2. Klik notifikasi yang belum dibaca.

**Yang diharapkan:**
- Notifikasi ditandai sebagai sudah dibaca (`dibaca = true`).
- Tampilan notifikasi berubah (warna background berbeda atau hilang tanda unread).
- Badge jumlah notifikasi belum dibaca berkurang.

---

### TS-09-003: Notifikasi Hanya untuk User yang Relevan

**Langkah:**
1. Admin mengubah status laporan milik `budi@warga.id`.
2. Cek notifikasi akun `siti@warga.id`.

**Yang diharapkan:**
- `siti@warga.id` **tidak** menerima notifikasi tentang laporan milik `budi`.
- Notifikasi hanya dikirim ke pemilik laporan.

---

## 11. TS-10 Profil (Warga)

**PBI:** Sebagai warga, saya ingin melihat dan mengedit informasi profil saya.

---

### TS-10-001: Melihat Halaman Profil

**Langkah:**
1. Login sebagai warga.
2. Buka halaman `/profil`.

**Yang diharapkan:**
- Nama dan email user tampil.
- Informasi tambahan (tanggal bergabung, jumlah laporan) tampil jika tersedia.

---

### TS-10-002: Edit Nama Profil

**Langkah:**
1. Di halaman `/profil`, klik tombol **Edit** atau **Simpan Perubahan**.
2. Ubah nama.
3. Klik **Simpan Perubahan**.

**Yang diharapkan:**
- Perubahan nama tersimpan di database (tabel `User`).
- Toast konfirmasi muncul.
- Nama baru langsung tampil di halaman profil dan navbar.

---

## 12. TS-11 Dashboard Admin

**PBI:** Sebagai admin, saya ingin melihat ringkasan statistik laporan untuk memantau kondisi kota.

---

### TS-11-001: Melihat Dashboard Admin

**Langkah:**
1. Login sebagai admin.
2. Buka halaman `/admin/dashboard`.

**Yang diharapkan:**
- Angka statistik tampil: total laporan, laporan menunggu, laporan diproses, laporan selesai.
- Grafik atau chart distribusi laporan tampil (jika ada).
- Data akurat sesuai kondisi database saat ini.

---

### TS-11-002: Navigasi Antar Halaman Admin

**Langkah:**
1. Login sebagai admin.
2. Klik menu navigasi: Dashboard → Kelola Laporan → Kelola Kategori → Kelola User.

**Yang diharapkan:**
- Setiap halaman terbuka tanpa error.
- Navigasi aktif (active state) ditandai di menu yang sedang dibuka.

---

## 13. TS-12 Kelola Laporan (Admin)

**PBI:** Sebagai admin, saya ingin melihat semua laporan warga dan bisa memfilternya untuk proses tindak lanjut.

---

### TS-12-001: Melihat Semua Laporan di Halaman Admin

**Langkah:**
1. Login sebagai admin.
2. Buka `/admin/kelola-laporan`.

**Yang diharapkan:**
- Semua laporan dari semua warga tampil (bukan hanya milik satu user).
- Kolom informasi minimal: judul, pelapor, kategori, status, tanggal, prioritas.

---

### TS-12-002: Filter Laporan Berdasarkan Status

**Langkah:**
1. Di halaman kelola laporan, pilih filter status `MENUNGGU`.

**Yang diharapkan:**
- Hanya laporan berstatus `MENUNGGU` yang ditampilkan.
- Filter dapat dikombinasikan (jika ada multi-filter).

---

### TS-12-003: Cari Laporan Berdasarkan Kata Kunci

**Langkah:**
1. Di kolom pencarian (jika tersedia), ketik kata kunci dari judul laporan.

**Yang diharapkan:**
- Daftar laporan difilter sesuai kata kunci.

---

### TS-12-004: Melihat Detail Laporan dari Sisi Admin

**Langkah:**
1. Klik laporan dari halaman kelola laporan.

**Yang diharapkan:**
- Halaman detail laporan admin terbuka.
- Info pelapor (nama) tampil.
- Tombol ubah status tersedia.
- Peta lokasi laporan tampil.

---

## 14. TS-13 Update Status & Penyelesaian (Admin)

**PBI:** Sebagai admin, saya ingin mengubah status laporan dan mengunggah bukti penyelesaian agar warga tahu tindak lanjutnya.

---

### TS-13-001: Ubah Status dari MENUNGGU ke DIPROSES

**Langkah:**
1. Login sebagai admin.
2. Buka detail laporan berstatus `MENUNGGU`.
3. Klik tombol **Proses** atau ubah status ke `DIPROSES`.
4. Konfirmasi perubahan.

**Yang diharapkan:**
- Status laporan berubah menjadi `DIPROSES`.
- Timeline laporan diperbarui dengan timestamp.
- Notifikasi dikirim ke pemilik laporan (realtime dan/atau email jika dikonfigurasi).

---

### TS-13-002: Tandai Laporan Selesai dengan Catatan dan Foto

**Langkah:**
1. Buka detail laporan berstatus `DIPROSES`.
2. Klik tombol **Selesai**.
3. Modal penyelesaian terbuka:
   - Isi catatan penyelesaian (wajib, minimal 4 baris/karakter memadai).
   - Upload foto bukti penyelesaian (opsional, ≤ 5MB).
4. Klik **Selesaikan**.

**Yang diharapkan:**
- Modal tertutup setelah berhasil.
- Status laporan berubah menjadi `SELESAI`.
- Field `catatanAdmin` tersimpan di database.
- Field `fotoPenyelesaian` berisi public ID Cloudinary (format `pantaukota/...`).
- Field `selesaiAt` terisi dengan timestamp sekarang.
- Warna marker laporan di peta berubah menjadi **Hijau**.
- Notifikasi dikirim ke pemilik laporan.

---

### TS-13-003: Selesaikan Laporan Tanpa Catatan (Validasi)

**Langkah:**
1. Buka modal penyelesaian laporan.
2. Biarkan field catatan kosong.
3. Klik **Selesaikan**.

**Yang diharapkan:**
- Tombol **Selesaikan** dalam kondisi disabled jika catatan kosong, ATAU muncul toast error "Catatan wajib diisi".
- Laporan tidak berubah status.

---

### TS-13-004: Upload Foto Penyelesaian Melebihi 5MB

**Langkah:**
1. Di modal penyelesaian, upload file gambar > 5MB.

**Yang diharapkan:**
- Muncul pesan error bahwa file terlalu besar.
- File tidak diunggah ke Cloudinary.

---

### TS-13-005: Tandai Laporan sebagai Prioritas (Manual Flag)

**Langkah:**
1. Buka detail laporan dari sisi admin.
2. Aktifkan toggle/checkbox **Prioritas**.

**Yang diharapkan:**
- Field `prioritas` berubah menjadi `true` di database.
- Warna marker laporan di peta berubah menjadi **Merah** (jika belum `SELESAI`).

---

## 15. TS-14 Kelola Kategori (Admin)

**PBI:** Sebagai admin, saya ingin mengelola kategori laporan agar jenis masalah terklasifikasi dengan baik.

---

### TS-14-001: Melihat Daftar Kategori

**Langkah:**
1. Login sebagai admin.
2. Buka `/admin/kelola-kategori`.

**Yang diharapkan:**
- Semua kategori aktif tampil dengan nama dan ikon.
- Ikon menggunakan komponen `DynamicIcon` (ikon dari `lucide-react`).
- Latar ikon menggunakan `bg-primary/10` dan warna ikon `text-primary` (seragam, tanpa warna custom per kategori).

---

### TS-14-002: Tambah Kategori Baru

**Langkah:**
1. Klik tombol **Tambah Kategori**.
2. Isi nama kategori dan pilih ikon.
3. Klik **Simpan**.

**Yang diharapkan:**
- Kategori baru muncul di daftar.
- Kategori tersedia saat warga membuat laporan baru.

---

### TS-14-003: Edit Kategori

**Langkah:**
1. Klik ikon edit di salah satu kategori.
2. Ubah nama atau ikon.
3. Simpan perubahan.

**Yang diharapkan:**
- Perubahan tersimpan.
- Kategori yang diedit langsung diperbarui di daftar.
- Laporan lama dengan kategori ini tetap menampilkan ikon yang diperbarui.

---

### TS-14-004: Nonaktifkan Kategori

**Langkah:**
1. Toggle nonaktifkan (`isActive = false`) salah satu kategori.

**Yang diharapkan:**
- Kategori tidak muncul lagi sebagai pilihan saat warga membuat laporan baru.
- Laporan lama yang menggunakan kategori ini tetap tampil.

---

## 16. TS-15 Kelola User (Admin)

**PBI:** Sebagai admin, saya ingin mengelola akun user agar dapat menonaktifkan user yang bermasalah.

---

### TS-15-001: Melihat Daftar User

**Langkah:**
1. Login sebagai admin.
2. Buka `/admin/kelola-user`.

**Yang diharapkan:**
- Semua user (kecuali admin itu sendiri, jika dikecualikan) tampil dengan nama, email, role, dan status aktif.

---

### TS-15-002: Nonaktifkan User

**Langkah:**
1. Klik tombol nonaktifkan pada salah satu user warga.
2. Konfirmasi tindakan.

**Yang diharapkan:**
- Field `isActive` user berubah menjadi `false` di database.
- User yang dinonaktifkan tidak bisa login (atau mendapat pesan "Akun dinonaktifkan").

---

### TS-15-003: Aktifkan Kembali User

**Langkah:**
1. Temukan user yang statusnya tidak aktif.
2. Klik tombol aktifkan.

**Yang diharapkan:**
- Field `isActive` kembali `true`.
- User bisa login kembali.

---

## 17. TS-16 Prioritas Laporan

**PBI:** Sebagai sistem, laporan dengan vote tinggi atau usia lama harus otomatis ditandai prioritas.

---

### TS-16-001: Prioritas Otomatis Berdasarkan Skor

**Formula skor:** `(voteCount × 2) + jumlah_hari_sejak_dibuat`
**Threshold:** skor ≥ 50 (nilai dari konstanta `PRIORITY_THRESHOLD`)

**Langkah:**
1. Buat atau temukan laporan dengan voteCount tinggi dan/atau usia lama (total skor ≥ 50).
2. Buka halaman peta.

**Yang diharapkan:**
- Marker laporan berwarna **Merah** karena skor ≥ threshold.
- `getMarkerColor()` mengembalikan `#dc2626`.

---

### TS-16-002: Laporan Selesai Tetap Hijau Meski Skor Tinggi

**Langkah:**
1. Temukan laporan berstatus `SELESAI` dengan skor prioritas ≥ 50.
2. Buka peta.

**Yang diharapkan:**
- Marker tetap **Hijau** (#006d4a), bukan merah.
- Status `SELESAI` mengalahkan logika prioritas.

---

## 18. TS-17 Upload & Tampilan Gambar (Cloudinary)

**PBI:** Sebagai sistem, gambar laporan harus terkompresi, tersimpan di Cloudinary, dan tampil dengan benar di semua konteks.

---

### TS-17-001: Kompresi Gambar Sebelum Upload

**Langkah:**
1. Pilih gambar berukuran besar (misal 10MB) di form buat laporan.
2. Amati ukuran file yang dikirim ke `/api/upload`.

**Yang diharapkan:**
- File dikompresi oleh `browser-image-compression` (`src/lib/client-image.ts`) sebelum dikirim ke server.
- Ukuran file yang diterima server lebih kecil dari aslinya.

---

### TS-17-002: Gambar Tampil di Berbagai Konteks

**Langkah:**
1. Setelah membuat laporan dengan foto, buka:
   - Halaman beranda (thumbnail di kartu laporan).
   - Halaman detail laporan (gambar ukuran penuh).
   - Halaman peta (thumbnail di popup marker).
   - Halaman laporan saya (thumbnail di kartu).

**Yang diharapkan:**
- Gambar tampil di semua konteks tanpa error (`ERR_CONNECTION_REFUSED` atau gambar rusak).
- Thumbnail menggunakan `CLOUDINARY_THUMBNAIL_IMAGE_OPTIONS`.
- Detail menggunakan `CLOUDINARY_DETAIL_IMAGE_OPTIONS`.
- Gambar lama (URL Cloudinary/Unsplash penuh) juga masih tampil (backward-compatible via `getCloudinaryImageUrl()`).

---

### TS-17-003: Format Penyimpanan Public ID di Database

**Langkah:**
1. Setelah upload foto laporan baru, cek database (tabel `Laporan`, kolom `foto`).

**Yang diharapkan:**
- Nilai `foto` berformat `pantaukota/...` (public ID Cloudinary), **bukan** URL penuh `https://res.cloudinary.com/...`.

---

## 19. TS-18 Notifikasi Email (Resend)

**PBI:** Sebagai warga, saya ingin mendapat email saat status laporan saya diperbarui.

*Catatan: Skenario ini memerlukan `RESEND_API_KEY` valid dan email penerima yang dapat diakses.*

---

### TS-18-001: Email Terkirim Saat Status Laporan Diubah Admin

**Langkah:**
1. Pastikan `RESEND_API_KEY` dan `RESEND_FROM_EMAIL` sudah diset.
2. Login admin, ubah status laporan milik `budi@warga.id`.
3. Cek inbox email `budi@warga.id`.

**Yang diharapkan:**
- Email notifikasi diterima dengan informasi perubahan status.
- Link di email mengarah ke halaman detail laporan yang benar (sesuai `NEXT_PUBLIC_APP_URL`).

---

### TS-18-002: Email Konfirmasi Register

**Langkah:**
1. Register akun baru.
2. Cek inbox email yang digunakan.

**Yang diharapkan:**
- Email konfirmasi dari PantauKota diterima.
- Link konfirmasi mengarah ke domain yang benar (sesuai `NEXT_PUBLIC_APP_URL`).

---

## 20. TS-19 Responsive & Mobile (360px)

**PBI:** Sebagai pengguna mobile, saya ingin tampilan aplikasi rapi di layar kecil.

---

### TS-19-001: Tidak Ada Horizontal Scroll di 360px

**Langkah:**
1. Buka browser DevTools, set ukuran layar ke 360 × 640px.
2. Jelajahi halaman: beranda, detail laporan, peta, laporan saya, notifikasi, profil.

**Yang diharapkan:**
- Tidak ada konten yang melebihi lebar layar.
- Tidak ada scrollbar horizontal pada semua halaman.
- `overflow-x: hidden` berlaku di `html` dan `body`.

---

### TS-19-002: Touch Target ≥ 44px

**Langkah:**
1. Di DevTools mobile, inspeksi tombol-tombol utama (Vote, Kirim Komentar, Hapus Laporan, Filter Chip).

**Yang diharapkan:**
- Tinggi dan lebar tombol minimal 44×44px untuk kemudahan tap di mobile.

---

### TS-19-003: Tipografi Responsif

**Langkah:**
1. Di mobile (360px), cek heading dan body text.

**Yang diharapkan:**
- Heading menggunakan ukuran lebih kecil di mobile (misalnya `text-2xl`, bukan `text-3xl`).
- Teks panjang tidak overflow: menggunakan class `truncate` atau wrapping yang tepat.

---

### TS-19-004: Navbar / Navigasi di Mobile

**Langkah:**
1. Buka aplikasi di mobile.

**Yang diharapkan:**
- Navigasi mobile tampil (bottom navbar atau hamburger menu).
- Semua menu utama dapat dijangkau dengan mudah.

---

## 21. TS-20 Guard Akses & Keamanan Route

**PBI:** Sebagai sistem, halaman yang memerlukan autentikasi harus terlindungi dari akses tidak sah.

---

### TS-20-001: Warga Tidak Bisa Akses Halaman Admin

**Langkah:**
1. Login sebagai warga (`budi@warga.id`).
2. Coba akses `/admin/dashboard` langsung di URL bar.

**Yang diharapkan:**
- Diarahkan ke halaman beranda warga ATAU muncul halaman `403 Forbidden`.
- Konten admin tidak tampil.

---

### TS-20-002: Pengunjung Tidak Login Tidak Bisa Akses Route Terproteksi

**Langkah:**
1. Logout.
2. Coba akses: `/beranda`, `/laporan-saya`, `/notifikasi`, `/profil`, `/admin/dashboard`.

**Yang diharapkan:**
- Semua route di atas diarahkan ke `/login`.
- Middleware `src/middleware.ts` aktif memblokir akses.

---

### TS-20-003: Admin Tidak Bisa Akses Route Khusus Warga (Jika Dibatasi)

**Langkah:**
1. Login sebagai admin.
2. Coba akses `/laporan-saya`.

**Yang diharapkan:**
- Jika route tersebut dibatasi untuk warga saja → redirect ke halaman admin.
- Jika dibiarkan terbuka → halaman tampil normal (tidak ada data laporan admin).

---

### TS-20-004: API Tidak Bisa Diakses Tanpa Sesi

**Langkah:**
1. Tanpa login, kirim request langsung ke:
   - `GET /api/laporan`
   - `POST /api/laporan`
   - `POST /api/vote`
   - `POST /api/komentar`

**Yang diharapkan:**
- Semua endpoint mengembalikan `401 Unauthorized`.
- Tidak ada data yang bocor.

---

## Catatan Tambahan

| Hal | Keterangan |
|-----|-----------|
| **Bahasa UI** | Semua label, pesan, dan tombol menggunakan Bahasa Indonesia Baku sesuai `DESIGN.md` |
| **Toast Notifikasi** | Selalu menggunakan toast (atas-tengah, auto-dismiss 3 detik), bukan inline error |
| **Border/Divider** | Tidak ada garis pemisah `1px solid`; pemisah menggunakan perbedaan warna background |
| **Glassmorphism** | Dilarang — semua elemen floating harus menggunakan background solid |
| **Warna Ikon Kategori** | Seragam `bg-primary/10` + `text-primary`, tidak ada warna custom per kategori |
| **TypeScript** | Jalankan `npx tsc --noEmit` sebelum commit; tidak boleh ada error TypeScript |

---

*Dokumen ini diperbarui: Juni 2026*
