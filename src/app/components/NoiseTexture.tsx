"use client";

import { useEffect, useRef } from "react";

export default function NoiseTexture() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const size = 128;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imageData = ctx.createImageData(size, size);
    const pixels = imageData.data;
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

      for (let i = 0; i < pixels.length; i += 4) {
        const v = Math.random() * 255;
        pixels[i] = v;
        pixels[i + 1] = v;
        pixels[i + 2] = v;
        pixels[i + 3] = 255;
      }
      ctx!.putImageData(imageData, 0, 0);
    }

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50 w-full h-full noise-layer"
      style={{ imageRendering: "pixelated" }}
      aria-hidden="true"
    />
  );
}
