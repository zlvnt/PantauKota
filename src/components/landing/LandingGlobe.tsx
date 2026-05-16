import type { RefObject } from "react";
import GlobeScene from "@/components/landing/GlobeScene";

export default function LandingGlobe({
  globeRef,
}: {
  globeRef: RefObject<HTMLDivElement>;
}) {
  return (
    <div className="absolute left-0 right-0 top-0 bottom-0 pointer-events-none z-0 overflow-hidden">
      <div
        ref={globeRef}
        className="absolute opacity-0"
        style={{ top: "100vh", left: "-20vw", transform: "scale(0.8)" }}
      >
        <GlobeScene />
      </div>
    </div>
  );
}
