'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import AdminSidebar from './AdminSidebar';
import AdminMobileHeader from './AdminMobileHeader';
import NotificationBell from '@/components/NotificationBell';

interface AdminLayoutClientProps {
  adminName: string;
  children: React.ReactNode;
}

export default function AdminLayoutClient({ adminName, children }: AdminLayoutClientProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);

  // Jika sedang di halaman peta, paksa sidebar tutup dan jangan izinkan dibuka.
  const isPeta = pathname === '/dashboard/peta';

  useEffect(() => {
    if (isPeta) {
      setIsOpen(false);
    }
  }, [isPeta]);

  return (
    <>
      <AdminSidebar
        adminName={adminName}
        isOpen={isOpen}
        onToggle={() => setIsOpen(!isOpen)}
        isLocked={isPeta}
      />

      {/* Notifikasi bell — desktop only, sudut kanan atas */}
      {!isPeta && (
        <div className="hidden sm:flex fixed top-5 right-6 z-50">
          <NotificationBell />
        </div>
      )}

      <main
        className={`flex-1 w-full transition-all duration-300 ${
          isPeta ? 'p-0 h-[100dvh] overflow-hidden' : 'pb-24 sm:pb-8 pt-4 sm:pr-4'
        } ${isOpen ? 'sm:ml-[288px]' : 'sm:ml-[112px]'}`}
      >
        {!isPeta && <AdminMobileHeader adminName={adminName} />}

        <div className={
          isPeta
            ? "h-full w-full"
            : "bg-surface sm:bg-surface-container-lowest sm:rounded-[1.5rem] sm:shadow-[0_8px_30px_rgba(42,52,57,0.04)] sm:min-h-[calc(100vh-32px)] overflow-hidden"
        }>
          {children}
        </div>
      </main>
    </>
  );
}
