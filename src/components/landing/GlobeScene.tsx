"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { GlobeMethods } from "react-globe.gl";

const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

export default function GlobeScene() {
  const [mounted, setMounted] = useState(false);
  const globeRef = useRef<GlobeMethods>();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleGlobeReady = () => {
    if (!globeRef.current) return;

    globeRef.current.pointOfView(
      { lat: -0.789, lng: 113.921, altitude: 1.5 },
      0
    );

    const controls = globeRef.current.controls();
    controls.enableZoom = false;
    controls.autoRotate = false;
  };

  return (
    <div className="flex items-center justify-center w-full h-full opacity-40 mix-blend-screen pointer-events-none">
      <Globe
        ref={globeRef}
        width={800}
        height={800}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        backgroundColor="rgba(0,0,0,0)"
        showAtmosphere
        atmosphereColor="#426464"
        atmosphereAltitude={0.15}
        onGlobeReady={handleGlobeReady}
      />
    </div>
  );
}
