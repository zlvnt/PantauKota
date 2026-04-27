import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminSidebar from '@/components/layout/AdminSidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) redirect('/login');
  if (session.user.role !== 'ADMIN') redirect('/peta');

  return (
    <div className="flex min-h-screen bg-surface">
      <AdminSidebar adminName={session.user.name ?? 'Admin'} />
      <main className="flex-1 ml-64 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
