'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from '@/hooks/useAuthSession';
import {
  LayoutDashboard,
  Map,
  LogOut,
  User,
  ChevronDown,
  Settings,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import NotificationBell from '@/components/NotificationBell';

// Daftar navigasi warga
const navLinks = [
  { href: '/beranda', label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/peta',    label: 'Peta Laporan', icon: Map },
];

export default function WargaNavbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  // Sembunyikan navbar di halaman peta (karena peta menggunakan floating controls ala Google Maps)
  if (pathname === '/peta') {
    return null;
  }

  return (
    <header className="fixed top-4 left-4 right-4 sm:top-6 sm:left-6 sm:right-6 z-50 pointer-events-none flex justify-center">
      <div className="w-full max-w-screen-2xl flex items-center justify-between gap-2">
        
        {/* ── Kapsul Kiri: Logo & Navigasi ── */}
        <div className="h-14 px-3 sm:px-4 rounded-full bg-surface-container-lowest shadow-[0_8px_30px_rgba(42,52,57,0.12)] border border-[rgba(169,180,185,0.15)] flex items-center gap-3 sm:gap-5 pointer-events-auto shrink-0">
          
          {/* Logo / Brand */}
          <Link href="/beranda" className="flex items-center gap-2 group shrink-0">
            <Image 
              src="/images/LogoPantauKota.png" 
              alt="Logo PantauKota" 
              width={32} 
              height={32} 
              className="w-8 h-8 object-contain"
            />
            <span className="hidden sm:block font-display font-semibold text-on-surface text-base tracking-tight">
              PantauKota
            </span>
          </Link>

          {/* Pemisah Vertikal */}
          <div className="w-px h-6 bg-[rgba(169,180,185,0.2)]" />

          {/* Navigasi Utama */}
          <nav className="flex items-center gap-1 sm:gap-1.5">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href || pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-[#677177] hover:bg-surface-container-low hover:text-on-surface'
                  }`}
                >
                  <Icon className="w-4 h-4" strokeWidth={isActive ? 2 : 1.5} />
                  {/* Teks hanya muncul jika aktif ATAU di desktop */}
                  <span className={`${isActive ? 'block' : 'hidden sm:block'}`}>
                    {label.split(' ')[0]}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* ── Kapsul Kanan: Notifikasi & Profil ── */}
        <div className="h-14 px-2 sm:px-2.5 rounded-full bg-surface-container-lowest shadow-[0_8px_30px_rgba(42,52,57,0.12)] border border-[rgba(169,180,185,0.15)] flex items-center gap-1 pointer-events-auto shrink-0 relative" ref={userMenuRef}>
          
          <NotificationBell />

          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 pl-1 pr-2 py-1.5 rounded-full hover:bg-surface-container-low transition-colors text-[#677177] hover:text-on-surface ml-1"
          >
            <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-primary" strokeWidth={1.5} />
            </div>
            <span className="hidden sm:block text-sm font-semibold text-on-surface max-w-[100px] truncate">
              {session?.user?.name ?? 'Warga'}
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform hidden sm:block ${isUserMenuOpen ? 'rotate-180' : ''}`}
              strokeWidth={2}
            />
          </button>

          {/* Dropdown menu */}
          {isUserMenuOpen && (
            <div className="absolute right-0 top-[calc(100%+8px)] w-48 bg-surface-container-lowest rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-[rgba(169,180,185,0.15)] overflow-hidden z-[999] animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-3 border-b border-[rgba(169,180,185,0.12)] bg-surface-container-lowest/50">
                <p className="text-[11px] uppercase tracking-wider font-semibold text-[#8a969c] mb-0.5">Masuk sebagai</p>
                <p className="text-sm font-semibold text-on-surface truncate">
                  {session?.user?.name}
                </p>
              </div>
              <div className="p-1.5">
                <Link
                  href="/profil"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-on-surface hover:bg-surface-container-low hover:text-on-surface transition-colors"
                >
                  <Settings className="w-4 h-4" strokeWidth={1.5} />
                  Pengaturan Profil
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-error hover:bg-error/10 hover:text-error transition-colors mt-1"
                >
                  <LogOut className="w-4 h-4" strokeWidth={1.5} />
                  Keluar
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
