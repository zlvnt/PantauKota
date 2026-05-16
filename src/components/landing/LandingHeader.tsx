import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

function HeaderLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="relative hover:text-foreground transition-colors duration-300 group"
    >
      {children}
      <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-primary transition-all duration-300 group-hover:w-full" />
    </Link>
  );
}

export default function LandingHeader() {
  return (
    <header className="absolute top-0 left-0 w-full z-50 px-4 sm:px-6 lg:px-8 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between bg-surface-container-lowest shadow-ambient rounded-2xl px-5 py-2.5">
        <Link href="/" className="flex items-center gap-2 group">
          <Image
            src="/icons/icon-192x192.png"
            alt="PantauKota Logo"
            width={28}
            height={28}
            className="rounded-full transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12"
          />
          <span className="font-display font-bold text-lg tracking-tight text-foreground transition-colors duration-300 group-hover:text-primary">
            PantauKota
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <HeaderLink href="#fitur">Keunggulan</HeaderLink>
          <HeaderLink href="#cara-penggunaan">Cara Penggunaan</HeaderLink>
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-xs font-medium text-foreground hover:text-primary transition-all duration-300 hover:-translate-y-0.5"
          >
            Masuk
          </Link>
          <Link
            href="/register"
            className="hidden sm:inline-flex bg-primary text-white text-xs font-medium px-4 py-2 rounded-xl hover:bg-primary-dim transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:scale-105"
          >
            Daftar
          </Link>
        </div>
      </div>
    </header>
  );
}
