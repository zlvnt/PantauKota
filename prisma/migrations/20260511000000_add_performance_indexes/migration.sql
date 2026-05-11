-- CreateIndex
CREATE INDEX "Laporan_status_selesaiAt_idx" ON "Laporan"("status", "selesaiAt");

-- CreateIndex
CREATE INDEX "Laporan_kategoriId_status_idx" ON "Laporan"("kategoriId", "status");

-- CreateIndex
CREATE INDEX "Laporan_userId_status_idx" ON "Laporan"("userId", "status");

-- CreateIndex
CREATE INDEX "Laporan_latitude_longitude_idx" ON "Laporan"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "Laporan_createdAt_idx" ON "Laporan"("createdAt");

-- CreateIndex
CREATE INDEX "Notifikasi_userId_dibaca_idx" ON "Notifikasi"("userId", "dibaca");

-- CreateIndex
CREATE INDEX "Notifikasi_createdAt_idx" ON "Notifikasi"("createdAt");
