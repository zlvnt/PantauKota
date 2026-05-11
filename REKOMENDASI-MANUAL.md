# 📝 Rekomendasi Manual Sebelum Production

**Tanggal:** 11 Mei 2026  
**Priority:** MEDIUM - LOW  
**Estimasi Waktu:** 2-4 jam

---

## 🎯 Yang Harus Dilakukan Manual

### 1. Accessibility - Icon Buttons (30 menit)

**File yang Perlu Diaudit:**
- `src/app/(warga)/peta/page.tsx`
- `src/app/(admin)/dashboard/peta/page.tsx`

**Cari pattern ini:**
```typescript
<button onClick={...}>
  <Search className="w-5 h-5" />
</button>
```

**Ganti dengan:**
```typescript
<button 
  onClick={...}
  aria-label="Cari laporan"
  title="Cari laporan"
>
  <Search className="w-5 h-5" />
</button>
```

**Daftar buttons yang perlu label:**
- Search button
- Clear search button (X icon)
- Filter toggle button
- Refresh button
- Close modal buttons

---

### 2. Database Performance Indexing (15 menit)

**File:** `prisma/schema.prisma`

**Tambahkan di model Laporan:**
```prisma
model Laporan {
  // ... existing fields
  
  @@index([status, selesaiAt])
  @@index([kategoriId, status])
  @@index([userId, status])
  @@index([latitude, longitude])
}
```

**Jalankan migrasi:**
```bash
npx prisma migrate dev --name add_performance_indexes
```

**Benefit:**
- Query laporan 2-3x lebih cepat
- Filter by status + kategori lebih optimal
- Peta loading lebih cepat

---

### 3. Testing Manual (2-3 jam)

#### A. User Flows - Warga (45 menit)
- [ ] Register akun baru
- [ ] Login
- [ ] Buat laporan dengan foto (kamera & upload)
- [ ] Vote laporan
- [ ] Komentar di laporan
- [ ] Hapus laporan sendiri (< 24 jam)
- [ ] Coba hapus laporan (> 24 jam) - harus gagal
- [ ] Lihat notifikasi
- [ ] Update profil
- [ ] Ubah password

#### B. User Flows - Admin (45 menit)
- [ ] Login sebagai admin
- [ ] Lihat dashboard & charts
- [ ] Filter laporan di peta
- [ ] Ubah status laporan (MENUNGGU → DIPROSES → SELESAI)
- [ ] Tambah catatan admin
- [ ] Upload foto penyelesaian
- [ ] Kelola kategori (CRUD)
- [ ] Kelola user (toggle aktif/nonaktif)
- [ ] Verifikasi email notifikasi terkirim

#### C. Responsive Testing (30 menit)
Test di berbagai ukuran layar:
- [ ] Mobile (360px) - Chrome DevTools
- [ ] Tablet (768px)
- [ ] Desktop (1280px)
- [ ] Large Desktop (1920px)

**Cek:**
- Tidak ada horizontal scroll
- Text tidak terpotong
- Button touch target ≥ 44px
- Images tidak distorsi

#### D. Browser Compatibility (30 menit)
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (jika ada Mac)
- [ ] Edge (latest)

**Cek:**
- Kamera web berfungsi
- GPS berfungsi
- SSE notifications berfungsi
- Upload foto berfungsi

---

### 4. Environment Variables Production (10 menit)

**File:** `.env.production` (buat baru)

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/dbname"

# Auth
NEXTAUTH_URL="https://pantaukota.yourdomain.com"
NEXTAUTH_SECRET="<GENERATE_STRONG_SECRET_HERE>"

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# Email
RESEND_API_KEY="re_your_api_key"
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

**Verifikasi:**
- [ ] Semua credentials production sudah diisi
- [ ] NEXTAUTH_URL sesuai domain production
- [ ] NEXTAUTH_SECRET sudah di-generate (jangan pakai default)
- [ ] Cloudinary credentials production
- [ ] Resend API key production

---

### 5. Pre-Deployment Build Test (10 menit)

```bash
# Clean install
rm -rf node_modules .next
npm install

# Build production
npm run build

# Test production build locally
npm start
```

**Cek:**
- [ ] Build berhasil tanpa error
- [ ] Tidak ada warning critical
- [ ] Bundle size reasonable (< 500KB first load)
- [ ] Production build berjalan di localhost

---

## 🚀 Deployment Steps

### 1. Push ke Repository
```bash
git add .
git commit -m "Pre-production fixes and optimizations"
git push origin main
```

### 2. Deploy ke Hosting

**Jika pakai Vercel:**
1. Connect repository
2. Set environment variables di dashboard
3. Deploy

**Jika pakai VPS:**
```bash
# Di server
git pull origin main
npm install
npx prisma migrate deploy
npm run build
pm2 restart pantaukota
```

### 3. Post-Deployment Verification (15 menit)

**Immediately after deploy:**
- [ ] Site accessible di domain production
- [ ] Login berfungsi
- [ ] Database connection OK
- [ ] Cloudinary upload berfungsi
- [ ] Email notifications terkirim
- [ ] SSE notifications berfungsi

**Monitor first 24 hours:**
- [ ] Check error logs
- [ ] Monitor response times
- [ ] Check user registrations
- [ ] Verify laporan submissions
- [ ] Check email delivery rate

---

## 📊 Monitoring Setup (Optional tapi Recommended)

### Error Monitoring
**Sentry** (Free tier):
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

### Analytics
**Plausible** atau **Google Analytics**:
- Track page views
- Track user flows
- Monitor conversion rates

### Uptime Monitoring
**UptimeRobot** (Free):
- Monitor site availability
- Alert jika down
- Response time tracking

---

## ✅ Final Checklist

### Pre-Launch
- [ ] All manual tests passed
- [ ] Database indexes added
- [ ] Aria-labels added to icon buttons
- [ ] Environment variables production ready
- [ ] Build test successful
- [ ] Repository pushed

### Launch Day
- [ ] Deploy to production
- [ ] Verify all critical features
- [ ] Monitor error logs
- [ ] Test from different devices
- [ ] Announce to stakeholders

### Post-Launch (Week 1)
- [ ] Daily error log review
- [ ] Performance monitoring
- [ ] User feedback collection
- [ ] Bug fixes prioritization
- [ ] Documentation updates

---

## 🆘 Rollback Plan

Jika ada masalah critical setelah deploy:

### Vercel
```bash
# Rollback ke deployment sebelumnya via dashboard
# atau
vercel rollback
```

### VPS
```bash
git revert HEAD
npm install
npx prisma migrate deploy
npm run build
pm2 restart pantaukota
```

---

## 📞 Support Contacts

**Technical Issues:**
- Check `MAINTENANCE.md` untuk troubleshooting
- Review `AI.md` untuk coding patterns
- Check `PRE-PRODUCTION-AUDIT.md` untuk detail audit

**Database Issues:**
- Backup database sebelum migrasi
- Test migrasi di staging dulu
- Simpan connection string backup

---

**Good luck with the launch! 🚀**

