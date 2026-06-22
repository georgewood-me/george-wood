"use client";

import { useEffect, useRef } from "react";

export default function NoiseTexture() {
  const turbRef = useRef<SVGFETurbulenceElement>(null);

  useEffect(() => {
    const turb = turbRef.current;
    if (!turb) return;

    let animId: number;
    let lastFrame = 0;
    const fps = 5;
    const interval = 1000 / fps;

    function tick(timestamp: number) {
      animId = requestAnimationFrame(tick);
      if (timestamp - lastFrame < interval) return;
      lastFrame = timestamp;
      turb!.setAttribute("seed", String(Math.floor(Math.random() * 1000)));
    }

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <>
      <svg style={{ position: "absolute", width: 0, height: 0 }} aria-hidden="true">
        <filter id="grain">
          <feTurbulence
            ref={turbRef}
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves="4"
            stitchTiles="stitch"
            seed="0"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </svg>
      <div
        className="pointer-events-none fixed inset-0 z-50"
        style={{
          filter: "url(#grain)",
          opacity: 0.2,
        }}
        aria-hidden="true"
      />
    </>
  );
}
