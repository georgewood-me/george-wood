"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { hexToRgb } from "./TileBackdrops";

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
  const styleCache = useRef({ intensity: 1, fill: "rgba(255,255,255,0.1)", lastRead: 0 });

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { w, h } = sizeRef.current;
    if (w === 0 || h === 0) {
      animRef.current = requestAnimationFrame(animate);
      return;
    }

    const now = performance.now();
    const sc = styleCache.current;
    if (now - sc.lastRead > 100) {
      const styles = getComputedStyle(document.documentElement);
      sc.intensity = Number(styles.getPropertyValue("--wave-intensity")) || 1;
      sc.fill = `rgba(${hexToRgb(styles.getPropertyValue("--text-color"))}, ${0.1 * sc.intensity})`;
      sc.lastRead = now;
    }

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
    ctx.fillStyle = sc.fill;
    const intensity = sc.intensity;

    for (let i = 0; i < count; i++) {
      const x = i * step;
      const o = offsets[i];
      const speed1 = 1.4 + Math.sin(o * 3.7) * 0.6;
      const speed2 = 2.1 + Math.cos(o * 5.3) * 0.8;
      const speed3 = 0.7 + Math.sin(o * 1.9) * 0.3;
      const v1 = Math.sin(t * speed1 + o) * 0.4;
      const v2 = Math.sin(t * speed2 + o * 2.3 + 1.7) * 0.3;
      const v3 = Math.sin(t * speed3 + o * 0.7 + 4.2) * 0.2;
      const baseHeight = 0.08 + Math.sin(o * 11.3) * 0.04;
      const combined = baseHeight + Math.abs(v1 + v2 + v3);
      const barHeight = Math.max(1, combined * h * intensity);
      const y = h - barHeight;
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, 1);
      ctx.fill();
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    animRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sizeRef.current = { w: width, h: height };
    });
    ro.observe(canvas);

    animRef.current = requestAnimationFrame(animate);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(animRef.current);
    };
  }, [animate]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      aria-hidden="true"
    />
  );
}
