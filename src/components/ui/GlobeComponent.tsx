"use client";

import dynamic from 'next/dynamic';
import { useEffect, useState, useRef } from 'react';

const Globe = dynamic(() => import('react-globe.gl'), { ssr: false });

export default function GlobeComponent() {
  const [mounted, setMounted] = useState(false);
  const globeEl = useRef<any>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && globeEl.current) {
      // Configuration moved to onGlobeReady to ensure it executes only after the globe is fully loaded
    }
  }, [mounted]);

  if (!mounted) return null;

  return (
    <div className="flex items-center justify-center w-full h-full opacity-40 mix-blend-screen pointer-events-none">
      <Globe
        ref={globeEl}
        width={800}
        height={800}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        backgroundColor="rgba(0,0,0,0)"
        showAtmosphere={true}
        atmosphereColor="#426464"
        atmosphereAltitude={0.15}
        onGlobeReady={() => {
          if (globeEl.current) {
            // Set to Indonesia immediately after globe finishes loading
            globeEl.current.pointOfView({ lat: -0.789, lng: 113.921, altitude: 1.5 }, 0);
            globeEl.current.controls().enableZoom = false;
            globeEl.current.controls().autoRotate = false;
          }
        }}
      />
    </div>
  );
}
