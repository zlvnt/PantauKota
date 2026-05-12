'use client';

import Image from 'next/image';
import Link from 'next/link';
import { LogOut, UserCircle2, Settings } from 'lucide-react';
import { signOut } from '@/hooks/useAuthSession';
import { useState, useRef, useEffect } from 'react';
import NotificationBell from '@/components/NotificationBell';

export default function AdminMobileHeader({ adminName }: { adminName: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="sm:hidden px-4 mb-4 flex justify-between items-center z-40 relative">
      {/* Brand */}
      <div className="flex items-center gap-2">
        <Image
          src="/images/LogoPantauKota.png"
          alt="Logo PantauKota"
          width={32}
          height={32}
          className="w-8 h-8 object-contain"
        />
        <span className="font-display font-semibold text-on-surface">PantauKota Admin</span>
      </div>

      {/* Kanan: Bell + Avatar */}
      <div className="flex items-center gap-1">
        {/* Notifikasi bell */}
        <NotificationBell />

        {/* Avatar + Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-10 h-10 rounded-full bg-surface-container-lowest border border-[rgba(169,180,185,0.2)] flex items-center justify-center shadow-sm hover:border-primary/30 transition-colors"
          >
            <UserCircle2 className="w-6 h-6 text-primary" strokeWidth={1.5} />
          </button>

          {isOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-surface-container-lowest rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-[rgba(169,180,185,0.15)] overflow-hidden z-50">
              <Link
                href="/dashboard/profil"
                onClick={() => setIsOpen(false)}
                className="px-4 py-3 bg-surface-container-low/50 hover:bg-surface-container-low transition-colors flex items-center gap-2 border-b border-[rgba(169,180,185,0.12)]"
              >
                <UserCircle2 className="w-5 h-5 text-primary shrink-0" strokeWidth={1.5} />
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-[#677177]">Admin</p>
                  <p className="text-sm font-bold text-on-surface truncate">{adminName}</p>
                </div>
              </Link>
              <div className="p-1.5">
                <Link
                  href="/dashboard/profil"
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-bold text-on-surface hover:bg-surface-container-low hover:text-on-surface transition-colors"
                >
                  <Settings className="w-4 h-4" strokeWidth={2} />
                  Pengaturan Profil
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-bold text-error hover:bg-error/10 hover:text-error transition-colors mt-1"
                >
                  <LogOut className="w-4 h-4" strokeWidth={2} />
                  Keluar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
