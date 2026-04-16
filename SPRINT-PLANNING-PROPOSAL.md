# Sprint Planning - LaporLingkungan
*Untuk Bab 5 Proposal*

---

## Metode Pengembangan

**Framework:** Agile Scrum
**Total Sprint:** 3 Sprint
**Sprint Duration:** 2 minggu per sprint
**Total Timeline:** 6 minggu (1.5 bulan)

---

## Sprint 1: Requirement Gathering, System Design, Environment Setup
**Durasi:** 2 minggu (Minggu ke-1 s/d ke-2)

### Tujuan Sprint:
Memahami kebutuhan sistem, merancang arsitektur aplikasi, dan menyiapkan environment pengembangan yang siap digunakan oleh seluruh tim.

### Aktivitas Utama:

#### A. Requirement Gathering (3 hari)
- Analisis kebutuhan fungsional dan non-fungsional
- Pembuatan user stories untuk fitur warga dan admin
- Penentuan prioritas fitur (Must Have, Should Have, Nice to Have)
- Dokumentasi Product Backlog

#### B. System Design (4 hari)
- **Database Design:**
  - Entity Relationship Diagram (ERD)
  - Desain schema database (User, Laporan, Kategori, Vote, Notifikasi)
  - Definisi relasi antar tabel

- **API Design:**
  - Daftar endpoint API yang dibutuhkan
  - Struktur request dan response
  - Dokumentasi API contract

- **UI/UX Design:**
  - Wireframe halaman utama (landing, dashboard, form laporan, peta)
  - User flow diagram (warga dan admin)
  - Desain komponen UI (button, card, form, etc.)
  - Color scheme dan typography

- **Architecture Design:**
  - Arsitektur sistem (frontend, backend, database, cloud storage)
  - Folder structure Next.js
  - Authentication flow
  - Diagram alur notifikasi real-time (SSE)

#### C. Environment Setup (3 hari)
- Inisialisasi project Next.js dengan App Router
- Setup database PostgreSQL (lokal/cloud)
- Konfigurasi Prisma ORM
- Setup NextAuth.js untuk authentication
- Konfigurasi Git repository dan branch strategy
- Setup environment variables (.env)
- Instalasi dependencies (Tailwind CSS, Leaflet, Recharts, dll)
- Memastikan semua anggota tim dapat menjalankan project di lokal

### Deliverables:
- ✅ Product Backlog terdokumentasi
- ✅ ERD dan Database Schema
- ✅ API Documentation
- ✅ Wireframe dan UI/UX Design
- ✅ Architecture Diagram
- ✅ Project foundation siap (semua anggota bisa run `npm run dev`)

### Scrum Ceremonies:
- Sprint Planning Meeting
- Daily Standup (15 menit/hari)
- Sprint Review (demo wireframe, ERD, API docs)
- Sprint Retrospective

---

## Sprint 2: Core Development, Database Integration, API Implementation
**Durasi:** 2 minggu (Minggu ke-3 s/d ke-4)

### Tujuan Sprint:
Mengimplementasikan seluruh fitur inti aplikasi, dari backend API hingga frontend user interface, sehingga aplikasi dapat digunakan secara end-to-end.

### Aktivitas Utama:

#### A. Backend Development (2 minggu)
- **Database Implementation:**
  - Finalisasi Prisma schema
  - Database migration
  - Seeding data (kategori default, admin user, dummy data)

- **API Implementation:**
  - Authentication API (register, login dengan NextAuth)
  - Laporan API (CRUD laporan dengan filter dan search)
  - Vote API (upvote/unvote sistem)
  - Kategori API (CRUD kategori - admin only)
  - Upload API (upload foto ke Cloudinary)
  - Notifikasi API (create, read, mark as read)
  - Admin API (statistik dashboard, update status laporan)

- **Middleware & Security:**
  - Route protection berdasarkan role (warga/admin)
  - Input validation dan sanitization
  - Error handling

#### B. Frontend Development (2 minggu)
- **UI Component Library:**
  - Basic components (Button, Card, Badge, Modal, Input, Select, Spinner)
  - Layout components (Navbar, Footer, Sidebar)
  - Domain components (LaporanCard, StatusBadge, VoteButton, ImageGallery)
  - Admin components (StatsCard, ChartLaporan, LaporanTable)

- **Pages Implementation:**
  - **Authentication:** Login, Register
  - **Warga Pages:** Dashboard, List Laporan, Buat Laporan, Detail Laporan, Peta Interaktif, Notifikasi
  - **Admin Pages:** Dashboard Analytics, Kelola Laporan, Kelola Kategori

- **Integration:**
  - Integrasi frontend dengan backend API
  - Form handling (React Hook Form + Zod validation)
  - State management
  - Loading states dan error handling

#### C. Map Integration (2 minggu)
- Setup Leaflet.js dan React Leaflet
- Implementasi MapView component (peta dasar)
- LocationPicker untuk form laporan (pilih lokasi di peta)
- Geolocation API (deteksi lokasi user)
- Peta interaktif dengan markers semua laporan
- Marker clustering untuk performa
- Custom marker berdasarkan kategori
- Popup info saat marker diklik
- Filter laporan di peta (kategori, status)

### Deliverables:
- ✅ Database lengkap dengan data seed
- ✅ Semua API endpoint functional dan tested
- ✅ UI Component library lengkap dan reusable
- ✅ Semua halaman implemented dengan integrasi API
- ✅ Peta interaktif fully functional
- ✅ Aplikasi dapat digunakan end-to-end (register → login → buat laporan → vote → admin update status)

### Scrum Ceremonies:
- Sprint Planning Meeting
- Daily Standup (15 menit/hari)
- Mid-Sprint Check (review API completion)
- Sprint Review (live demo aplikasi)
- Sprint Retrospective

---

## Sprint 3: Testing & QA, UI/UX Polish, Deployment
**Durasi:** 2 minggu (Minggu ke-5 s/d ke-6)

### Tujuan Sprint:
Memastikan aplikasi bebas bug, user experience optimal, dan aplikasi ter-deploy ke production sehingga dapat diakses publik.

### Aktivitas Utama:

#### A. Testing & Quality Assurance (5 hari)
- **Functional Testing:**
  - Test user flow lengkap (register → login → buat laporan → vote → logout)
  - Test admin flow (login → dashboard → update status → notifikasi terkirim)
  - Test semua fitur CRUD
  - Test filter, search, pagination
  - Test upload foto dan geolocation
  - Test peta interaktif dan marker

- **Cross-Browser Testing:**
  - Chrome, Firefox, Safari, Edge

- **Responsive Testing:**
  - Mobile (320px - 768px)
  - Tablet (768px - 1024px)
  - Desktop (1024px+)

- **Bug Tracking & Fixing:**
  - Dokumentasi bug di GitHub Issues
  - Prioritas bug (Critical, High, Medium, Low)
  - Bug fixing semua critical dan high priority bugs

#### B. UI/UX Polish (4 hari)
- **UI Improvements:**
  - Konsistensi spacing, padding, typography
  - Refinement color scheme
  - Button states (hover, active, disabled, loading)
  - Loading indicators untuk async operations
  - Empty states (no data, no search results)

- **UX Enhancements:**
  - Toast notifications untuk feedback (success/error)
  - Confirmation dialog untuk destructive actions
  - Form validation dengan error messages yang jelas
  - Breadcrumbs dan navigation improvements
  - Smooth animations dan transitions

- **Accessibility:**
  - Keyboard navigation support
  - Alt text untuk semua images
  - ARIA labels untuk interactive elements
  - Focus states yang visible
  - Color contrast sesuai WCAG AA

- **Performance Optimization:**
  - Image optimization (next/image)
  - Lazy loading components
  - Code splitting
  - Lighthouse audit (target score >90)

#### C. Advanced Features - Optional (3 hari)
- **PWA Implementation:**
  - Konfigurasi next-pwa
  - PWA manifest.json
  - Generate PWA icons (berbagai ukuran)
  - Service worker untuk offline caching
  - Install prompt
  - Testing installability di mobile

- **Real-time Notification (SSE):**
  - Server-Sent Events endpoint
  - useNotifications hook
  - NotificationBell component dengan badge
  - Live notification saat status berubah

#### D. Deployment (2 hari)
- **Production Database:**
  - Setup PostgreSQL di cloud (Supabase/Railway/Neon)
  - Run migrations di production
  - Seed production data

- **Deploy to Vercel:**
  - Connect repository ke Vercel
  - Configure environment variables
  - Deploy dari branch main
  - Custom domain setup (opsional)

- **Post-Deployment Testing:**
  - Smoke testing di production
  - API health check
  - Database connectivity test
  - File upload test (Cloudinary)
  - Performance monitoring

- **Documentation:**
  - README.md (project description, installation, tech stack, team)
  - API documentation (Postman collection/Swagger - opsional)
  - User guide (opsional)

### Deliverables:
- ✅ Aplikasi bebas bug (minimal critical & high bugs fixed)
- ✅ UI/UX polished, accessible, dan responsive
- ✅ PWA support (opsional)
- ✅ Real-time notification functional (opsional)
- ✅ Aplikasi deployed dan accessible via URL
- ✅ Dokumentasi lengkap (README, API docs)

### Scrum Ceremonies:
- Sprint Planning Meeting
- Daily Standup (15 menit/hari)
- Sprint Review (final demo ke stakeholder/dosen)
- Sprint Retrospective (project closure & lessons learned)

---

## Timeline Summary

| Sprint | Focus | Durasi | Minggu | Deliverables Utama |
|--------|-------|--------|--------|-------------------|
| **Sprint 1** | Requirement, Design, Setup | 2 minggu | Minggu 1-2 | Product Backlog, ERD, API Docs, Wireframe, Project Foundation |
| **Sprint 2** | Core Development | 2 minggu | Minggu 3-4 | API lengkap, UI Components, Pages terintegrasi, Map interaktif |
| **Sprint 3** | Testing, Polish, Deploy | 2 minggu | Minggu 5-6 | App production-ready, Deployed, Documented |

**Total Timeline:** 6 minggu (1.5 bulan)

---

## Struktur Tim

### Product Owner
- Analisis kebutuhan bisnis
- Prioritas fitur di Product Backlog
- Konfirmasi Acceptance Criteria
- Sprint Review presentation

### Scrum Master
- Fasilitasi Scrum ceremonies
- Remove blocker
- Monitor sprint progress
- Koordinasi tim

### Developer Team
- **Backend Developer:** API, Database, Auth, Integration
- **Frontend Developer:** UI Components, Pages, Styling
- **Fullstack Developer:** End-to-end feature implementation
- **Specialist:** Map integration, PWA, DevOps

---

## Scrum Ceremonies (Setiap Sprint)

### 1. Sprint Planning (Awal Sprint)
- Durasi: 2-3 jam
- Review Product Backlog
- Pilih Sprint Backlog items
- Breakdown tasks
- Estimasi effort
- Commitment

### 2. Daily Standup (Setiap Hari)
- Durasi: 15 menit
- Format:
  - Kemarin ngapain?
  - Hari ini mau ngapain?
  - Ada blocker?

### 3. Sprint Review (Akhir Sprint)
- Durasi: 1-2 jam
- Demo deliverables ke stakeholder
- Gather feedback
- Update Product Backlog jika perlu

### 4. Sprint Retrospective (Akhir Sprint)
- Durasi: 1 jam
- Reflection:
  - What went well?
  - What didn't go well?
  - What can we improve?
- Action items untuk sprint berikutnya

---

## Risk & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Anggota tim kurang familiar dengan tech stack | High | Sprint 1: Learning session & pair programming |
| API development delay frontend | High | Frontend pakai mock data sambil tunggu API |
| Cloudinary free tier limit | Medium | Resize image before upload, atau pakai alternative storage |
| Database schema changes mid-development | Medium | Proper design di Sprint 1, minimal breaking changes |
| Deployment issue | Medium | Deploy early & often, test di staging environment |

---

## Success Metrics

Sprint dianggap sukses jika:
- ✅ Semua Sprint Backlog items selesai (Definition of Done terpenuhi)
- ✅ Deliverables di-approve oleh Product Owner di Sprint Review
- ✅ No critical bugs di production
- ✅ Team velocity stabil atau meningkat
- ✅ Stakeholder satisfaction tinggi

---

**Catatan:**
Dokumen ini adalah rencana sprint untuk Bab 5 Proposal. Detail implementasi PBI (Product Backlog Item) akan didefinisikan lebih lanjut saat Sprint Planning Meeting masing-masing sprint.
