-- AlterTable
ALTER TABLE "Laporan" ADD COLUMN "prioritas" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;
