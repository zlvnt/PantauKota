'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  FileText,
  Tag,
  Map,
  LogOut,
  Shield,
} from 'lucide-react';

const navLinks = [
  { href: '/dashboard',        label: 'Dashboard',        icon: LayoutDashboard },
  { href: '/dashboard/peta',   label: 'Peta Laporan',     icon: Map },
  { href: '/kelola-laporan',   label: 'Kelola Laporan',   icon: FileText },
  { href: '/kelola-kategori',  label: 'Kelola Kategori',  icon: Tag },
];

export default function AdminSidebar({ adminName }: { adminName: string }) {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-surface-container-lowest border-r border-[rgba(169,180,185,0.15)] shadow-ambient flex flex-col z-40">
      {/* Brand */}
      <div className="px-6 py-5 border-b border-[rgba(169,180,185,0.12)]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" strokeWidth={2} />
          </div>
          <div>
            <p className="font-display font-semibold text-on-surface text-sm leading-none">PantauKota</p>
            <p className="text-[10px] uppercase tracking-widest text-[#677177] mt-0.5">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navLinks.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-[#677177] hover:bg-surface-container-low hover:text-on-surface'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={isActive ? 2 : 1.5} />
              {label}
            </Link>
          );
        })}

      </nav>

      {/* User info + Logout */}
      <div className="px-3 py-4 border-t border-[rgba(169,180,185,0.12)]">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
            <Shield className="w-4 h-4 text-primary" strokeWidth={1.5} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-on-surface truncate">{adminName}</p>
            <p className="text-[10px] text-[#677177] uppercase tracking-wider">Administrator</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-error hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />
          Keluar
        </button>
      </div>
    </aside>
  );
}
