"use client";

import * as React from "react";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const FOOTER_STYLES = `
.cinematic-footer-wrapper {
  font-family: var(--font-inter), sans-serif;
  -webkit-font-smoothing: antialiased;
  --pill-border: color-mix(in oklch, var(--foreground) 8%, transparent);
}

@keyframes footer-heartbeat {
  0%, 100% { transform: scale(1); filter: drop-shadow(0 0 5px color-mix(in oklch, var(--destructive) 50%, transparent)); }
  15%, 45% { transform: scale(1.12); filter: drop-shadow(0 0 10px color-mix(in oklch, var(--destructive) 70%, transparent)); }
  30% { transform: scale(1); }
}

.animate-footer-heartbeat {
  animation: footer-heartbeat 2s cubic-bezier(0.25, 1, 0.5, 1) infinite;
}

@keyframes footer-scroll-marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

.animate-footer-scroll-marquee {
  animation: footer-scroll-marquee 25s linear infinite;
}

.footer-glass-pill {
  background: var(--surface-container-high);
  box-shadow: 0 8px 30px rgba(42, 52, 57, 0.06);
  border: 1px solid var(--pill-border);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.footer-glass-pill:hover {
  background: var(--surface-container-lowest);
  border-color: var(--primary);
  box-shadow: 0 10px 30px -10px var(--primary);
  color: var(--foreground);
}

.footer-giant-bg-text {
  font-size: 26vw;
  line-height: 0.75;
  font-weight: 900;
  letter-spacing: -0.05em;
  color: transparent;
  -webkit-text-stroke: 1px color-mix(in oklch, var(--foreground) 5%, transparent);
  background: linear-gradient(180deg, color-mix(in oklch, var(--foreground) 10%, transparent) 0%, transparent 60%);
  -webkit-background-clip: text;
  background-clip: text;
}

.footer-text-glow {
  background: linear-gradient(180deg, var(--foreground) 0%, color-mix(in oklch, var(--foreground) 40%, transparent) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0px 0px 20px color-mix(in oklch, var(--foreground) 15%, transparent));
}
`;

type MagneticButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    as?: React.ElementType;
  };

const MagneticButton = React.forwardRef<HTMLElement, MagneticButtonProps>(
  ({ className, children, as: Component = "button", ...props }, forwardedRef) => {
    const localRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
      if (typeof window === "undefined") return;

      const element = localRef.current;
      if (!element) return;

      const ctx = gsap.context(() => {
        const handleMouseMove = (event: MouseEvent) => {
          const rect = element.getBoundingClientRect();
          const halfWidth = rect.width / 2;
          const halfHeight = rect.height / 2;
          const x = event.clientX - rect.left - halfWidth;
          const y = event.clientY - rect.top - halfHeight;

          gsap.to(element, {
            x: x * 0.4,
            y: y * 0.4,
            rotationX: -y * 0.15,
            rotationY: x * 0.15,
            scale: 1.05,
            ease: "power2.out",
            duration: 0.4,
          });
        };

        const handleMouseLeave = () => {
          gsap.to(element, {
            x: 0,
            y: 0,
            rotationX: 0,
            rotationY: 0,
            scale: 1,
            ease: "elastic.out(1, 0.3)",
            duration: 1.2,
          });
        };

        element.addEventListener("mousemove", handleMouseMove);
        element.addEventListener("mouseleave", handleMouseLeave);

        return () => {
          element.removeEventListener("mousemove", handleMouseMove);
          element.removeEventListener("mouseleave", handleMouseLeave);
        };
      }, element);

      return () => ctx.revert();
    }, []);

    return (
      <Component
        ref={(node: HTMLElement | null) => {
          localRef.current = node;
          if (typeof forwardedRef === "function") {
            forwardedRef(node);
          } else if (forwardedRef) {
            forwardedRef.current = node;
          }
        }}
        className={cn("cursor-pointer", className)}
        {...props}
      >
        {children}
      </Component>
    );
  }
);
MagneticButton.displayName = "MagneticButton";

const MARQUEE_ITEMS = [
  "Laporan Transparan",
  "Tindakan Cepat",
  "Pantau Progres",
  "Kota Lebih Baik",
  "Privasi Terjaga",
];

function MarqueeItem() {
  return (
    <div className="flex items-center space-x-12 pr-12 px-6">
      {MARQUEE_ITEMS.map((item) => (
        <span key={item}>{item}</span>
      ))}
    </div>
  );
}

export default function CinematicFooter() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const giantTextRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!wrapperRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        giantTextRef.current,
        { y: "10vh", scale: 0.8, opacity: 0 },
        {
          y: "0vh",
          scale: 1,
          opacity: 1,
          ease: "power1.out",
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: "top 80%",
            end: "bottom bottom",
            scrub: 1,
          },
        }
      );

      gsap.fromTo(
        [headingRef.current, linksRef.current],
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: "top 40%",
            end: "bottom bottom",
            scrub: 1,
          },
        }
      );
    }, wrapperRef);

    return () => ctx.revert();
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: FOOTER_STYLES }} />

      <div
        ref={wrapperRef}
        className="relative h-screen w-full"
        style={{ clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)" }}
      >
        <footer className="fixed bottom-0 left-0 flex h-screen w-full flex-col justify-between overflow-hidden bg-background text-foreground cinematic-footer-wrapper">
          <div className="absolute inset-0 z-0">
            <img
              src="/images/cluster-bg.png"
              alt=""
              className="object-cover w-full h-full opacity-40 mix-blend-luminosity"
            />
            <div className="absolute inset-0 bg-primary/90 mix-blend-multiply" />
            <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/40 to-background/90" />
          </div>

          <div
            ref={giantTextRef}
            className="footer-giant-bg-text absolute -bottom-[5vh] left-1/2 -translate-x-1/2 whitespace-nowrap z-0 pointer-events-none select-none"
          >
            PANTAUKOTA
          </div>

          <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[95%] max-w-5xl overflow-hidden border border-border/50 bg-surface-container-high rounded-full py-3 z-10 shadow-ambient">
            <div className="flex w-max animate-footer-scroll-marquee text-xs md:text-sm font-bold tracking-[0.3em] text-foreground uppercase">
              <MarqueeItem />
              <MarqueeItem />
            </div>
          </div>

          <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 mt-20 w-full max-w-5xl mx-auto">
            <h2
              ref={headingRef}
              className="text-5xl md:text-8xl font-black footer-text-glow tracking-tighter mb-12 text-center"
            >
              Siap melapor?
            </h2>

            <div ref={linksRef} className="flex flex-col items-center gap-6 w-full">
              <div className="flex flex-wrap justify-center gap-4 w-full">
                <MagneticButton
                  as="a"
                  href="/login"
                  className="footer-glass-pill px-10 py-5 rounded-full text-foreground font-bold text-sm md:text-base flex items-center gap-3 group"
                >
                  <svg
                    className="w-6 h-6 text-muted-foreground group-hover:text-foreground transition-colors"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" />
                  </svg>
                  Masuk Sekarang
                </MagneticButton>
              </div>
            </div>
          </div>

          <div className="relative z-20 w-full pb-8 px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-muted-foreground text-[10px] md:text-xs font-semibold tracking-widest uppercase order-2 md:order-1">
              (c) 2026 PantauKota. Hak Cipta Dilindungi.
            </div>

            <div className="footer-glass-pill px-6 py-3 rounded-full flex items-center gap-2 order-1 md:order-2 cursor-default border-border/50">
              <span className="text-muted-foreground text-[10px] md:text-xs font-bold uppercase tracking-widest">
                Dibuat dengan
              </span>
              <span className="animate-footer-heartbeat text-sm md:text-base text-destructive">
                hati
              </span>
              <span className="text-muted-foreground text-[10px] md:text-xs font-bold uppercase tracking-widest">
                oleh
              </span>
              <span className="text-foreground font-black text-xs md:text-sm tracking-normal ml-1">
                Warga
              </span>
            </div>

            <MagneticButton
              as="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="w-12 h-12 rounded-full footer-glass-pill flex items-center justify-center text-muted-foreground hover:text-foreground group order-3"
            >
              <svg
                className="w-5 h-5 transform group-hover:-translate-y-1.5 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 10l7-7m0 0l7 7m-7-7v18"
                />
              </svg>
            </MagneticButton>
          </div>
        </footer>
      </div>
    </>
  );
}
