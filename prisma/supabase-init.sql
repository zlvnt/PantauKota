-- PantauKota Supabase init fallback.
-- Use this in Supabase SQL Editor when Prisma migrate cannot reach the
-- Session Pooler or Direct Connection from the current network.

DO $$ BEGIN
  CREATE TYPE "Role" AS ENUM ('WARGA', 'ADMIN');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "Status" AS ENUM ('MENUNGGU', 'DIPROSES', 'SELESAI');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "role" "Role" NOT NULL DEFAULT 'WARGA',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Kategori" (
  "id" TEXT NOT NULL,
  "nama" TEXT NOT NULL,
  "icon" TEXT,
  "warna" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Kategori_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Laporan" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "judul" TEXT NOT NULL,
  "deskripsi" TEXT NOT NULL,
  "kategoriId" TEXT NOT NULL,
  "foto" TEXT[],
  "latitude" DOUBLE PRECISION NOT NULL,
  "longitude" DOUBLE PRECISION NOT NULL,
  "alamat" TEXT,
  "status" "Status" NOT NULL DEFAULT 'MENUNGGU',
  "voteCount" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "selesaiAt" TIMESTAMP(3),
  "catatanAdmin" TEXT,
  "fotoPenyelesaian" TEXT,
  "prioritas" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "Laporan_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Vote" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "laporanId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Vote_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Komentar" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "laporanId" TEXT NOT NULL,
  "isi" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Komentar_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Notifikasi" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "judul" TEXT NOT NULL,
  "pesan" TEXT NOT NULL,
  "laporanId" TEXT,
  "dibaca" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Notifikasi_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Laporan" ADD COLUMN IF NOT EXISTS "prioritas" BOOLEAN NOT NULL DEFAULT false;

CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "Kategori_nama_key" ON "Kategori"("nama");
CREATE UNIQUE INDEX IF NOT EXISTS "Vote_userId_laporanId_key" ON "Vote"("userId", "laporanId");

CREATE INDEX IF NOT EXISTS "Laporan_status_selesaiAt_idx" ON "Laporan"("status", "selesaiAt");
CREATE INDEX IF NOT EXISTS "Laporan_kategoriId_status_idx" ON "Laporan"("kategoriId", "status");
CREATE INDEX IF NOT EXISTS "Laporan_userId_status_idx" ON "Laporan"("userId", "status");
CREATE INDEX IF NOT EXISTS "Laporan_latitude_longitude_idx" ON "Laporan"("latitude", "longitude");
CREATE INDEX IF NOT EXISTS "Laporan_createdAt_idx" ON "Laporan"("createdAt");
CREATE INDEX IF NOT EXISTS "Notifikasi_userId_dibaca_idx" ON "Notifikasi"("userId", "dibaca");
CREATE INDEX IF NOT EXISTS "Notifikasi_createdAt_idx" ON "Notifikasi"("createdAt");

DO $$ BEGIN
  ALTER TABLE "Laporan" ADD CONSTRAINT "Laporan_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "Laporan" ADD CONSTRAINT "Laporan_kategoriId_fkey"
    FOREIGN KEY ("kategoriId") REFERENCES "Kategori"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "Vote" ADD CONSTRAINT "Vote_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "Vote" ADD CONSTRAINT "Vote_laporanId_fkey"
    FOREIGN KEY ("laporanId") REFERENCES "Laporan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "Komentar" ADD CONSTRAINT "Komentar_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "Komentar" ADD CONSTRAINT "Komentar_laporanId_fkey"
    FOREIGN KEY ("laporanId") REFERENCES "Laporan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "Notifikasi" ADD CONSTRAINT "Notifikasi_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE "Notifikasi";
EXCEPTION
  WHEN duplicate_object THEN null;
  WHEN undefined_object THEN null;
END $$;
