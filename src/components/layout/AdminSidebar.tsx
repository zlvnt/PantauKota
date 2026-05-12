'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { signOut } from '@/hooks/useAuthSession';
import {
  LayoutDashboard,
  FileText,
  Tag,
  Map,
  LogOut,
  UserCircle2,
  ChevronLeft,
  ChevronRight,
  Settings,
  Users,
} from 'lucide-react';

const navLinks = [
  { href: '/dashboard',        label: 'Dashboard',        icon: LayoutDashboard },
  { href: '/dashboard/peta',   label: 'Peta Laporan',     icon: Map },
  { href: '/kelola-laporan',   label: 'Kelola Laporan',   icon: FileText },
  { href: '/kelola-kategori',  label: 'Kelola Kategori',  icon: Tag },
  { href: '/kelola-user',      label: 'Kelola User',      icon: Users },
];

interface AdminSidebarProps {
  adminName: string;
  isOpen?: boolean;
  onToggle?: () => void;
  isLocked?: boolean;
}

export default function AdminSidebar({ adminName, isOpen = true, onToggle, isLocked = false }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* ── DESKTOP: Floating Sidebar ── */}
      <aside 
        className={`hidden sm:flex fixed left-4 top-4 bottom-4 bg-surface-container-lowest rounded-[1.5rem] shadow-[0_8px_30px_rgba(42,52,57,0.12)] flex-col z-40 overflow-hidden transition-all duration-300 ${
          isOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Brand & Toggle */}
        <div className={`py-6 pb-2 shrink-0 flex ${isOpen ? 'flex-row items-center justify-between px-5' : 'flex-col items-center justify-center gap-4 px-2'}`}>
          <div className={`flex items-center ${isOpen ? 'gap-3' : 'justify-center'}`}>
            <Image 
              src="/images/LogoPantauKota.png" 
              alt="Logo PantauKota" 
              width={40} 
              height={40} 
              className="w-10 h-10 object-contain shrink-0 drop-shadow-sm"
            />
            <div className={`overflow-hidden transition-all duration-300 whitespace-nowrap ${isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 hidden'}`}>
              <p className="font-display font-bold text-on-surface text-base leading-none">PantauKota</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#677177] mt-1">Admin Panel</p>
            </div>
          </div>

          {!isLocked && (
            <button
              onClick={onToggle}
              className="flex items-center justify-center w-8 h-8 rounded-lg text-[#677177] hover:bg-surface-container-low hover:text-on-surface transition-colors shrink-0"
              title={isOpen ? 'Tutup Sidebar' : 'Buka Sidebar'}
            >
              {isOpen ? (
                <ChevronLeft className="w-5 h-5" strokeWidth={2} />
              ) : (
                <ChevronRight className="w-5 h-5" strokeWidth={2} />
              )}
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const isActive = href === '/dashboard' 
              ? pathname === '/dashboard' 
              : pathname === href || pathname.startsWith(href + '/');

            return (
              <Link
                key={href}
                href={href}
                title={!isOpen ? label : undefined}
                className={`flex items-center px-3 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isOpen ? 'gap-3' : 'justify-center'
                } ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-[#677177] hover:bg-surface-container-low hover:text-on-surface'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" strokeWidth={isActive ? 2 : 1.5} />
                <span className={`overflow-hidden transition-all duration-300 whitespace-nowrap ${isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 hidden'}`}>
                  {label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* User info + Toggle + Logout */}
        <div className="bg-surface-container-low/50 mt-auto flex flex-col shrink-0">
          
          {/* User Profile */}
          <Link
            href="/dashboard/profil"
            className={`py-4 px-4 flex ${isOpen ? 'flex-row items-center justify-between' : 'flex-col items-center justify-center gap-2'} hover:bg-surface-container-low/50 transition-colors rounded-xl group`}
          >
            <div className={`flex items-center ${isOpen ? 'gap-3' : 'justify-center'}`}>
              <div className="w-10 h-10 rounded-full bg-surface-container-lowest shadow-sm flex items-center justify-center shrink-0 border border-[rgba(169,180,185,0.2)] group-hover:border-primary/30 transition-colors">
                <UserCircle2 className="w-5 h-5 text-primary" strokeWidth={1.5} />
              </div>
              <div className={`min-w-0 overflow-hidden transition-all duration-300 whitespace-nowrap ${isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
                <p className="text-sm font-bold text-on-surface truncate group-hover:text-primary transition-colors">{adminName}</p>
                <p className="text-[10px] font-bold text-[#677177] uppercase tracking-wider mt-0.5">Administrator</p>
              </div>
            </div>
            
            {isOpen && (
              <div className="p-2 rounded-lg text-[#677177] group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                <Settings className="w-4 h-4" strokeWidth={1.5} />
              </div>
            )}
          </Link>

          <div className="px-4 pb-4">
            {/* Logout Button */}
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              title={!isOpen ? 'Keluar' : undefined}
              className={`w-full flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-bold text-error bg-error/10 hover:bg-error/20 transition-colors ${
                isOpen ? 'gap-2' : ''
              }`}
            >
              <LogOut className="w-4 h-4 shrink-0" strokeWidth={2} />
              <span className={`overflow-hidden transition-all duration-300 whitespace-nowrap ${isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 hidden'}`}>
                Keluar
              </span>
            </button>
          </div>
        </div>
      </aside>

      {/* ── MOBILE: Floating Bottom Nav ── */}
      <nav className="sm:hidden fixed bottom-4 left-4 right-4 h-16 bg-surface-container-lowest rounded-full shadow-[0_8px_30px_rgba(42,52,57,0.12)] border border-[rgba(169,180,185,0.15)] flex items-center justify-around px-2 z-50">
        {navLinks.map(({ href, label, icon: Icon }) => {
          const isActive = href === '/dashboard' 
            ? pathname === '/dashboard' 
            : pathname === href || pathname.startsWith(href + '/');

          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center w-14 h-12 rounded-xl transition-colors ${
                isActive
                  ? 'text-primary'
                  : 'text-[#677177] hover:bg-surface-container-low hover:text-on-surface'
              }`}
            >
              <div className={`p-1.5 rounded-lg ${isActive ? 'bg-primary/10' : ''}`}>
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2 : 1.5} />
              </div>
              <span className="text-[9px] font-bold mt-0.5 max-w-full truncate px-1">
                {label.split(' ')[0]}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
