"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CinematicFooter from "@/components/landing/CinematicFooter";
import HeroSection from "@/components/landing/HeroSection";
import LandingGlobe from "@/components/landing/LandingGlobe";
import LandingHeader from "@/components/landing/LandingHeader";
import {
  FeatureSection,
  UsageSection,
} from "@/components/landing/LandingSections";

function useLandingAnimations({
  heroTextRef,
  featureSectionRef,
  usageSectionRef,
  globeRef,
}: {
  heroTextRef: React.RefObject<HTMLDivElement>;
  featureSectionRef: React.RefObject<HTMLElement>;
  usageSectionRef: React.RefObject<HTMLElement>;
  globeRef: React.RefObject<HTMLDivElement>;
}) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.fromTo(
        heroTextRef.current,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
      );

      if (featureSectionRef.current) {
        gsap.fromTo(
          ".feature-card",
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.2,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: featureSectionRef.current,
              start: "top 80%",
            },
          }
        );
      }

      if (usageSectionRef.current) {
        gsap.fromTo(
          ".step-card",
          { x: -50, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            stagger: 0.2,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: usageSectionRef.current,
              start: "top 80%",
            },
          }
        );
      }

      if (
        globeRef.current &&
        featureSectionRef.current &&
        usageSectionRef.current
      ) {
        gsap
          .timeline({
            scrollTrigger: {
              trigger: featureSectionRef.current,
              start: "top center",
              endTrigger: usageSectionRef.current,
              end: "bottom center",
              scrub: 1,
            },
          })
          .to(globeRef.current, { opacity: 0.8, duration: 0.1 })
          .to(
            globeRef.current,
            { x: "50vw", y: 400, scale: 1.2, duration: 0.4 },
            "<"
          )
          .to(globeRef.current, {
            x: "90vw",
            y: 1100,
            scale: 0.8,
            duration: 0.4,
          })
          .to(globeRef.current, { opacity: 0, duration: 0.2 }, "-=0.2");
      }
    });

    return () => ctx.revert();
  }, [featureSectionRef, globeRef, heroTextRef, usageSectionRef]);
}

export default function LandingPage() {
  const heroTextRef = useRef<HTMLDivElement>(null);
  const featureSectionRef = useRef<HTMLElement>(null);
  const usageSectionRef = useRef<HTMLElement>(null);
  const globeRef = useRef<HTMLDivElement>(null);

  useLandingAnimations({
    heroTextRef,
    featureSectionRef,
    usageSectionRef,
    globeRef,
  });

  return (
    <div className="relative w-full bg-surface min-h-screen font-sans selection:bg-primary/20 overflow-x-hidden">
      <main className="relative z-10 w-full bg-surface text-on-surface shadow-ambient rounded-b-[40px] lg:rounded-b-[60px] flex flex-col min-h-screen overflow-hidden">
        <LandingHeader />
        <HeroSection textRef={heroTextRef} />
        <LandingGlobe globeRef={globeRef} />
        <FeatureSection sectionRef={featureSectionRef} />
        <UsageSection sectionRef={usageSectionRef} />
      </main>

      <CinematicFooter />
    </div>
  );
}
