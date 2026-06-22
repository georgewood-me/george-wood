"use client";

import { useEffect, useRef } from "react";

// Simple 2D simplex noise implementation
function createNoise(seed: number) {
  const perm = new Uint8Array(512);
  const grad = [
    [1, 1], [-1, 1], [1, -1], [-1, -1],
    [1, 0], [-1, 0], [0, 1], [0, -1],
  ];

  // Seed the permutation table
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  let s = seed;
  for (let i = 255; i > 0; i--) {
    s = (s * 16807 + 0) % 2147483647;
    const j = s % (i + 1);
    [p[i], p[j]] = [p[j], p[i]];
  }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];

  const F2 = 0.5 * (Math.sqrt(3) - 1);
  const G2 = (3 - Math.sqrt(3)) / 6;

  return function noise2D(x: number, y: number): number {
    const s = (x + y) * F2;
    const i = Math.floor(x + s);
    const j = Math.floor(y + s);
    const t = (i + j) * G2;
    const X0 = i - t;
    const Y0 = j - t;
    const x0 = x - X0;
    const y0 = y - Y0;

    const i1 = x0 > y0 ? 1 : 0;
    const j1 = x0 > y0 ? 0 : 1;
    const x1 = x0 - i1 + G2;
    const y1 = y0 - j1 + G2;
    const x2 = x0 - 1 + 2 * G2;
    const y2 = y0 - 1 + 2 * G2;

    const ii = i & 255;
    const jj = j & 255;

    let n0 = 0, n1 = 0, n2 = 0;
    let t0 = 0.5 - x0 * x0 - y0 * y0;
    if (t0 >= 0) {
      t0 *= t0;
      const gi = perm[ii + perm[jj]] % 8;
      n0 = t0 * t0 * (grad[gi][0] * x0 + grad[gi][1] * y0);
    }
    let t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 >= 0) {
      t1 *= t1;
      const gi = perm[ii + i1 + perm[jj + j1]] % 8;
      n1 = t1 * t1 * (grad[gi][0] * x1 + grad[gi][1] * y1);
    }
    let t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 >= 0) {
      t2 *= t2;
      const gi = perm[ii + 1 + perm[jj + 1]] % 8;
      n2 = t2 * t2 * (grad[gi][0] * x2 + grad[gi][1] * y2);
    }
    return 70 * (n0 + n1 + n2);
  };
}

// Fractal Brownian Motion for more natural clouds
function fbm(noise: (x: number, y: number) => number, x: number, y: number, octaves: number) {
  let value = 0;
  let amplitude = 1;
  let frequency = 1;
  let max = 0;
  for (let i = 0; i < octaves; i++) {
    value += amplitude * noise(x * frequency, y * frequency);
    max += amplitude;
    amplitude *= 0.5;
    frequency *= 2;
  }
  return value / max;
}

export default function AsciiClouds() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const seedRef = useRef(Math.random() * 100000);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function render() {
      const dpr = window.devicePixelRatio || 1;
      const width = window.innerWidth;
      const height = window.innerHeight;

      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.scale(dpr, dpr);

      // Fill blue background
      ctx!.fillStyle = "#0038FF";
      ctx!.fillRect(0, 0, width, height);

      const noise = createNoise(seedRef.current);

      // Halftone dot grid — small dots for the dithered look
      const dotSpacing = 4;
      const maxRadius = dotSpacing * 0.45;
      const cols = Math.ceil(width / dotSpacing);
      const rows = Math.ceil(height / dotSpacing);

      // Large scale noise for cloud placement, smaller for detail
      const baseScale = 0.004;
      const detailScale = 0.012;

      ctx!.fillStyle = "#FFFFFF";

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = col * dotSpacing;
          const y = row * dotSpacing;

          const nx = col * baseScale;
          const ny = row * baseScale;

          // Base cloud shape — large, soft blobs
          const base = fbm(noise, nx, ny, 4);

          // Detail layer for fluffy edges
          const detail = fbm(noise, col * detailScale, row * detailScale, 3) * 0.3;

          let value = base + detail;

          // Push clouds towards bottom half with some in the middle
          const yNorm = row / rows;
          const verticalBias = -0.15 + Math.pow(yNorm, 0.8) * 0.25;
          value += verticalBias;

          // High threshold = lots of clear sky, dense clouds where they appear
          const normalized = (value + 1) / 2;
          const threshold = 0.62;

          if (normalized > threshold) {
            const intensity = Math.min(1, (normalized - threshold) / (1 - threshold));

            // Halftone: dot size scales with intensity
            const radius = maxRadius * (0.3 + intensity * 0.7);
            const alpha = 0.5 + intensity * 0.5;

            ctx!.globalAlpha = alpha;
            ctx!.beginPath();
            ctx!.arc(x, y, radius, 0, Math.PI * 2);
            ctx!.fill();
          }
        }
      }

      ctx!.globalAlpha = 1;
    }

    render();

    let resizeTimeout: ReturnType<typeof setTimeout>;
    function handleResize() {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(render, 100);
    }

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimeout);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10"
      aria-hidden="true"
    />
  );
}
