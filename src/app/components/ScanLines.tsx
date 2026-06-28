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

  const t = intensity / 100;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[999]"
      aria-hidden="true"
      style={{
        background: `repeating-linear-gradient(
          0deg,
          transparent,
          transparent 2px,
          rgba(0, 0, 0, ${0.06 * t}) 2px,
          rgba(0, 0, 0, ${0.06 * t}) 4px
        )`,
        animation: t > 0.2 ? `scanline-flicker ${0.08 - t * 0.04}s infinite` : undefined,
        opacity: t,
      }}
    />
  );
}
