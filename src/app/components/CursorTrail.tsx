"use client";

import { useEffect, useRef, useState } from "react";

interface Ghost {
  x: number;
  y: number;
  age: number;
}

export default function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -100, y: -100 });
  const ghostsRef = useRef<Ghost[]>([]);
  const animRef = useRef<number>(0);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const read = () => {
      const v = Number(
        getComputedStyle(document.documentElement).getPropertyValue("--cursor-trail") || "0"
      );
      setEnabled(v > 0);
    };
    read();
    const id = setInterval(read, 200);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const onMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", onMove);

    let lastSpawn = 0;

    const animate = (now: number) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      const m = mouseRef.current;
      if (m.x > 0 && now - lastSpawn > 16) {
        ghostsRef.current.push({ x: m.x, y: m.y, age: 0 });
        lastSpawn = now;
      }

      if (ghostsRef.current.length > 12) {
        ghostsRef.current = ghostsRef.current.slice(-12);
      }

      const textColor = getComputedStyle(document.documentElement)
        .getPropertyValue("--text-color")
        .trim() || "#ffffff";
      const r = parseInt(textColor.slice(1, 3), 16);
      const g = parseInt(textColor.slice(3, 5), 16);
      const b = parseInt(textColor.slice(5, 7), 16);

      for (let i = ghostsRef.current.length - 1; i >= 0; i--) {
        const ghost = ghostsRef.current[i];
        ghost.age += 1;
        const life = 1 - ghost.age / 12;
        if (life <= 0) {
          ghostsRef.current.splice(i, 1);
          continue;
        }
        const size = 8 + (1 - life) * 12;
        const alpha = life * 0.3;
        ctx.beginPath();
        ctx.arc(ghost.x, ghost.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", resize);
      ghostsRef.current = [];
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-997"
      aria-hidden="true"
      style={{ width: "100vw", height: "100vh" }}
    />
  );
}
