import Image from "next/image";
import type { RefObject } from "react";

export default function HeroSection({
  textRef,
}: {
  textRef: RefObject<HTMLDivElement>;
}) {
  return (
    <section className="relative pt-40 pb-20 lg:pt-48 lg:pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden min-h-screen flex items-center justify-center text-center">
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1555899434-94d1368aa7af?auto=format&fit=crop&q=80&w=1920"
          alt="Jakarta Skyline"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-surface to-transparent" />
      </div>

      <div
        ref={textRef}
        className="max-w-4xl mx-auto w-full relative z-10 flex flex-col items-center"
      >
        <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.1] tracking-tight mb-8">
          Suara Anda Membangun <br />
          <span className="text-[#a7c4c4] relative inline-block mt-2">
            Kota Lebih Baik
            <svg
              className="absolute -bottom-3 left-0 w-full h-4 text-tertiary/40"
              viewBox="0 0 100 10"
              preserveAspectRatio="none"
            >
              <path
                d="M0,5 Q50,10 100,5"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
              />
            </svg>
          </span>
        </h1>
        <p className="text-xl sm:text-2xl text-white/80 max-w-3xl mx-auto leading-relaxed mb-12">
          Laporkan masalah infrastruktur, lingkungan, dan fasilitas umum di
          sekitar Anda. Pantau progres perbaikan secara real-time dan
          transparan.
        </p>
      </div>
    </section>
  );
}
