import { prisma } from '@/lib/prisma';

async function getAdminRecipients(excludeUserId?: string) {
  return prisma.user.findMany({
    where: {
      role: 'ADMIN',
      isActive: true,
      ...(excludeUserId ? { id: { not: excludeUserId } } : {}),
    },
    select: { id: true },
  });
}

export async function kirimNotifikasi({
  userId,
  judul,
  pesan,
  laporanId,
}: {
  userId: string;
  judul: string;
  pesan: string;
  laporanId?: string;
}) {
  return prisma.notifikasi.create({
    data: { userId, judul, pesan, laporanId },
  });
}

export async function kirimNotifikasiAdmin({
  judul,
  pesan,
  laporanId,
  excludeUserId,
}: {
  judul: string;
  pesan: string;
  laporanId?: string;
  excludeUserId?: string;
}) {
  const admins = await getAdminRecipients(excludeUserId);
  if (admins.length === 0) return { count: 0 };

  return prisma.notifikasi.createMany({
    data: admins.map((admin) => ({
      userId: admin.id,
      judul,
      pesan,
      laporanId,
    })),
  });
}

export async function kirimNotifikasiDaruratAdmin({
  laporanId,
  judulLaporan,
  pesan,
  excludeUserId,
}: {
  laporanId: string;
  judulLaporan: string;
  pesan: string;
  excludeUserId?: string;
}) {
  const judul = 'Laporan darurat perlu ditinjau';
  const admins = await getAdminRecipients(excludeUserId);
  if (admins.length === 0) return { count: 0 };

  const existing = await prisma.notifikasi.findMany({
    where: {
      laporanId,
      judul,
      userId: { in: admins.map((admin) => admin.id) },
    },
    select: { userId: true },
  });
  const notifiedAdminIds = new Set(existing.map((item) => item.userId));
  const recipients = admins.filter((admin) => !notifiedAdminIds.has(admin.id));

  if (recipients.length === 0) return { count: 0 };

  return prisma.notifikasi.createMany({
    data: recipients.map((admin) => ({
      userId: admin.id,
      judul,
      pesan: `${pesan} "${judulLaporan}".`,
      laporanId,
    })),
  });
}
