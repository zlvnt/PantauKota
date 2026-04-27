import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import WargaNavbar from '@/components/layout/WargaNavbar';

// Layout untuk semua halaman warga: proteksi + navbar
export default async function WargaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Server-side guard: belum login → ke halaman login
  if (!session) {
    redirect('/login');
  }
  // Catatan: Admin diizinkan mengakses halaman warga (misal /peta)
  // Pembatasan admin-only sudah ditangani di middleware & layout (admin)

  return (
    <div className="min-h-screen bg-surface">
      <WargaNavbar />
      {/* Konten halaman dimulai setelah navbar (pt-16 = h-16) */}
      <main className="pt-16">
        {children}
      </main>
    </div>
  );
}
