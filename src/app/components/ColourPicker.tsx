"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";

// Hue in degrees, saturation and value from 0 to 1
type Hsv = { h: number; s: number; v: number };

function hexToHsv(hex: string): Hsv | null {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) return null;
  const n = parseInt(match[1], 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);
  let h = 0;
  if (d) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
  }
  return { h: (h * 60 + 360) % 360, s: max ? d / max : 0, v: max };
}

function hsvToHex({ h, s, v }: Hsv) {
  const f = (n: number) => {
    const k = (n + h / 60) % 6;
    return Math.round((v - v * s * Math.max(0, Math.min(k, 4 - k, 1))) * 255);
  };
  return `#${[f(5), f(3), f(1)].map((x) => x.toString(16).padStart(2, "0")).join("")}`.toUpperCase();
}

const clamp = (n: number) => Math.min(1, Math.max(0, n));

// A small picker for the panel: a saturation/brightness field and a hue slider.
// It keeps its own hue while you drag, so greys and black don't snap the hue back to red.
export default function ColourPicker({ value, onChange }: { value: string; onChange: (hex: string) => void }) {
  const [hsv, setHsv] = useState<Hsv>(() => hexToHsv(value) ?? { h: 225, s: 1, v: 1 });
  const field = useRef<HTMLDivElement>(null);
  const lastSent = useRef(value.toUpperCase());

  // Follow changes made elsewhere (swatches, Random, Reset) without disturbing an edit in progress
  useEffect(() => {
    const upper = value.toUpperCase();
    if (upper === lastSent.current) return;
    lastSent.current = upper;
    const next = hexToHsv(upper);
    if (next) setHsv((prev) => (next.s === 0 || next.v === 0 ? { ...next, h: prev.h } : next));
  }, [value]);

  const commit = (next: Hsv) => {
    setHsv(next);
    const hex = hsvToHex(next);
    lastSent.current = hex;
    onChange(hex);
  };

  const pickFromField = (e: PointerEvent<HTMLDivElement>) => {
    const r = field.current!.getBoundingClientRect();
    commit({ ...hsv, s: clamp((e.clientX - r.left) / r.width), v: clamp(1 - (e.clientY - r.top) / r.height) });
  };

  const nudgeField = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 0.1 : 0.02;
    const moves: Record<string, Partial<Hsv>> = {
      ArrowLeft: { s: clamp(hsv.s - step) },
      ArrowRight: { s: clamp(hsv.s + step) },
      ArrowUp: { v: clamp(hsv.v + step) },
      ArrowDown: { v: clamp(hsv.v - step) },
    };
    if (!moves[e.key]) return;
    e.preventDefault();
    commit({ ...hsv, ...moves[e.key] });
  };

  return (
    <div className="mt-3 flex flex-col gap-3">
      <div
        ref={field}
        role="slider"
        tabIndex={0}
        aria-label="Saturation and brightness"
        aria-valuetext={`Saturation ${Math.round(hsv.s * 100)}%, brightness ${Math.round(hsv.v * 100)}%`}
        className="image-edge h-28 rounded-[4px] cursor-crosshair touch-none"
        style={{
          backgroundColor: `hsl(${hsv.h}, 100%, 50%)`,
          backgroundImage: "linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent)",
        }}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          pickFromField(e);
        }}
        onPointerMove={(e) => {
          if (e.currentTarget.hasPointerCapture(e.pointerId)) pickFromField(e);
        }}
        onKeyDown={nudgeField}
      >
        <span
          className="absolute w-3.5 h-3.5 -ml-[7px] -mt-[7px] rounded-full border-2 border-white pointer-events-none"
          style={{
            left: `${hsv.s * 100}%`,
            top: `${(1 - hsv.v) * 100}%`,
            background: hsvToHex(hsv),
            boxShadow: "0 0 0 1px rgba(0, 0, 0, 0.25), 0 1px 3px rgba(0, 0, 0, 0.3)",
          }}
        />
      </div>

      <input
        type="range"
        min={0}
        max={359}
        value={Math.round(hsv.h)}
        onChange={(e) => commit({ ...hsv, h: Number(e.target.value), s: hsv.s || 1, v: hsv.v || 1 })}
        // Room below the track for the thumb and its shadow, which the open/close clipping would otherwise cut off
        className="control-slider hue-slider -mt-2 lg:-mb-1"
        aria-label="Hue"
      />
    </div>
  );
}
