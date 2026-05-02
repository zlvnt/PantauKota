// 📁 src/app/(warga)/laporan/buat/page.tsx
// Halaman form buat laporan — menggantikan placeholder

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import LaporanForm from '@/components/laporan/LaporanForm';

export const metadata = {
  title: 'Buat Laporan | Pantau Kota',
  description: 'Laporkan masalah di kotamu',
};

export default async function BuatLaporanPage() {
  const session = await getServerSession(authOptions);

  // Redirect ke login kalau belum autentikasi
  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Buat Laporan</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Laporkan masalah infrastruktur atau fasilitas umum di sekitarmu.
          </p>
        </div>

        {/* Card Form */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <LaporanForm />
        </div>
      </div>
    </div>
  );
}
