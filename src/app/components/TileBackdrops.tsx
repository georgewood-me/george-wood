"use client";

import { useEffect, useRef } from "react";
import { PRESETS } from "./ControlPanel";
import type { WeatherType } from "./Weather";

// Background layers for tiles. Like the sound waves, they draw in the text colour at low
// opacity, scale with the Motion slider (--wave-intensity) and hold still for reduced motion.

function readInk() {
  const styles = getComputedStyle(document.documentElement);
  const hex = styles.getPropertyValue("--text-color").trim() || "#ffffff";
  return {
    rgb: `${parseInt(hex.slice(1, 3), 16)}, ${parseInt(hex.slice(3, 5), 16)}, ${parseInt(hex.slice(5, 7), 16)}`,
    intensity: Number(styles.getPropertyValue("--wave-intensity")) || 0,
  };
}

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// A canvas that fills its tile, keeps itself sized for the screen's pixel density, and only
// animates while on screen. `draw` gets the elapsed time in seconds.
function useTileCanvas(
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number, t: number, ink: ReturnType<typeof readInk>) => void,
  animate: boolean,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawRef = useRef(draw);
  drawRef.current = draw;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let w = 0;
    let h = 0;
    let frame = 0;
    let visible = true;
    let ink = readInk();
    let inkReadAt = 0;
    const start = performance.now();
    const still = !animate || prefersReducedMotion();

    const render = (now: number) => {
      if (now - inkReadAt > 200) {
        ink = readInk();
        inkReadAt = now;
      }
      ctx.clearRect(0, 0, w, h);
      if (w && h) drawRef.current(ctx, w, h, still ? 0 : (now - start) / 1000, ink);
    };

    const loop = (now: number) => {
      render(now);
      if (visible && !still) frame = requestAnimationFrame(loop);
    };

    const resize = new ResizeObserver(([entry]) => {
      const dpr = window.devicePixelRatio || 1;
      w = entry.contentRect.width;
      h = entry.contentRect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      render(performance.now());
    });
    resize.observe(canvas);

    const onScreen = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      cancelAnimationFrame(frame);
      if (visible && !still) frame = requestAnimationFrame(loop);
    });
    onScreen.observe(canvas);

    return () => {
      resize.disconnect();
      onScreen.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [animate]);

  return canvasRef;
}

// Fixed pseudo-random values so particles keep their place between frames
const seeded = (i: number, salt: number) => {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

function drawClouds(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, rgb: string, alpha: number) {
  for (let i = 0; i < 5; i++) {
    const bandW = w * (0.5 + seeded(i, 1) * 0.6);
    const bandH = 10 + seeded(i, 2) * 14;
    const speed = 6 + seeded(i, 3) * 8;
    const x = ((seeded(i, 4) * (w + bandW) + t * speed) % (w + bandW)) - bandW;
    const y = h * (0.12 + seeded(i, 5) * 0.55);
    ctx.fillStyle = `rgba(${rgb}, ${alpha * (0.5 + seeded(i, 6) * 0.5)})`;
    ctx.beginPath();
    ctx.roundRect(x, y, bandW, bandH, bandH / 2);
    ctx.fill();
  }
}

function drawFall(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, rgb: string, alpha: number, kind: "rain" | "drizzle" | "snow") {
  const count = kind === "rain" ? 70 : kind === "drizzle" ? 35 : 45;
  const speed = kind === "snow" ? 18 : kind === "rain" ? 260 : 160;
  const length = kind === "rain" ? 12 : 7;
  ctx.strokeStyle = `rgba(${rgb}, ${alpha})`;
  ctx.fillStyle = `rgba(${rgb}, ${alpha * 1.4})`;
  ctx.lineWidth = 1;
  for (let i = 0; i < count; i++) {
    const travel = h + 40;
    const y = ((seeded(i, 7) * travel + t * speed * (0.8 + seeded(i, 8) * 0.4)) % travel) - 20;
    if (kind === "snow") {
      const x = seeded(i, 9) * w + Math.sin(t * 0.8 + i) * 6;
      ctx.beginPath();
      ctx.arc(x, y, 1 + seeded(i, 10) * 1.2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Rain falls on a slight diagonal, as if blown by the wind
      const x = seeded(i, 9) * (w + 40) - y * 0.25;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - length * 0.25, y + length);
      ctx.stroke();
    }
  }
}

function drawSun(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, rgb: string, alpha: number) {
  const r = Math.max(w, h) * (0.55 + Math.sin(t * 0.6) * 0.04);
  const glow = ctx.createRadialGradient(w, 0, 0, w, 0, r);
  glow.addColorStop(0, `rgba(${rgb}, ${alpha * 2.2})`);
  glow.addColorStop(1, `rgba(${rgb}, 0)`);
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);
}

export function WeatherBackdrop({ type }: { type: WeatherType | null }) {
  const canvasRef = useTileCanvas((ctx, w, h, t, { rgb, intensity }) => {
    if (!type) return;
    const alpha = 0.08 * intensity;
    if (type === "sun" || type === "cloud-sun") drawSun(ctx, w, h, t, rgb, alpha);
    if (type === "cloud-sun" || type === "cloud" || type === "fog") drawClouds(ctx, w, h, t, rgb, type === "fog" ? alpha * 1.3 : alpha);
    if (type === "drizzle") drawFall(ctx, w, h, t, rgb, alpha * 1.6, "drizzle");
    if (type === "rain" || type === "thunder") drawFall(ctx, w, h, t, rgb, alpha * 1.6, "rain");
    if (type === "snow" || type === "snowflake") drawFall(ctx, w, h, t, rgb, alpha * 1.6, "snow");
    if (type === "thunder") {
      // A brief double flash every eight seconds
      const phase = t % 8;
      if (phase < 0.08 || (phase > 0.16 && phase < 0.22)) {
        ctx.fillStyle = `rgba(${rgb}, ${alpha * 1.5})`;
        ctx.fillRect(0, 0, w, h);
      }
    }
  }, true);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true" />;
}

// A faint dot grid that brightens and leans towards the pointer while it's over the tile
export function DotGrid() {
  const pointer = useRef({ x: -999, y: -999, strength: 0, target: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const tile = canvas?.parentElement;
    if (!canvas || !ctx || !tile) return;

    const reduced = prefersReducedMotion();
    let w = 0;
    let h = 0;
    let frame = 0;
    const p = pointer.current;
    const gap = 16;
    const reach = 90;

    const draw = () => {
      const { rgb, intensity } = readInk();
      ctx.clearRect(0, 0, w, h);
      for (let y = gap / 2; y < h; y += gap) {
        for (let x = gap / 2; x < w; x += gap) {
          const dx = p.x - x;
          const dy = p.y - y;
          const near = Math.max(0, 1 - Math.hypot(dx, dy) / reach) * p.strength;
          const lean = near * 4;
          const dist = Math.hypot(dx, dy) || 1;
          ctx.fillStyle = `rgba(${rgb}, ${(0.12 + near * 0.45) * intensity})`;
          ctx.beginPath();
          ctx.arc(x + (dx / dist) * lean, y + (dy / dist) * lean, 1 + near * 0.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    // Ease the highlight in and out, and stop drawing once it has settled
    const loop = () => {
      p.strength += (p.target - p.strength) * 0.15;
      draw();
      if (Math.abs(p.target - p.strength) > 0.01 || p.target > 0) frame = requestAnimationFrame(loop);
    };
    const wake = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(loop);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = canvas.getBoundingClientRect();
      p.x = e.clientX - r.left;
      p.y = e.clientY - r.top;
      p.target = 1;
      wake();
    };
    const onLeave = () => {
      p.target = 0;
      wake();
    };

    const resize = new ResizeObserver(([entry]) => {
      const dpr = window.devicePixelRatio || 1;
      w = entry.contentRect.width;
      h = entry.contentRect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    });
    resize.observe(canvas);

    if (!reduced) {
      tile.addEventListener("pointermove", onMove);
      tile.addEventListener("pointerleave", onLeave);
    }
    // Redraw when the colour or Motion slider changes
    window.addEventListener("controls:change", draw);
    return () => {
      resize.disconnect();
      cancelAnimationFrame(frame);
      tile.removeEventListener("pointermove", onMove);
      tile.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("controls:change", draw);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true" />;
}

// A slow wash through the colour swatches, previewing what they do
export function ColourDrift() {
  return (
    <div
      className="colour-drift"
      aria-hidden="true"
      style={{ backgroundImage: `linear-gradient(110deg, ${[...PRESETS, PRESETS[0]].join(", ")})` }}
    />
  );
}
