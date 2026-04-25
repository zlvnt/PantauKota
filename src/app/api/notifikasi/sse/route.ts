import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { registerSSEClient, unregisterSSEClient } from '@/lib/notifications';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  const userId = session.user.id;

  const stream = new ReadableStream({
    start(controller) {
      registerSSEClient(userId, controller);

      // Kirim ping awal agar koneksi tidak langsung ditutup
      controller.enqueue(new TextEncoder().encode(': ping\n\n'));
    },
    cancel() {
      unregisterSSEClient(userId);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
