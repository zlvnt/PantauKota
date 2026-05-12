import { getCurrentSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminLayoutClient from '@/components/layout/AdminLayoutClient';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentSession();

  if (!session) redirect('/login');
  if (session.user.role !== 'ADMIN') redirect('/profil'); // Redirect warga ke profil warga

  return (
    <div className="flex min-h-screen bg-surface overflow-x-hidden">
      <AdminLayoutClient adminName={session.user.name ?? 'Admin'}>
        {children}
      </AdminLayoutClient>
    </div>
  );
}
