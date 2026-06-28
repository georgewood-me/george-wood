"use client";

import { useEffect, useState } from "react";

export default function ScanLines() {
  const [intensity, setIntensity] = useState(0);

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

  if (intensity === 0) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[999]"
      aria-hidden="true"
      style={{
        background: `repeating-linear-gradient(
          0deg,
          transparent,
          transparent 2px,
          rgba(0, 0, 0, ${0.06 * (intensity / 100)}) 2px,
          rgba(0, 0, 0, ${0.06 * (intensity / 100)}) 4px
        )`,
        animation: intensity > 50 ? "scanline-flicker 0.1s infinite" : undefined,
        opacity: intensity / 100,
      }}
    />
  );
}
