"use client";

import { useEffect, useRef } from "react";

export default function NoiseTexture() {
  const turbRef = useRef<SVGFETurbulenceElement>(null);

  useEffect(() => {
    const turb = turbRef.current;
    if (!turb) return;

    let animId: number;
    let lastFrame = 0;

    function tick(timestamp: number) {
      animId = requestAnimationFrame(tick);
      const fps =
        Number(
          getComputedStyle(document.documentElement).getPropertyValue(
            "--noise-speed"
          )
        ) || 5;
      if (timestamp - lastFrame < 1000 / fps) return;
      lastFrame = timestamp;
      turb!.setAttribute("seed", String(Math.floor(Math.random() * 1000)));
    }

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <svg
      className="pointer-events-none fixed inset-0 z-50 w-full h-full noise-layer"
      aria-hidden="true"
    >
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
      <rect width="100%" height="100%" filter="url(#grain)" />
    </svg>
  );
}
