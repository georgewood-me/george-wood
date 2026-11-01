"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { canvasDpr, hexToRgb, onRootVarsChange, rootVar } from "./rootVars";

export interface Track {
  title: string;
  artist: string;
  nowPlaying: boolean;
  image: string;
  imageLarge: string;
}

export function useRecentTrack() {
  const [track, setTrack] = useState<Track | null>(null);

  useEffect(() => {
    const apiKey = "2e7aa7aba14b552f8cf7b048661ff913";
    const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=georgewood_me&api_key=${apiKey}&format=json&limit=1`;
    fetch(url)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const t = data?.recenttracks?.track?.[0];
        const imageOf = (size: string) => t.image?.find((img: { size: string }) => img.size === size)?.["#text"] || "";
        if (t) setTrack({ title: t.name, artist: t.artist["#text"], nowPlaying: t["@attr"]?.nowplaying === "true", image: imageOf("small"), imageLarge: imageOf("extralarge") });
      })
      .catch(() => {});
  }, []);

  return track;
}

export function SoundWaves() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const offsetsRef = useRef<Float32Array | null>(null);
  const sizeRef = useRef({ w: 0, h: 0 });

  const draw = useCallback((now: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const { w, h } = sizeRef.current;
    if (!ctx || w === 0 || h === 0) return;

    const intensity = Number(rootVar("--wave-intensity")) || 0;
    const barWidth = 2;
    const gap = 2;
    const step = barWidth + gap;
    const count = Math.ceil(w / step);
    const t = now / 1000;

    if (!offsetsRef.current || offsetsRef.current.length !== count) {
      offsetsRef.current = new Float32Array(count);
      for (let i = 0; i < count; i++) {
        offsetsRef.current[i] = Math.random() * Math.PI * 2;
      }
    }
    const offsets = offsetsRef.current;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = `rgba(${hexToRgb(rootVar("--text-color"))}, ${0.1 * intensity})`;

    for (let i = 0; i < count; i++) {
      const o = offsets[i];
      const speed1 = 1.4 + Math.sin(o * 3.7) * 0.6;
      const speed2 = 2.1 + Math.cos(o * 5.3) * 0.8;
      const speed3 = 0.7 + Math.sin(o * 1.9) * 0.3;
      const v1 = Math.sin(t * speed1 + o) * 0.4;
      const v2 = Math.sin(t * speed2 + o * 2.3 + 1.7) * 0.3;
      const v3 = Math.sin(t * speed3 + o * 0.7 + 4.2) * 0.2;
      const baseHeight = 0.08 + Math.sin(o * 11.3) * 0.04;
      const barHeight = Math.max(1, (baseHeight + Math.abs(v1 + v2 + v3)) * h * intensity);
      ctx.fillRect(i * step, h - barHeight, barWidth, barHeight);
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let visible = true;
    const loop = (now: number) => {
      draw(now);
      if (visible && !still) animRef.current = requestAnimationFrame(loop);
    };

    const ro = new ResizeObserver((entries) => {
      const dpr = canvasDpr();
      const { width, height } = entries[0].contentRect;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.getContext("2d")?.setTransform(dpr, 0, 0, dpr, 0, 0);
      sizeRef.current = { w: width, h: height };
      draw(performance.now());
    });
    ro.observe(canvas);

    // Pause while the tile is off screen
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      cancelAnimationFrame(animRef.current);
      if (visible && !still) animRef.current = requestAnimationFrame(loop);
    });
    io.observe(canvas);

    const offRootVars = onRootVarsChange(() => draw(performance.now()));
    return () => {
      ro.disconnect();
      io.disconnect();
      offRootVars();
      cancelAnimationFrame(animRef.current);
    };
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      aria-hidden="true"
    />
  );
}
