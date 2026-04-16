# Pembagian Tugas Tim - LaporLingkungan

Dokumentasi strategi pembagian tugas untuk project kelompok menggunakan **Agile Scrum Framework**.

---

## 📋 Daftar Isi
1. [Metode Pengembangan](#metode-pengembangan)
2. [Struktur Tim & Role](#struktur-tim--role)
3. [Sprint Planning (3 Sprint)](#sprint-planning-3-sprint)
4. [Pembagian Tugas per Anggota](#pembagian-tugas-per-anggota)
5. [Git Workflow](#git-workflow)
6. [Tools & Communication](#tools--communication)
7. [Dependency Management](#dependency-management)

---

## 🚀 Metode Pengembangan

**Framework:** Agile Scrum

**Sprint Duration:** 2 minggu per sprint (bisa disesuaikan)

**Total Sprints:** 3 Sprint

### Sprint Overview:
- **Sprint 1:** Requirement Gathering, System Design, Environment Setup
- **Sprint 2:** Core Development, Database Integration, API Implementation
- **Sprint 3:** Testing & QA, UI/UX Polish, Deployment

---

## 👥 Struktur Tim & Role

### Product Owner (PO)
**Tanggung jawab:**
- Analisis kebutuhan bisnis & user stories
- Prioritas fitur di product backlog
- Konfirmasi acceptance criteria setiap fitur
- Demo fitur ke stakeholder (dosen/client)
- Final decision untuk scope changes

**Deliverables:**
- Product backlog
- User stories dengan acceptance criteria
- Sprint review presentation

---

### Scrum Master (SM)
**Tanggung jawab:**
- Fasilitasi sprint planning, daily standup, sprint review, retrospective
- Remove blocker yang dihadapi tim
- Koordinasi antar developer
- Monitor sprint progress (burndown chart)
- Ensure tim follow Scrum best practices

**Deliverables:**
- Sprint planning document
- Daily standup notes
- Sprint retrospective report
- Burndown chart

---

### Developer Team (3-5 orang)
**Tanggung jawab:**
- Implementasi fitur sesuai sprint backlog
- Code review & pair programming
- Unit testing & integration testing
- Update task status di project board
- Participate di semua Scrum ceremonies

**Role dalam tim:**
- **Backend Developer** - API, Database, Auth
- **Frontend Developer** - UI Components, Pages
- **Fullstack Developer** - Integration, Testing
- **Specialist** - Map, PWA, DevOps

---

## 📅 Sprint Planning (3 Sprint)

### 🎯 Scrum Ceremonies

Setiap sprint akan ada:
1. **Sprint Planning** - Awal sprint, pilih task dari backlog
2. **Daily Standup** - 15 menit setiap hari (what/plan/blocker)
3. **Sprint Review** - Akhir sprint, demo fitur ke PO/stakeholder
4. **Sprint Retrospective** - Reflect: what went well, what to improve

---

### Sprint 1: Requirement Gathering, System Design, Environment Setup
**Duration:** 1-2 minggu
**Goal:** Foundation project siap, semua anggota bisa run di local, design sistem complete.

#### 📋 Sprint Backlog

##### A. Requirement Gathering (PO Lead)
**Estimasi:** 2-3 hari

- [ ] **Buat Product Backlog:**
  - [ ] List semua fitur berdasarkan instruksi (warga + admin)
  - [ ] Buat user stories dengan format: "As a [role], I want [goal], so that [benefit]"
  - [ ] Define acceptance criteria untuk setiap user story

- [ ] **Prioritas Fitur:**
  - [ ] Must have: Auth, Laporan CRUD, Map, Vote
  - [ ] Should have: Notifikasi, Dashboard admin, Analytics
  - [ ] Nice to have: PWA, advanced filters

- [ ] **Stakeholder Meeting:**
  - [ ] Present backlog ke stakeholder (dosen/client)
  - [ ] Konfirmasi scope & prioritas
  - [ ] Dokumentasi requirements di Notion/Google Docs

**Deliverables:** Product backlog documented, user stories with acceptance criteria.

---

##### B. System Design (Developer Team)
**Estimasi:** 3-4 hari

- [ ] **Database Design:**
  - [ ] ER Diagram (User, Laporan, Kategori, Vote, Notifikasi)
  - [ ] Define relationships & constraints
  - [ ] Prisma schema draft

- [ ] **API Design:**
  - [ ] List semua API endpoints needed
  - [ ] Define request/response structure
  - [ ] API contract (TypeScript interfaces)
  - [ ] Dokumentasi API di Postman/Swagger

- [ ] **UI/UX Design:**
  - [ ] Wireframe halaman utama (Figma/Excalidraw)
  - [ ] Flow diagram user journey
  - [ ] Component hierarchy
  - [ ] Color scheme & typography (Tailwind config)

- [ ] **Architecture Design:**
  - [ ] Folder structure decision
  - [ ] State management strategy
  - [ ] Authentication flow diagram
  - [ ] Real-time notification architecture (SSE)

**Deliverables:** ER diagram, API documentation, wireframes, architecture document.

---

##### C. Environment Setup (Developer Team - Dikerjakan bareng)
**Estimasi:** 1-2 hari

- [ ] **Init Project:**
  - [ ] `npx create-next-app@latest` (App Router, TypeScript, Tailwind, ESLint)
  - [ ] Setup folder structure sesuai design
  - [ ] Install dependencies (Prisma, NextAuth, Leaflet, dll)

- [ ] **Database Setup:**
  - [ ] Setup PostgreSQL (local atau cloud: Supabase/Neon)
  - [ ] Init Prisma: `npx prisma init`
  - [ ] Buat initial schema
  - [ ] Run first migration
  - [ ] Test connection

- [ ] **Auth Setup:**
  - [ ] Install NextAuth.js
  - [ ] Basic configuration (credential provider)
  - [ ] Middleware setup untuk protected routes

- [ ] **Git & Collaboration:**
  - [ ] Init Git repository
  - [ ] Setup branch strategy (main, dev, feature branches)
  - [ ] Create `.gitignore` (include `.env.local`)
  - [ ] Create `.env.example` template
  - [ ] Push to GitHub
  - [ ] Invite team members

- [ ] **Dev Environment:**
  - [ ] Semua anggota clone repo
  - [ ] Semua anggota setup `.env.local`
  - [ ] Semua anggota run `npm install`
  - [ ] Semua anggota run `npm run dev` → success

**Deliverables:** Project foundation siap, semua anggota bisa run di local.

---

##### D. Sprint 1 Ceremonies

- [ ] **Sprint Planning Meeting** - Pilih task dari backlog
- [ ] **Daily Standup** - Setiap hari 15 menit
- [ ] **Sprint Review** - Demo hasil ke PO: show database, API docs, wireframes
- [ ] **Sprint Retrospective** - What went well? What to improve?

---

### Sprint 2: Core Development, Database Integration, API Implementation
**Duration:** 2-3 minggu
**Goal:** Semua fitur inti implemented (auth, laporan, vote, map), API fully functional.

#### 📋 Sprint Backlog

Pembagian per developer role:

---

##### Backend Developer - API & Database Integration
**Estimasi:** 2-3 minggu

**Week 1: Auth & Core API**
- [ ] **Finalize Database:**
  - [ ] Complete Prisma schema (semua model + relasi)
  - [ ] Run migrations
  - [ ] Seed data: kategori default, admin user, dummy laporan
  - [ ] Test queries dengan Prisma Studio

- [ ] **API: Authentication**
  - [ ] POST `/api/auth/register` - Register user (hash password dengan bcrypt)
  - [ ] NextAuth credential provider config
  - [ ] Session management (JWT)
  - [ ] Middleware: protect routes berdasarkan role
  - [ ] Test: register → login → get session

- [ ] **API: Laporan CRUD**
  - [ ] GET `/api/laporan` - Get all (with filters: kategori, status, search)
  - [ ] GET `/api/laporan/[id]` - Get single laporan with relations
  - [ ] POST `/api/laporan` - Create laporan (require auth)
  - [ ] PATCH `/api/laporan/[id]` - Update laporan (owner only)
  - [ ] DELETE `/api/laporan/[id]` - Soft delete (owner + admin only)
  - [ ] Test dengan Postman/Thunder Client

**Week 2: Advanced Features**
- [ ] **API: Vote System**
  - [ ] POST `/api/vote` - Toggle vote (vote/unvote)
  - [ ] Auto update voteCount di Laporan
  - [ ] Constraint: 1 user = 1 vote per laporan
  - [ ] Test: vote → count increase, unvote → count decrease

- [ ] **API: Kategori (Admin)**
  - [ ] GET `/api/kategori` - Get all
  - [ ] POST `/api/kategori` - Create (admin only)
  - [ ] PATCH `/api/kategori/[id]` - Update (admin only)
  - [ ] DELETE `/api/kategori/[id]` - Delete (admin only)

- [ ] **API: Upload Foto**
  - [ ] Setup Cloudinary account
  - [ ] POST `/api/upload` - Upload image to Cloudinary
  - [ ] Return public URL
  - [ ] Handle multiple images
  - [ ] Max file size validation

- [ ] **API: Notifikasi**
  - [ ] GET `/api/notifikasi` - Get user's notifications
  - [ ] POST `/api/notifikasi` - Create notification (internal use)
  - [ ] PATCH `/api/notifikasi/[id]` - Mark as read
  - [ ] Helper function: sendNotification(userId, message)

- [ ] **API: Admin Analytics**
  - [ ] GET `/api/admin/stats` - Dashboard stats (total laporan, by status, by kategori)
  - [ ] GET `/api/admin/chart-data` - Data untuk chart (trend per hari/minggu)

- [ ] **API: Update Status (Admin)**
  - [ ] PATCH `/api/admin/laporan/[id]/status` - Update status
  - [ ] Trigger: send notification to laporan owner
  - [ ] Log status change history

**Deliverables:** All API endpoints functional & tested.

---

##### Frontend Developer 1 - UI Component Library
**Estimasi:** 2 minggu

**Week 1: Basic UI Components**
- [ ] **Setup Component Structure:**
  - [ ] Folder: `/src/components/ui/`
  - [ ] Folder: `/src/components/layout/`
  - [ ] Folder: `/src/components/laporan/`
  - [ ] Folder: `/src/components/map/`
  - [ ] Folder: `/src/components/admin/`

- [ ] **Basic UI Components:**
  - [ ] `Button.tsx` - Variants: primary, secondary, danger, ghost
  - [ ] `Card.tsx` - Container with padding & shadow
  - [ ] `Badge.tsx` - Small label component
  - [ ] `Modal.tsx` - Reusable dialog/modal
  - [ ] `Input.tsx` - Text input with label & error message
  - [ ] `Textarea.tsx` - Textarea with label
  - [ ] `Select.tsx` - Dropdown select
  - [ ] `Spinner.tsx` - Loading indicator
  - [ ] Test semua component di test page

- [ ] **Layout Components:**
  - [ ] `Navbar.tsx` - Logo, menu, user dropdown, notification bell
  - [ ] `Footer.tsx` - Copyright, links
  - [ ] `AdminSidebar.tsx` - Sidebar menu untuk admin

**Week 2: Domain Components**
- [ ] **Laporan Components:**
  - [ ] `StatusBadge.tsx` - Badge dengan warna per status
  - [ ] `LaporanCard.tsx` - Card untuk list view
  - [ ] `LaporanForm.tsx` - Form buat/edit laporan (React Hook Form + Zod)
  - [ ] `LaporanDetail.tsx` - Full detail view
  - [ ] `VoteButton.tsx` - Upvote button dengan counter
  - [ ] `ImageGallery.tsx` - Lightbox untuk foto laporan

- [ ] **Admin Components:**
  - [ ] `StatsCard.tsx` - Card untuk statistik
  - [ ] `LaporanTable.tsx` - Table dengan sorting & filtering
  - [ ] `ChartLaporan.tsx` - Bar/Line chart (Recharts)
  - [ ] `UpdateStatusModal.tsx` - Modal update status

**Deliverables:** Component library complete & reusable.

---

##### Frontend Developer 2 - Pages & Integration
**Estimasi:** 2-3 minggu

**Week 1: Auth & Warga Pages**
- [ ] **Auth Pages:**
  - [ ] `/app/(auth)/layout.tsx` - Clean layout
  - [ ] `/app/(auth)/login/page.tsx` - Login form + integration
  - [ ] `/app/(auth)/register/page.tsx` - Register form + integration
  - [ ] Test flow: register → auto login → redirect

- [ ] **Warga Layout:**
  - [ ] `/app/(warga)/layout.tsx` - Include Navbar + Footer
  - [ ] Middleware: redirect ke login jika belum auth

- [ ] **Warga Pages:**
  - [ ] `/app/(warga)/page.tsx` - Dashboard warga (recent laporan)
  - [ ] `/app/(warga)/laporan/page.tsx` - List semua laporan (grid/list view, filter, search)
  - [ ] `/app/(warga)/laporan/buat/page.tsx` - Form buat laporan + upload foto
  - [ ] `/app/(warga)/laporan/[id]/page.tsx` - Detail laporan + vote button
  - [ ] Integration dengan API (fetch, create, vote)

**Week 2: Admin Pages**
- [ ] **Admin Layout:**
  - [ ] `/app/(admin)/layout.tsx` - Include sidebar
  - [ ] Middleware: redirect jika bukan admin

- [ ] **Admin Pages:**
  - [ ] `/app/(admin)/dashboard/page.tsx` - Stats + charts
  - [ ] `/app/(admin)/kelola-laporan/page.tsx` - Table all laporan
  - [ ] `/app/(admin)/kelola-laporan/[id]/page.tsx` - Detail + update status
  - [ ] `/app/(admin)/kelola-kategori/page.tsx` - CRUD kategori
  - [ ] Integration dengan admin API

**Deliverables:** All pages functional dengan API integration.

---

##### Specialist - Map & Geolocation
**Estimasi:** 2 minggu

**Week 1: Map Setup**
- [ ] **Install & Setup Leaflet:**
  - [ ] `npm install leaflet react-leaflet`
  - [ ] Import CSS
  - [ ] Handle dynamic import (client-side only)

- [ ] **Map Components:**
  - [ ] `MapView.tsx` - Basic map with default center
  - [ ] `LocationPicker.tsx` - Click map → get lat/lng + show marker
  - [ ] `useGeolocation.ts` hook - Get user location
  - [ ] Test di form laporan

**Week 2: Interactive Map**
- [ ] **Peta Interaktif Page:**
  - [ ] `/app/(warga)/peta/page.tsx` - Full screen map
  - [ ] Fetch all laporan dari API
  - [ ] Place markers per laporan
  - [ ] Custom marker color per kategori
  - [ ] Click marker → popup with info (foto, judul, status)
  - [ ] Link to detail laporan

- [ ] **Advanced Features:**
  - [ ] `MarkerCluster.tsx` - Cluster markers when zoomed out
  - [ ] Filter by kategori (checkbox)
  - [ ] Filter by status (checkbox)
  - [ ] Real-time update saat filter change

**Deliverables:** Interactive map fully functional.

---

##### D. Sprint 2 Ceremonies

- [ ] **Sprint Planning** - Assign tasks berdasarkan role
- [ ] **Daily Standup** - Update progress & blockers
- [ ] **Mid-Sprint Check** - Review API completion before frontend integration
- [ ] **Sprint Review** - Demo: login, buat laporan, vote, lihat map, admin dashboard
- [ ] **Sprint Retrospective** - Team feedback

---

### Sprint 3: Testing & QA, UI/UX Polish, Deployment
**Duration:** 1-2 minggu
**Goal:** Bug-free production-ready app, deployed & accessible.

#### 📋 Sprint Backlog

---

##### A. Testing & QA (Semua anggota)
**Estimasi:** 4-5 hari

- [ ] **Functional Testing:**
  - [ ] Test user flow: Register → Login → Buat laporan → Upload foto → Submit
  - [ ] Test vote: Vote → check count increase → Unvote → check count decrease
  - [ ] Test filter & search di list laporan
  - [ ] Test map: Click marker → popup → link to detail
  - [ ] Test admin: Login → Dashboard → Update status → Check notification sent
  - [ ] Test kategori CRUD (admin)

- [ ] **Cross-browser Testing:**
  - [ ] Chrome ✓
  - [ ] Firefox ✓
  - [ ] Safari ✓
  - [ ] Edge ✓

- [ ] **Responsive Testing:**
  - [ ] Mobile (320px - 480px)
  - [ ] Tablet (768px - 1024px)
  - [ ] Desktop (1280px+)
  - [ ] Test semua halaman di semua breakpoint

- [ ] **Bug Tracking:**
  - [ ] Buat issue di GitHub untuk setiap bug
  - [ ] Assign ke developer terkait
  - [ ] Prioritas: Critical → High → Medium → Low
  - [ ] Fix semua critical & high bugs

**Deliverables:** Bug list documented, critical bugs fixed.

---

##### B. UI/UX Polish (Frontend Team)
**Estimasi:** 3-4 hari

- [ ] **UI Improvements:**
  - [ ] Consistent spacing & padding
  - [ ] Consistent typography (font size, weight, line height)
  - [ ] Color scheme refinement
  - [ ] Button states: hover, active, disabled
  - [ ] Loading states untuk semua async actions
  - [ ] Empty states (no data, no results)

- [ ] **UX Enhancements:**
  - [ ] Loading spinner saat fetch data
  - [ ] Toast notifications untuk success/error
  - [ ] Confirmation dialog untuk destructive actions (delete)
  - [ ] Form validation dengan error messages
  - [ ] Breadcrumbs untuk navigation
  - [ ] Back button di detail pages

- [ ] **Accessibility:**
  - [ ] Keyboard navigation support
  - [ ] Alt text untuk images
  - [ ] ARIA labels untuk interactive elements
  - [ ] Focus states visible
  - [ ] Color contrast pass WCAG AA

- [ ] **Performance Optimization:**
  - [ ] Image optimization (next/image)
  - [ ] Lazy loading components
  - [ ] Code splitting
  - [ ] Lighthouse score check (target: >90)

**Deliverables:** Polished UI, improved UX, accessible, performant.

---

##### C. Additional Features (Optional - jika ada waktu)
**Estimasi:** 2-3 hari

- [ ] **PWA Setup:**
  - [ ] Install next-pwa
  - [ ] Config `next.config.js`
  - [ ] Create `manifest.json`
  - [ ] Generate PWA icons (72px - 512px)
  - [ ] Test install di Chrome mobile
  - [ ] Test offline mode (cache strategy)

- [ ] **Real-time Notifications (SSE):**
  - [ ] API: `/api/notifikasi/sse` endpoint
  - [ ] Hook: `useNotifications.ts` - connect to SSE
  - [ ] Component: `NotificationBell.tsx` - badge with count
  - [ ] Page: `/app/(warga)/notifikasi/page.tsx` - list all
  - [ ] Test: Admin update status → User get notif real-time

- [ ] **Advanced Features:**
  - [ ] Riwayat laporan user
  - [ ] Export data (admin) - CSV/PDF
  - [ ] Dark mode toggle

**Deliverables:** PWA installable, real-time notifications working (jika implemented).

---

##### D. Deployment (DevOps/Backend Lead)
**Estimasi:** 2-3 hari

- [ ] **Production Database:**
  - [ ] Setup PostgreSQL di cloud (Supabase/Railway/Neon)
  - [ ] Run migrations di production
  - [ ] Seed production data (kategori, admin user)
  - [ ] Backup strategy

- [ ] **Deploy to Vercel:**
  - [ ] Connect GitHub repo
  - [ ] Setup environment variables:
    - DATABASE_URL
    - NEXTAUTH_SECRET
    - NEXTAUTH_URL
    - CLOUDINARY credentials
  - [ ] Deploy from `main` branch
  - [ ] Custom domain setup (optional)

- [ ] **Post-deployment Testing:**
  - [ ] Test all flows di production
  - [ ] Check API responses
  - [ ] Test file upload to Cloudinary
  - [ ] Test database queries
  - [ ] Monitor errors (Sentry optional)

- [ ] **Documentation:**
  - [ ] Update README.md:
    - Project description
    - Tech stack
    - Features list
    - Installation guide
    - Environment variables
    - Team members
  - [ ] API documentation (optional: Swagger/Postman collection)
  - [ ] User guide (optional: how to use the app)

**Deliverables:** App live di production, accessible via URL, documented.

---

##### E. Sprint 3 Ceremonies

- [ ] **Sprint Planning** - Final sprint, focus on quality
- [ ] **Daily Standup** - Quick bug fix coordination
- [ ] **Sprint Review** - Final demo to stakeholder (dosen)
- [ ] **Sprint Retrospective** - Project reflection:
  - What went well across all sprints?
  - What challenges did we face?
  - What did we learn?
  - What would we do differently next time?
- [ ] **Project Closure** - Celebrate! 🎉

---

## 📊 Sprint Summary

| Sprint | Focus | Duration | Key Deliverables |
|--------|-------|----------|------------------|
| **Sprint 1** | Requirement, Design, Setup | 1-2 minggu | Product backlog, ER diagram, API docs, wireframes, project foundation |
| **Sprint 2** | Core Development | 2-3 minggu | All API functional, UI components, all pages with integration, interactive map |
| **Sprint 3** | Testing, Polish, Deploy | 1-2 minggu | Bug-free app, polished UI/UX, PWA (optional), deployed to production |

**Total Timeline:** 4-7 minggu (tergantung tim size & availability)

---

## 👥 Pembagian Tugas per Anggota

### Tim 2 Orang

#### Person 1: Full Backend + DevOps
- Setup project
- Database & Prisma
- Semua API endpoints
- NextAuth config
- Cloudinary setup
- SSE implementation
- PWA config
- Deployment

#### Person 2: Full Frontend
- Semua UI components
- Semua pages (warga + admin)
- Map integration
- Form handling
- Styling & responsive

---

### Tim 3 Orang

#### Person 1: Backend & Auth
- Database & Prisma
- Semua API endpoints
- NextAuth config
- Cloudinary setup
- SSE implementation

#### Person 2: Frontend Warga
- UI components (shared)
- Auth pages
- Warga pages (laporan, peta, dll)
- Integration API

#### Person 3: Frontend Admin & PWA
- Admin components
- Admin pages (dashboard, kelola)
- Map integration
- PWA setup
- Notifications

---

### Tim 4 Orang

#### Person 1: Backend API
- Database schema
- API endpoints (auth, laporan, vote)
- Cloudinary integration
- Error handling

#### Person 2: UI Component Library
- Semua component di `/components/ui/`
- Semua component di `/components/laporan/`
- Semua component di `/components/admin/`
- Storybook (optional)

#### Person 3: Frontend Warga
- Auth pages
- Warga layout
- Warga pages
- Integration components dengan API

#### Person 4: Frontend Admin + Specialist
- Admin layout & pages
- Map integration
- PWA setup
- SSE/Notifications
- Deployment

---

### Tim 5+ Orang

Bagi lebih granular per modul:
- **Person 1**: Database + Auth API
- **Person 2**: Laporan API + Upload
- **Person 3**: UI Component Library
- **Person 4**: Warga Pages
- **Person 5**: Admin Pages
- **Person 6**: Map + PWA + Notifications

---

## 🌿 Git Workflow

### Branch Strategy

```
main (production - protected)
│
└── dev (development - protected)
    │
    ├── feature/auth-api
    ├── feature/laporan-api
    ├── feature/ui-components
    ├── feature/warga-pages
    ├── feature/admin-pages
    ├── feature/map-integration
    └── feature/pwa-setup
```

### Naming Convention

**Branch names:**
- `feature/nama-fitur` - Fitur baru
- `bugfix/nama-bug` - Fix bug
- `hotfix/nama-fix` - Urgent fix di production

**Commit messages:**
```
feat: add login page
fix: resolve vote button not updating
chore: update dependencies
docs: add API documentation
style: format code with prettier
refactor: simplify notification logic
```

### Workflow

1. **Create branch dari `dev`:**
   ```bash
   git checkout dev
   git pull origin dev
   git checkout -b feature/laporan-api
   ```

2. **Develop & commit:**
   ```bash
   git add .
   git commit -m "feat: add create laporan endpoint"
   git push origin feature/laporan-api
   ```

3. **Create Pull Request:**
   - Target: `dev` (bukan `main`)
   - Assign reviewer: min 1 orang
   - Tunggu approval

4. **After PR merged:**
   ```bash
   git checkout dev
   git pull origin dev
   git branch -d feature/laporan-api
   ```

5. **Deploy to production:**
   ```bash
   git checkout main
   git merge dev
   git push origin main
   ```

---

## 🛠️ Tools & Communication

### Project Management Tools

**Pilihan 1: Trello** (Simple)
- Board: "LaporLingkungan"
- Lists: Backlog → To Do → In Progress → Review → Done
- Cards: Tasks dari sprint planning
- Labels: Backend, Frontend, Bug, Enhancement

**Pilihan 2: GitHub Projects** (Integrated)
- Langsung integrate dengan repo
- Auto-move card saat PR merged
- Kanban board view

**Pilihan 3: Notion** (Flexible)
- Database untuk tasks
- Sprint planning board
- Documentation wiki

**Pilihan 4: Jira** (Professional, overkill untuk project kecil)

---

### Daily Standup (15 menit)

**Format:**
1. **Kemarin ngapain?** - Update progress
2. **Hari ini mau ngapain?** - Plan hari ini
3. **Ada blocker?** - Stuck di mana, butuh bantuan?

**Tips:**
- Standup di pagi hari (before start coding)
- Keep it short & focused
- Write di grup chat kalau async

---

### Code Review Checklist

Sebelum approve PR, check:
- [ ] Code runs tanpa error
- [ ] Follows coding standards (ESLint pass)
- [ ] No console.log atau debug code
- [ ] Naming jelas & consistent
- [ ] No duplicate code
- [ ] Handle error cases
- [ ] Responsive (jika UI)
- [ ] TypeScript types correct

---

### Communication Channels

- **Daily updates**: WhatsApp/Telegram group
- **Code review**: GitHub PR comments
- **Urgent blocker**: Voice call
- **Documentation**: Notion/Google Docs
- **Screen share**: Google Meet / Discord

---

## 🔗 Dependency Management

### Masalah Dependency

**Scenario:**
- Frontend butuh API `/api/laporan` tapi backend belum selesai
- UI Component butuh design system tapi belum ada
- Pages butuh component tapi belum dibuat

### Solusi

#### 1. API Contract Agreement

Buat agreement struktur API di awal (sebelum develop):

```typescript
// types/api.ts
export interface LaporanResponse {
  id: string
  judul: string
  deskripsi: string
  kategori: {
    id: string
    nama: string
  }
  foto: string[]
  latitude: number
  longitude: number
  status: 'MENUNGGU' | 'DIPROSES' | 'SELESAI'
  voteCount: number
  createdAt: string
}
```

**Keuntungan:**
- Frontend & Backend develop parallel
- Frontend bisa pakai mock data dulu
- Saat API ready, tinggal ganti fetch URL

---

#### 2. Mock Data & Mock API

Frontend bisa buat mock data sambil tunggu backend:

```typescript
// lib/mock-data.ts
export const mockLaporan: LaporanResponse[] = [
  {
    id: '1',
    judul: 'Jalan berlubang di Jl. Sudirman',
    deskripsi: 'Jalan berlubang besar...',
    kategori: { id: '1', nama: 'Jalan Rusak' },
    foto: ['https://via.placeholder.com/400'],
    latitude: -6.2088,
    longitude: 106.8456,
    status: 'MENUNGGU',
    voteCount: 5,
    createdAt: '2024-01-15T10:00:00Z'
  }
]
```

Atau pakai Mock Service Worker (MSW) untuk intercept fetch.

---

#### 3. Feature Flag

Pakai environment variable untuk toggle fitur:

```typescript
// .env.local
NEXT_PUBLIC_USE_MOCK_API=true
```

```typescript
// lib/api.ts
const BASE_URL = process.env.NEXT_PUBLIC_USE_MOCK_API
  ? '/mock-api'
  : '/api'
```

---

#### 4. Component Storybook

UI Component dev bisa develop & preview tanpa full app:

```bash
npm install -D @storybook/react
```

Buat stories untuk tiap component → test di isolation.

---

#### 5. Sprint Dependencies

Di sprint planning, tandai dependencies:

**Sprint 1:**
- ✅ Person A: API Laporan (no dependency)
- ⏸️ Person C: Laporan Page (**blocked by** API Laporan)

**Solution:**
- Person C pakai mock data dulu
- Atau Person C kerjaan auth page dulu (independent)
- Saat API ready → integration

---

### Dependency Graph Example

```
Setup Project
    ↓
├─→ Database Schema ──→ API Development ──→ Frontend Integration
│                                              ↑
└─→ UI Components ─────────────────────────────┘
    │
    └─→ Map Setup ──→ Map Integration
```

**Critical Path:** Setup → Database → API → Integration
**Parallel:** UI Components & Map bisa parallel dengan API

---

## ✅ Best Practices

### Do's ✅
- Commit sering dengan message jelas
- Pull dari `dev` sebelum start kerjaan baru
- Test di local sebelum push
- Code review dengan constructive feedback
- Komunikasi blocker secepatnya
- Update task status di project board
- Write clean code (readable > clever)

### Don'ts ❌
- Push langsung ke `main` atau `dev`
- Commit code yang error/belum selesai
- Copy-paste code tanpa understand
- Skip testing
- Merge PR sendiri tanpa review
- Diamkan blocker tanpa minta bantuan
- Overwrite orang lain punya code

---

## 📊 Progress Tracking Template

### Weekly Progress Report

```markdown
## Week 1 Progress - [Tanggal]

### Completed ✅
- [x] Setup project Next.js
- [x] Setup Prisma + PostgreSQL
- [x] API: Register & Login

### In Progress 🔄
- [ ] UI Component Library (60%)
- [ ] Auth pages (80%)

### Blocked 🚫
- Map integration (tunggu Leaflet.js issue resolved)

### Next Week Plan
- Complete UI components
- Start laporan pages
- Map integration

### Risks/Issues
- Cloudinary free tier limit (discuss pakai alternative?)
```

---

## 🎓 Learning Resources

Jika ada anggota yang belum familiar:

**Next.js:**
- https://nextjs.org/learn
- https://www.youtube.com/watch?v=ZVnjOPwW4ZA (Web Dev Simplified)

**Prisma:**
- https://www.prisma.io/docs/getting-started
- https://www.youtube.com/watch?v=RebA5J-rlwg (Traversy Media)

**Tailwind CSS:**
- https://tailwindcss.com/docs
- https://www.youtube.com/watch?v=pfaSUYaSgRo (Tailwind Labs)

**Leaflet.js:**
- https://leafletjs.com/examples.html
- https://react-leaflet.js.org/

---

## 📝 Catatan Penting

1. **Jangan takut bertanya** - Better ask than stuck seharian
2. **Dokumentasi itu penting** - Tulis di README cara run project
3. **Testing itu wajib** - Jangan skip, nanti bug di production
4. **Git conflict itu normal** - Learn resolve conflicts properly
5. **Code review bukan kritik pribadi** - It's about code quality
6. **Estimasi waktu selalu lebih lama** - Buffer time untuk unexpected issue
7. **Backup database** - Jangan sampe data hilang
8. **Environment variables jangan di-commit** - Use .env.example

---

**Good luck! 🚀**

Jika ada pertanyaan tentang pembagian tugas atau stuck di mana, diskusikan dengan tim!
