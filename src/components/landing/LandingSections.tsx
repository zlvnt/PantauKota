import type { RefObject } from "react";
import { FEATURES, LandingCard, USAGE_STEPS } from "@/components/landing/content";

export function FeatureSection({
  sectionRef,
}: {
  sectionRef: RefObject<HTMLElement>;
}) {
  return (
    <section
      id="fitur"
      ref={sectionRef}
      className="py-32 bg-transparent relative z-10"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Keunggulan" title="Sistem Pelaporan Terpadu" />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.title} item={feature} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function UsageSection({
  sectionRef,
}: {
  sectionRef: RefObject<HTMLElement>;
}) {
  return (
    <section
      id="cara-penggunaan"
      ref={sectionRef}
      className="py-32 bg-transparent relative z-10"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Panduan" title="Cara Penggunaan" />

        <div className="grid md:grid-cols-3 gap-12 relative">
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-surface-container-high -translate-y-1/2 z-0" />

          {USAGE_STEPS.map((step) => (
            <UsageCard key={step.title} item={step} />
          ))}
        </div>
      </div>
    </section>
  );
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="text-center max-w-3xl mx-auto mb-20">
      <h2 className="text-primary text-sm font-bold tracking-widest uppercase mb-3">
        {eyebrow}
      </h2>
      <h3 className="font-display text-4xl md:text-5xl font-extrabold text-on-surface">
        {title}
      </h3>
    </div>
  );
}

function FeatureCard({ item }: { item: LandingCard }) {
  const Icon = item.icon;

  return (
    <div className="feature-card group bg-surface-container-lowest p-10 rounded-3xl shadow-ambient transition-all duration-300 hover:-translate-y-2">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-8 transition-colors duration-300 group-hover:bg-primary/20">
        <Icon className="w-8 h-8 text-primary transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12" />
      </div>
      <h4 className="text-2xl font-bold text-on-surface mb-4">{item.title}</h4>
      <p className="text-muted-foreground leading-relaxed text-lg">
        {item.description}
      </p>
    </div>
  );
}

function UsageCard({ item }: { item: LandingCard }) {
  const Icon = item.icon;

  return (
    <div className="step-card group relative z-10 flex flex-col items-center text-center bg-surface-container-lowest p-8 rounded-3xl shadow-ambient transition-all duration-300 hover:-translate-y-2">
      <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center mb-6 shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
        <Icon className="w-8 h-8 text-white transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-12" />
      </div>
      <h4 className="text-2xl font-bold text-on-surface mb-4">{item.title}</h4>
      <p className="text-muted-foreground leading-relaxed text-lg">
        {item.description}
      </p>
    </div>
  );
}
