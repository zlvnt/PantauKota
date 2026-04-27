'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import {
  Map,
  ClipboardList,
  Bell,
  LogOut,
  User,
  ChevronDown,
} from 'lucide-react';
import { useState } from 'react';
import NotificationBell from '@/components/NotificationBell';

// Daftar navigasi warga
const navLinks = [
  { href: '/peta',    label: 'Peta Laporan', icon: Map },
  { href: '/riwayat', label: 'Riwayat Saya', icon: ClipboardList },
];

export default function WargaNavbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <header className="h-16 fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest/90 backdrop-blur-md border-b border-[rgba(169,180,185,0.15)] shadow-ambient">
      <div className="h-full max-w-screen-2xl mx-auto px-4 flex items-center justify-between">

        {/* Logo / Brand */}
        <Link href="/peta" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Map className="w-4 h-4 text-white" strokeWidth={2} />
          </div>
          <span className="font-display font-semibold text-on-surface text-base tracking-tight">
            PantauKota
          </span>
        </Link>

        {/* Navigasi Tengah */}
        <nav className="hidden sm:flex items-center gap-1">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-[#677177] hover:bg-surface-container-low hover:text-on-surface'
                }`}
              >
                <Icon className="w-4 h-4" strokeWidth={isActive ? 2 : 1.5} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Kanan: Notifikasi + User Menu */}
        <div className="flex items-center gap-2">
          {/* Notifikasi — menggunakan komponen yang sudah ada dari tim */}
          <NotificationBell />

          {/* User dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface-container-low transition-colors text-[#677177] hover:text-on-surface"
            >
              <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" strokeWidth={1.5} />
              </div>
              <span className="hidden sm:block text-sm font-medium text-on-surface max-w-[120px] truncate">
                {session?.user?.name ?? 'Warga'}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`}
                strokeWidth={2}
              />
            </button>

            {/* Dropdown menu */}
            {isUserMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-surface-container-lowest rounded-xl shadow-ambient border border-[rgba(169,180,185,0.15)] overflow-hidden z-50">
                <div className="px-3 py-2.5 border-b border-[rgba(169,180,185,0.12)]">
                  <p className="text-xs text-[#677177]">Masuk sebagai</p>
                  <p className="text-sm font-semibold text-on-surface truncate">
                    {session?.user?.name}
                  </p>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-error hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" strokeWidth={1.5} />
                  Keluar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
