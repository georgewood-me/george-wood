"use client";

import { useEffect, useRef } from "react";
import { PRESETS } from "./ControlPanel";
import type { WeatherType } from "./Weather";
import { canvasDpr, hexToRgb, onRootVarsChange, rootVar } from "./rootVars";

// Background layers for tiles. Like the sound waves, they draw in the text colour at low
// opacity, scale with the Motion slider (--wave-intensity) and hold still for reduced motion.

function readInk() {
  return {
    rgb: hexToRgb(rootVar("--text-color")),
    intensity: Number(rootVar("--wave-intensity")) || 0,
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
    const start = performance.now();
    const still = !animate || prefersReducedMotion();

    const render = (now: number) => {
      ctx.clearRect(0, 0, w, h);
      if (w && h) drawRef.current(ctx, w, h, still ? 0 : (now - start) / 1000, readInk());
    };

    const loop = (now: number) => {
      render(now);
      if (visible && !still) frame = requestAnimationFrame(loop);
    };

    const resize = new ResizeObserver(([entry]) => {
      const dpr = canvasDpr();
      w = entry.contentRect.width;
      h = entry.contentRect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      render(performance.now());
    });
    resize.observe(canvas);
    // Redraw a still frame when the colour or Motion changes
    const offRootVars = onRootVarsChange(() => render(performance.now()));

    const onScreen = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      cancelAnimationFrame(frame);
      if (visible && !still) frame = requestAnimationFrame(loop);
    });
    onScreen.observe(canvas);

    return () => {
      resize.disconnect();
      onScreen.disconnect();
      offRootVars();
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

// Small cache of pre-rendered images, so soft gradients are built once rather than every frame
const sprites = new Map<string, HTMLCanvasElement>();
function sprite(key: string, w: number, h: number, paint: (ctx: CanvasRenderingContext2D) => void) {
  let image = sprites.get(key);
  if (!image) {
    image = document.createElement("canvas");
    image.width = Math.ceil(w * 2);
    image.height = Math.ceil(h * 2);
    const ctx = image.getContext("2d")!;
    ctx.scale(2, 2);
    paint(ctx);
    if (sprites.size > 120) sprites.delete(sprites.keys().next().value!);
    sprites.set(key, image);
  }
  return image;
}

// A soft round puff: full strength in the middle, fading to nothing at the edge
function puff(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, rgb: string, a: number) {
  const size = Math.max(1, Math.round(r));
  const image = sprite(`puff|${size}|${rgb}|${a.toFixed(3)}`, size * 2, size * 2, (c) => {
    const g = c.createRadialGradient(size, size, 0, size, size, size);
    g.addColorStop(0, `rgba(${rgb}, ${a})`);
    g.addColorStop(0.55, `rgba(${rgb}, ${a * 0.55})`);
    g.addColorStop(1, `rgba(${rgb}, 0)`);
    c.fillStyle = g;
    c.fillRect(0, 0, size * 2, size * 2);
  });
  ctx.drawImage(image, x - r, y - r, r * 2, r * 2);
}

// Each cloud is a cluster of overlapping puffs; overlaps build up into a denser middle
const CLOUD_PUFFS = [
  [-1.15, 0.25, 0.75],
  [-0.5, -0.2, 1],
  [0.25, -0.45, 1.1],
  [0.95, -0.05, 0.9],
  [0.15, 0.3, 0.95],
];

function drawClouds(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, rgb: string, alpha: number, count: number) {
  for (let i = 0; i < count; i++) {
    const r = h * (0.13 + seeded(i, 1) * 0.07);
    const span = w + r * 5;
    // Nearer (bigger) clouds drift a little faster
    const speed = 4 + (r / h) * 40;
    const x = ((seeded(i, 4) * span + t * speed) % span) - r * 2.5;
    const y = h * (0.18 + seeded(i, 5) * 0.45);
    for (const [dx, dy, scale] of CLOUD_PUFFS) {
      puff(ctx, x + dx * r, y + dy * r, r * scale, rgb, alpha);
    }
  }
}

// Long, low mist layers that slide past each other in opposite directions
function drawFog(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, rgb: string, alpha: number) {
  const layers = 6;
  for (let i = 0; i < layers; i++) {
    const y = (h * (i + 0.5)) / layers + Math.sin(t * 0.3 + i) * 4;
    const direction = i % 2 ? -1 : 1;
    const span = w * 2;
    const x = ((((seeded(i, 11) * span + t * 8 * direction) % span) + span) % span) - w * 0.5;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(6, 1);
    puff(ctx, 0, 0, (h / layers) * 1.3, rgb, alpha * 1.6);
    ctx.restore();
  }
}

function drawFall(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, rgb: string, alpha: number, kind: "rain" | "drizzle" | "snow") {
  const count = kind === "rain" ? 70 : kind === "drizzle" ? 35 : 70;
  const speed = kind === "snow" ? 22 : kind === "rain" ? 260 : 160;
  const length = kind === "rain" ? 12 : 7;
  ctx.strokeStyle = `rgba(${rgb}, ${alpha})`;
  ctx.fillStyle = `rgba(${rgb}, ${alpha * 1.6})`;
  ctx.lineWidth = 1;
  for (let i = 0; i < count; i++) {
    const travel = h + 40;
    const y = ((seeded(i, 7) * travel + t * speed * (0.8 + seeded(i, 8) * 0.4)) % travel) - 20;
    if (kind === "snow") {
      const x = seeded(i, 9) * w + Math.sin(t * 0.8 + i) * 8;
      ctx.beginPath();
      ctx.arc(x, y, 1.2 + seeded(i, 10) * 1.6, 0, Math.PI * 2);
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

// The sun: a clear disc with a soft edge, a halo around it, and a wide glow that breathes slowly
function drawSun(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, rgb: string, alpha: number) {
  // The breathing is stepped into twelve cached frames; the change between them is too small to see
  const step = Math.round(((Math.sin(t * 0.6) + 1) / 2) * 11);
  const image = sprite(`sun|${Math.round(w)}|${Math.round(h)}|${rgb}|${alpha.toFixed(3)}|${step}`, w, h, (c) =>
    paintSun(c, w, h, 1 + (step / 11 - 0.5) * 0.1, rgb, alpha),
  );
  ctx.drawImage(image, 0, 0, w, h);
}

function paintSun(ctx: CanvasRenderingContext2D, w: number, h: number, breath: number, rgb: string, alpha: number) {
  const x = w * 0.76;
  const y = h * 0.3;
  const r = Math.min(w, h) * 0.17;

  const glow = ctx.createRadialGradient(x, y, r, x, y, Math.hypot(w, h) * 0.7 * breath);
  glow.addColorStop(0, `rgba(${rgb}, ${alpha * 1.4})`);
  glow.addColorStop(1, `rgba(${rgb}, 0)`);
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  // Halo: a faint ring just outside the disc
  const halo = ctx.createRadialGradient(x, y, r, x, y, r * 1.9 * breath);
  halo.addColorStop(0, `rgba(${rgb}, ${alpha * 1.2})`);
  halo.addColorStop(1, `rgba(${rgb}, 0)`);
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(x, y, r * 1.9 * breath, 0, Math.PI * 2);
  ctx.fill();

  // Disc: even through most of its radius so it reads as a sun, then softening into the halo
  const disc = ctx.createRadialGradient(x, y, 0, x, y, r);
  disc.addColorStop(0, `rgba(${rgb}, ${alpha * 2})`);
  disc.addColorStop(0.65, `rgba(${rgb}, ${alpha * 1.8})`);
  disc.addColorStop(1, `rgba(${rgb}, ${alpha * 0.4})`);
  ctx.fillStyle = disc;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

export function WeatherBackdrop({ type }: { type: WeatherType | null }) {
  const canvasRef = useTileCanvas((ctx, w, h, t, { rgb, intensity }) => {
    if (!type) return;
    const alpha = 0.1 * intensity;
    if (type === "sun" || type === "cloud-sun") drawSun(ctx, w, h, t, rgb, alpha);
    if (type === "cloud-sun") drawClouds(ctx, w, h, t, rgb, alpha, 5);
    if (type === "cloud") drawClouds(ctx, w, h, t, rgb, alpha, 7);
    if (type === "thunder") drawClouds(ctx, w, h, t, rgb, alpha, 5);
    if (type === "fog") drawFog(ctx, w, h, t, rgb, alpha);
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
      ctx.fillStyle = `rgba(${rgb}, ${0.15 * intensity})`;
      for (let y = gap / 2; y < h; y += gap) {
        for (let x = gap / 2; x < w; x += gap) {
          const dx = p.x - x;
          const dy = p.y - y;
          const near = Math.max(0, 1 - Math.hypot(dx, dy) / reach) * p.strength;
          const lean = near * 4;
          const dist = Math.hypot(dx, dy) || 1;
          ctx.fillStyle = `rgba(${rgb}, ${(0.15 + near * 0.45) * intensity})`;
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
      const dpr = canvasDpr();
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
    const offRootVars = onRootVarsChange(draw);
    return () => {
      resize.disconnect();
      cancelAnimationFrame(frame);
      tile.removeEventListener("pointermove", onMove);
      tile.removeEventListener("pointerleave", onLeave);
      offRootVars();
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true" />;
}

// A wash through the colourful swatches, previewing what they do. The blue, black and white
// swatches are left out: blue matches the default background, and black and white overpowered the rest.
const DRIFT_COLOURS = PRESETS.slice(3);

export function ColourDrift() {
  return (
    <div
      className="colour-drift"
      aria-hidden="true"
      style={{ backgroundImage: `linear-gradient(110deg, ${[...DRIFT_COLOURS, DRIFT_COLOURS[0]].join(", ")})` }}
    />
  );
}
