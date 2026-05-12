import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';

/**
 * Standardized error handler untuk API routes
 * Menangani logging dan response error dengan konsisten
 */
export function handleApiError(error: unknown, context: string) {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  
  // Log error dengan context untuk debugging
  console.error(`[API ${context}]`, {
    error: errorMessage,
    stack: error instanceof Error ? error.stack : undefined,
    timestamp: new Date().toISOString(),
  });

  // Return response dengan detail error hanya di development
  return NextResponse.json(
    {
      error: 'Terjadi kendala pada sistem',
      ...(process.env.NODE_ENV === 'development' && { details: errorMessage }),
    },
    { status: 500 }
  );
}

/**
 * Validasi file upload
 */
export function validateUploadFile(file: File, maxSizeBytes: number, allowedTypes: string[]) {
  const errors: string[] = [];

  if (!allowedTypes.includes(file.type)) {
    errors.push(`Tipe file tidak diizinkan. Hanya ${allowedTypes.join(', ')}`);
  }

  if (file.size > maxSizeBytes) {
    const maxSizeMB = (maxSizeBytes / (1024 * 1024)).toFixed(1);
    errors.push(`Ukuran file terlalu besar. Maksimal ${maxSizeMB}MB`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Build where clause untuk query laporan dengan filter
 */
export function buildLaporanWhereClause(filters: {
  status?: string;
  kategoriId?: string;
  userId?: string;
  search?: string;
  adminView?: boolean;
}): Prisma.LaporanWhereInput {
  const { status, kategoriId, userId, search, adminView } = filters;
  
  const conditions: Prisma.LaporanWhereInput[] = [];

  // Filter status
  if (status) {
    conditions.push({ status: status as 'MENUNGGU' | 'DIPROSES' | 'SELESAI' });
  }

  // Filter kategori
  if (kategoriId) {
    conditions.push({ kategoriId });
  }

  // Filter user (untuk laporan-saya)
  if (userId) {
    conditions.push({ userId });
  }

  // Filter search
  if (search) {
    const searchConditions = adminView
      ? [
          { judul: { contains: search, mode: 'insensitive' as const } },
          { deskripsi: { contains: search, mode: 'insensitive' as const } },
          { alamat: { contains: search, mode: 'insensitive' as const } },
          { user: { name: { contains: search, mode: 'insensitive' as const } } },
        ]
      : [
          { judul: { contains: search, mode: 'insensitive' as const } },
          { deskripsi: { contains: search, mode: 'insensitive' as const } },
          { alamat: { contains: search, mode: 'insensitive' as const } },
        ];

    conditions.push({ OR: searchConditions });
  }

  // Auto-hide laporan SELESAI > 24 jam
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  conditions.push({
    OR: [
      { status: { not: 'SELESAI' } },
      {
        AND: [
          { status: 'SELESAI' },
          { selesaiAt: { gte: twentyFourHoursAgo } },
        ],
      },
    ],
  });

  return conditions.length > 0 ? { AND: conditions } : {};
}
