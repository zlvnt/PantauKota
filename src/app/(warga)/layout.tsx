import { getCurrentSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import WargaNavbar from '@/components/layout/WargaNavbar';

// Layout untuk semua halaman warga: proteksi + navbar
export default async function WargaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentSession();

  // Server-side guard: belum login → ke halaman login
  if (!session) {
    redirect('/login');
  }
  // Catatan: Admin diizinkan mengakses halaman warga (misal /peta)
  // Pembatasan admin-only sudah ditangani di middleware & layout (admin)

  return (
    <div className="min-h-screen bg-surface">
      <WargaNavbar />
      {/* Konten halaman */}
      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  );
}
