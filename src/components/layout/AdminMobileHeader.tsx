'use client';

import Image from 'next/image';
import { LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useState, useRef, useEffect } from 'react';

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

      {/* Avatar + Dropdown */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-10 h-10 rounded-full bg-surface-container-lowest border border-[rgba(169,180,185,0.2)] flex items-center justify-center shadow-sm overflow-hidden"
        >
          <Image
            src="/images/LogoPantauKota.png"
            alt="Admin"
            width={24}
            height={24}
            className="w-6 h-6 object-contain"
          />
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-surface-container-lowest rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-[rgba(169,180,185,0.15)] overflow-hidden z-50">
            <div className="px-4 py-3 bg-surface-container-low/50">
              <p className="text-[10px] uppercase tracking-wider font-bold text-[#677177] mb-0.5">Admin</p>
              <p className="text-sm font-bold text-on-surface truncate">{adminName}</p>
            </div>
            <div className="p-1.5">
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-bold text-error hover:bg-error/10 hover:text-error transition-colors"
              >
                <LogOut className="w-4 h-4" strokeWidth={2} />
                Keluar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
