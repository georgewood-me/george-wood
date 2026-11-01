"use client";

import { useEffect, useState } from "react";
import { onRootVarsChange, rootVar } from "./rootVars";

// The grain is the same fractal noise as before, rendered once into a small seamless tile
// and repeated as a background. A live full-screen SVG filter could be repainted on every
// scroll frame on phones; a repeated image is drawn once and simply composited.
const grainTile = (seed: number) =>
  `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='256' height='256'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch' seed='${seed}'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(#g)'/></svg>`,
  )}")`;

// A handful of seeds to cycle through when the grain is animated; each is decoded once
const TILES = [0, 137, 274, 411, 548, 685].map(grainTile);

export default function NoiseTexture() {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let timer: ReturnType<typeof setInterval> | undefined;
    const start = () => {
      clearInterval(timer);
      const fps = Number(rootVar("--noise-speed")) || 0;
      if (fps > 0) timer = setInterval(() => setFrame((f) => (f + 1) % TILES.length), 1000 / fps);
    };
    start();
    const stop = onRootVarsChange(start);
    return () => {
      clearInterval(timer);
      stop();
    };
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 noise-layer"
      style={{ backgroundImage: TILES[frame], backgroundSize: "256px 256px" }}
      aria-hidden="true"
    />
  );
}
