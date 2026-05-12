'use client';

import { useEffect, useState } from 'react';
import {
  CheckCircle,
  Clock,
  FileText,
  Loader,
  LucideIcon,
  TrendingUp,
  Users,
} from 'lucide-react';

interface DashboardStatCardsProps {
  totalLaporan: number;
  menunggu: number;
  diproses: number;
  selesai: number;
  totalUser: number;
}

interface StatCard {
  label: string;
  value: number;
  suffix?: string;
  icon: LucideIcon;
  color: string;
}

function AnimatedNumber({
  value,
  suffix = '',
  delay = 0,
}: {
  value: number;
  suffix?: string;
  delay?: number;
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion || value === 0) {
      setDisplayValue(value);
      return;
    }

    let frameId = 0;
    let startTime: number | null = null;
    const duration = 900;

    const animate = (timestamp: number) => {
      if (startTime === null) startTime = timestamp + delay;

      const elapsed = Math.max(0, timestamp - startTime);
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      setDisplayValue(Math.round(value * easedProgress));

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };

    setDisplayValue(0);
    frameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frameId);
  }, [delay, value]);

  return (
    <>
      {displayValue}
      {suffix}
    </>
  );
}

export default function DashboardStatCards({
  totalLaporan,
  menunggu,
  diproses,
  selesai,
  totalUser,
}: DashboardStatCardsProps) {
  const completionRate =
    totalLaporan > 0 ? Math.round((selesai / totalLaporan) * 100) : 0;

  const cards: StatCard[] = [
    {
      label: 'Total Laporan',
      value: totalLaporan,
      icon: FileText,
      color: 'text-primary-dim',
    },
    {
      label: 'Menunggu',
      value: menunggu,
      icon: Clock,
      color: 'bg-error/10 text-error',
    },
    {
      label: 'Diproses',
      value: diproses,
      icon: Loader,
      color: 'bg-primary-dim/10 text-primary-dim',
    },
    {
      label: 'Selesai',
      value: selesai,
      icon: CheckCircle,
      color: 'bg-tertiary/10 text-tertiary',
    },
    {
      label: 'Total Warga',
      value: totalUser,
      icon: Users,
      color: 'text-primary-dim',
    },
    {
      label: 'Tingkat Penyelesaian',
      value: completionRate,
      suffix: '%',
      icon: TrendingUp,
      color: 'bg-primary/10 text-primary',
    },
  ];

  return (
    <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        const delay = index * 90;

        return (
          <div
            key={card.label}
            className="bg-surface-container-lowest rounded-xl p-5 shadow-ambient border border-[rgba(169,180,185,0.1)] animate-in fade-in slide-in-from-bottom-2 duration-500"
            style={{
              animationDelay: `${delay}ms`,
              animationFillMode: 'both',
            }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-[#677177]">
                  {card.label}
                </p>
                <p className="text-4xl font-display font-bold text-on-surface mt-2 tabular-nums">
                  <AnimatedNumber
                    value={card.value}
                    suffix={card.suffix}
                    delay={delay}
                  />
                </p>
              </div>
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.color}`}
              >
                <Icon className="w-5 h-5" strokeWidth={1.5} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
