"use client";

import Image from "next/image";
import Link from "next/link";
import { Activity, ShieldCheck, MapPin, UserPlus, FileText, Wrench } from "lucide-react";
import { CinematicFooter } from "@/components/ui/motion-footer";
import GlobeComponent from "@/components/ui/GlobeComponent";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function Home() {
  const heroTextRef = useRef<HTMLDivElement>(null);
  const keunggulanRef = useRef<HTMLElement>(null);
  const caraPenggunaanRef = useRef<HTMLElement>(null);
  const globeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);

      // Hero animation
      gsap.fromTo(
        heroTextRef.current,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
      );

      // Keunggulan animation
      if (keunggulanRef.current) {
        const cards = keunggulanRef.current.querySelectorAll('.feature-card');
        gsap.fromTo(
          cards,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.2,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: keunggulanRef.current,
              start: "top 80%",
            }
          }
        );
      }

      // Cara Penggunaan animation
      if (caraPenggunaanRef.current) {
        const steps = caraPenggunaanRef.current.querySelectorAll('.step-card');
        gsap.fromTo(
          steps,
          { x: -50, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            stagger: 0.2,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: caraPenggunaanRef.current,
              start: "top 80%",
            }
          }
        );
      }

      // 3D Globe Animation 
      if (globeRef.current && keunggulanRef.current && caraPenggunaanRef.current) {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: keunggulanRef.current,
            start: "top center", // Start appearing at top of Keunggulan
            endTrigger: caraPenggunaanRef.current,
            end: "bottom center", // Ends at bottom of Cara Penggunaan
            scrub: 1, 
          }
        });

        // initial state is set via css (opacity: 0, top: '100vh', left: '-20vw', scale: 0.8)
        // Cross from left to right while going down
        tl.to(globeRef.current, { opacity: 0.8, duration: 0.1 }) // Fades in quickly at the top-left
          .to(globeRef.current, { x: "50vw", y: 400, scale: 1.2, duration: 0.4 }, "<") // Moves to center, zooms in
          .to(globeRef.current, { x: "90vw", y: 1100, scale: 0.8, duration: 0.4 }) // Moves down-right, zooms out
          .to(globeRef.current, { opacity: 0, duration: 0.2 }, "-=0.2"); // Disappears at the end
      }
    }
  }, []);

  return (
    <div className="relative w-full bg-surface min-h-screen font-sans selection:bg-primary/20 overflow-x-hidden">
      <main className="relative z-10 w-full bg-surface text-on-surface border-b border-border shadow-ambient rounded-b-[40px] lg:rounded-b-[60px] flex flex-col min-h-screen overflow-hidden">
        
        {/* Navbar */}
        <header className="absolute top-0 left-0 w-full z-50 px-4 sm:px-6 lg:px-8 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between bg-surface-container-lowest shadow-ambient rounded-2xl border border-border px-5 py-2.5">
            <div className="flex items-center gap-2 group cursor-pointer">
              <Image 
                src="/icons/icon-192x192.png" 
                alt="PantauKota Logo" 
                width={28} 
                height={28} 
                className="rounded-full transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12"
              />
              <span className="font-display font-bold text-lg tracking-tight text-foreground transition-colors duration-300 group-hover:text-primary">PantauKota</span>
            </div>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
              <Link href="#fitur" className="relative hover:text-foreground transition-colors duration-300 group">
                Keunggulan
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link href="#cara-penggunaan" className="relative hover:text-foreground transition-colors duration-300 group">
                Cara Penggunaan
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </nav>
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-xs font-medium text-foreground hover:text-primary transition-all duration-300 hover:-translate-y-0.5">
                Masuk
              </Link>
              <Link href="/register" className="hidden sm:inline-flex bg-primary text-white text-xs font-medium px-4 py-2 rounded-xl hover:bg-primary-dim transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:scale-105">
                Daftar
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Section */}
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
          
          <div ref={heroTextRef} className="max-w-4xl mx-auto w-full relative z-10 flex flex-col items-center">
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.1] tracking-tight mb-8">
              Suara Anda Membangun <br/>
              <span className="text-primary relative inline-block mt-2">
                Kota Lebih Baik
                <svg className="absolute -bottom-3 left-0 w-full h-4 text-tertiary/40" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0,5 Q50,10 100,5" stroke="currentColor" strokeWidth="8" fill="none" />
                </svg>
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-white/80 max-w-3xl mx-auto leading-relaxed mb-12">
              Laporkan masalah infrastruktur, lingkungan, dan fasilitas umum di sekitar Anda. 
              Pantau progres perbaikan secara real-time dan transparan.
            </p>
          </div>
        </section>

        {/* 3D Globe Background Container */}
        <div className="absolute left-0 right-0 top-0 bottom-0 pointer-events-none z-0 overflow-hidden">
          <div 
            ref={globeRef} 
            className="absolute opacity-0" 
            style={{ top: '100vh', left: '-20vw', transform: 'scale(0.8)' }}
          >
            <GlobeComponent />
          </div>
        </div>

        {/* Feature Section */}
        <section id="fitur" ref={keunggulanRef} className="py-32 bg-transparent relative z-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-primary text-sm font-bold tracking-widest uppercase mb-3">Keunggulan</h2>
              <h3 className="font-display text-4xl md:text-5xl font-extrabold text-on-surface">Sistem Pelaporan Terpadu</h3>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: <Activity className="w-8 h-8 text-primary transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12" />,
                  title: "Progres Real-time",
                  desc: "Pantau status laporan Anda mulai dari Menunggu, Diproses, hingga Selesai dengan transparan."
                },
                {
                  icon: <ShieldCheck className="w-8 h-8 text-primary transition-transform duration-300 group-hover:scale-125 group-hover:-rotate-12" />,
                  title: "Tervalidasi & Aman",
                  desc: "Setiap laporan masuk ke admin terkait dan ditindak lanjuti secara resmi dengan privasi terjaga."
                },
                {
                  icon: <MapPin className="w-8 h-8 text-primary transition-transform duration-300 group-hover:scale-125 group-hover:-translate-y-2" />,
                  title: "Berbasis Lokasi",
                  desc: "Gunakan peta interaktif untuk menandai lokasi kejadian dengan akurasi GPS tinggi."
                }
              ].map((feature, idx) => (
                <div key={idx} className="feature-card group bg-surface-container-lowest/90 backdrop-blur-md p-10 rounded-3xl shadow-ambient border border-border transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-8 transition-colors duration-300 group-hover:bg-primary/20">
                    {feature.icon}
                  </div>
                  <h4 className="text-2xl font-bold text-on-surface mb-4">{feature.title}</h4>
                  <p className="text-muted-foreground leading-relaxed text-lg">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Cara Penggunaan Section */}
        <section id="cara-penggunaan" ref={caraPenggunaanRef} className="py-32 bg-transparent relative z-10 border-t border-border/50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-primary text-sm font-bold tracking-widest uppercase mb-3">Panduan</h2>
              <h3 className="font-display text-4xl md:text-5xl font-extrabold text-on-surface">Cara Penggunaan</h3>
            </div>
            
            <div className="grid md:grid-cols-3 gap-12 relative">
              {/* Connecting Line */}
              <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-border/50 -translate-y-1/2 z-0"></div>

              {[
                {
                  icon: <UserPlus className="w-8 h-8 text-white transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-12" />,
                  title: "1. Daftar & Masuk",
                  desc: "Buat akun warga secara gratis untuk mulai menggunakan platform dan melacak laporan Anda."
                },
                {
                  icon: <FileText className="w-8 h-8 text-white transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-12" />,
                  title: "2. Tulis Laporan",
                  desc: "Sertakan foto, pilih kategori, dan tandai lokasi secara akurat melalui peta interaktif."
                },
                {
                  icon: <Wrench className="w-8 h-8 text-white transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-12" />,
                  title: "3. Pantau Perbaikan",
                  desc: "Laporan Anda akan diproses oleh dinas terkait. Dapatkan notifikasi untuk setiap pembaruan status."
                }
              ].map((step, idx) => (
                <div key={idx} className="step-card group relative z-10 flex flex-col items-center text-center bg-surface-container-lowest/90 backdrop-blur-md p-8 rounded-3xl shadow-ambient border border-border transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
                  <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center mb-6 shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                    {step.icon}
                  </div>
                  <h4 className="text-2xl font-bold text-on-surface mb-4">{step.title}</h4>
                  <p className="text-muted-foreground leading-relaxed text-lg">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* The Cinematic Footer is injected here */}
      <CinematicFooter />
      
    </div>
  );
}
