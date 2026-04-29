import { prisma } from '@/lib/prisma';

// Simpan di globalThis agar tidak di-reset saat Next.js HMR (hot reload).
// Tanpa ini, Map akan dikosongkan setiap kali ada perubahan kode di development,
// menyebabkan SSE push tidak bekerja meski koneksi masih aktif.
declare global {
  // eslint-disable-next-line no-var
  var sseClients: Map<string, ReadableStreamDefaultController> | undefined;
}

const sseClients: Map<string, ReadableStreamDefaultController> =
  globalThis.sseClients ?? (globalThis.sseClients = new Map());

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
