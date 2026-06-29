"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export default function ScanLines() {
  const [intensity, setIntensity] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const sizeRef = useRef({ w: 0, h: 0 });

  useEffect(() => {
    const read = () => {
      setIntensity(
        Number(getComputedStyle(document.documentElement).getPropertyValue("--scanlines") || "0")
      );
    };
    read();
    const id = setInterval(read, 200);
    return () => clearInterval(id);
  }, []);

  const animate = useCallback((now: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { w, h } = sizeRef.current;
    if (w === 0) {
      animRef.current = requestAnimationFrame(animate);
      return;
    }

    const t = Number(getComputedStyle(document.documentElement).getPropertyValue("--scanlines") || "0") / 100;
    if (t === 0) {
      ctx.clearRect(0, 0, w, h);
      animRef.current = requestAnimationFrame(animate);
      return;
    }

    ctx.clearRect(0, 0, w, h);

    const lineGap = 3;
    for (let y = 0; y < h; y += lineGap) {
      ctx.fillStyle = `rgba(0, 0, 0, ${0.08 * t})`;
      ctx.fillRect(0, y, w, 1);
    }

    const bandSpeed = 0.15 + t * 0.3;
    const bandY = ((now * bandSpeed) % (h + 200)) - 100;
    const bandHeight = 60 + t * 100;
    const bandGrad = ctx.createLinearGradient(0, bandY - bandHeight / 2, 0, bandY + bandHeight / 2);
    bandGrad.addColorStop(0, "rgba(255,255,255,0)");
    bandGrad.addColorStop(0.4, `rgba(255,255,255,${0.03 * t})`);
    bandGrad.addColorStop(0.5, `rgba(255,255,255,${0.06 * t})`);
    bandGrad.addColorStop(0.6, `rgba(255,255,255,${0.03 * t})`);
    bandGrad.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = bandGrad;
    ctx.fillRect(0, bandY - bandHeight / 2, w, bandHeight);

    if (t > 0.3) {
      const flickerChance = t * 0.08;
      if (Math.random() < flickerChance) {
        const flickerAlpha = Math.random() * 0.12 * t;
        ctx.fillStyle = `rgba(255,255,255,${flickerAlpha})`;
        ctx.fillRect(0, 0, w, h);
      }
      if (Math.random() < flickerChance * 0.4) {
        const darkAlpha = Math.random() * 0.15 * t;
        ctx.fillStyle = `rgba(0,0,0,${darkAlpha})`;
        ctx.fillRect(0, 0, w, h);
      }
    }

    if (t > 0.5 && Math.random() < t * 0.03) {
      const glitchY = Math.random() * h;
      const glitchH = 2 + Math.random() * 6;
      ctx.fillStyle = `rgba(255,255,255,${0.08 + Math.random() * 0.12})`;
      ctx.fillRect(0, glitchY, w, glitchH);
    }

    animRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sizeRef.current = { w, h };
    };
    resize();
    window.addEventListener("resize", resize);
    animRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animRef.current);
    };
  }, [animate]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[999]"
      aria-hidden="true"
      style={{ width: "100vw", height: "100vh", display: intensity === 0 ? "none" : "block" }}
    />
  );
}
