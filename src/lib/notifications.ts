import { prisma } from '@/lib/prisma';

// In-memory map: userId -> SSE response controller
const sseClients = new Map<string, ReadableStreamDefaultController>();

export function registerSSEClient(userId: string, controller: ReadableStreamDefaultController) {
  sseClients.set(userId, controller);
}

export function unregisterSSEClient(userId: string) {
  sseClients.delete(userId);
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
  const notifikasi = await prisma.notifikasi.create({
    data: { userId, judul, pesan, laporanId },
  });

  // Push real-time ke client jika sedang online
  const controller = sseClients.get(userId);
  if (controller) {
    try {
      const data = `data: ${JSON.stringify(notifikasi)}\n\n`;
      controller.enqueue(new TextEncoder().encode(data));
    } catch {
      sseClients.delete(userId);
    }
  }

  return notifikasi;
}
