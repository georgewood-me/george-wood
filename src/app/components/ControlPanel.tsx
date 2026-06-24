"use client";

import { useState, useEffect, useRef } from "react";

const PRESETS = ["#0038FF", "#000000", "#E50000", "#E28C00", "#06CA1D", "#06BDCA", "#CA06CA"];

const DEFAULTS = {
  bg: "#0038FF",
  noise: 20,
  noiseSpeed: 5,
  marquee: 20,
  waves: 100,
  borders: 20,
};

function luminance(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const toLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function textColorForBg(bg: string) {
  return luminance(bg) > 0.179 ? "#000000" : "#ffffff";
}

function Slider({
  label,
  value,
  onChange,
  min,
  max,
  suffix = "",
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  suffix?: string;
}) {
  return (
    <div className="mb-3">
      <div className="flex justify-between mb-0.5">
        <span>{label}</span>
        <span className="opacity-60">
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="control-slider"
      />
    </div>
  );
}

export default function ControlPanel() {
  const [open, setOpen] = useState(false);
  const [bg, setBg] = useState(DEFAULTS.bg);
  const textColor = textColorForBg(bg);
  const [noise, setNoise] = useState(DEFAULTS.noise);
  const [noiseSpeed, setNoiseSpeed] = useState(DEFAULTS.noiseSpeed);
  const [marquee, setMarquee] = useState(DEFAULTS.marquee);
  const [waves, setWaves] = useState(DEFAULTS.waves);
  const [borders, setBorders] = useState(DEFAULTS.borders);
  const [align, setAlign] = useState<"left" | "center" | "right">("left");
  const [isDesktop, setIsDesktop] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (
        panelRef.current?.contains(e.target as Node) ||
        btnRef.current?.contains(e.target as Node)
      ) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--bg-color", bg);
    root.style.setProperty("--bg-color-translucent", `${bg}B3`);
    root.style.setProperty("--text-color", textColor);
    root.style.setProperty("--svg-invert", textColor === "#000000" ? "1" : "0");
    root.style.setProperty("--noise-opacity", String(noise / 100));
    root.style.setProperty("--noise-speed", String(noiseSpeed));
    root.style.setProperty("--marquee-duration", `${marquee}s`);
    root.style.setProperty("--wave-intensity", String(waves / 100));
    const borderRgb = textColor === "#ffffff" ? "255, 255, 255" : "0, 0, 0";
    const borderVal = `1px solid rgba(${borderRgb}, ${borders / 100})`;
    root.style.setProperty("--border-color", `rgba(${borderRgb}, ${borders / 100})`);
    const ml = align === "left" ? "0px" : align === "center" ? "calc(50vw - 320px)" : "calc(100vw - 640px)";
    root.style.setProperty("--container-ml", ml);
    root.style.setProperty("--container-mr", "0");
    root.style.setProperty("--container-bl", align === "left" ? "none" : borderVal);
    root.style.setProperty("--container-br", align === "right" ? "none" : borderVal);
    root.setAttribute("data-align", align);
    document.body.style.background = bg;
    document.body.style.color = textColor;
  }, [bg, noise, noiseSpeed, marquee, waves, borders, align]);

  function randomize() {
    setBg(
      `#${Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, "0")}`
    );
    setNoise(Math.floor(Math.random() * 50));
    setNoiseSpeed(1 + Math.floor(Math.random() * 24));
    setWaves(Math.floor(Math.random() * 200));
    setBorders(5 + Math.floor(Math.random() * 45));
  }

  function reset() {
    setBg(DEFAULTS.bg);
    setNoise(DEFAULTS.noise);
    setNoiseSpeed(DEFAULTS.noiseSpeed);
    setWaves(DEFAULTS.waves);
    setBorders(DEFAULTS.borders);
    setAlign("left");
  }

  return (
    <>
      <button
        ref={btnRef}
        onClick={() => setOpen(!open)}
        className="fixed top-[24px] right-[16px] w-[32px] h-[32px] rounded-[4px] lg:top-[34px] lg:w-[40px] lg:h-[40px] z-40 flex items-center justify-center hover:opacity-100 transition-opacity"
        style={{
          border: "1px solid var(--border-color)",
          background: "var(--bg-color-translucent)",
          color: "var(--text-color)",
          WebkitBackdropFilter: "blur(1px)",
          backdropFilter: "blur(1px)",
          ...(isDesktop ? {
            left: align === "left" ? 584 : align === "center" ? "calc(50vw + 264px)" : "calc(100vw - 56px)",
            right: "auto",
            transition: "left 0.4s ease",
          } : {}),
        }}
        aria-label="Toggle control panel"
      >
        {open ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="4" y1="4" x2="20" y2="20" />
            <line x1="20" y1="4" x2="4" y2="20" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="4" y1="21" x2="4" y2="3" />
            <line x1="12" y1="21" x2="12" y2="3" />
            <line x1="20" y1="21" x2="20" y2="3" />
            <line x1="1" y1="14" x2="7" y2="14" className="slider-bob-1" />
            <line x1="9" y1="8" x2="15" y2="8" className="slider-bob-2" />
            <line x1="17" y1="16" x2="23" y2="16" className="slider-bob-3" />
          </svg>
        )}
      </button>

      {open && (
        <div
          ref={panelRef}
          className="fixed top-[64px] right-[16px] lg:top-[82px] z-60 w-[260px] p-4 text-xs rounded-[4px]"
          style={{
            border: "1px solid var(--border-color)",
            background: "var(--bg-color)",
            color: "var(--text-color)",
            ...(isDesktop ? {
              left: align === "left" ? 364 : align === "center" ? "calc(50vw + 44px)" : "calc(100vw - 276px)",
              right: "auto",
              transition: "left 0.4s ease",
            } : {}),
          }}
        >
          <div className="mb-4">
            <span
              className="font-medium text-xs"
              style={{ letterSpacing: "0.04em" }}
            >
              CONTROLS
            </span>
          </div>

          <div className="mb-4">
            <div className="flex justify-between mb-1.5">
              <span>Background</span>
            </div>
            <div className="flex gap-1.5 items-center">
              {PRESETS.map((color) => (
                <button
                  key={color}
                  onClick={() => setBg(color)}
                  className="w-5 h-5 transition-transform hover:scale-110 shrink-0"
                  style={{
                    background: color,
                    borderRadius: 2,
                    border: `1px solid ${bg === color ? textColor : "var(--border-color)"}`,
                  }}
                />
              ))}
              <label
                className="w-5 h-5 rounded-full shrink-0 cursor-pointer overflow-hidden"
                style={{ border: "1px solid var(--border-color)" }}
              >
                <input
                  type="color"
                  value={bg}
                  onChange={(e) => setBg(e.target.value)}
                  className="opacity-0 w-0 h-0 absolute"
                />
                <span className="w-full h-full flex items-center justify-center text-base leading-none opacity-60" style={{ marginTop: -1 }}>
                  +
                </span>
              </label>
            </div>
          </div>

          <div className="mb-4 hidden lg:block">
            <div className="mb-1.5">
              <span>Container</span>
            </div>
            <div className="flex gap-2">
              {(["left", "center", "right"] as const).map((option) => {
                const highlight = option === "left" ? 0 : option === "center" ? 1 : 2;
                return (
                  <button
                    key={option}
                    onClick={() => setAlign(option)}
                    className={`flex-1 h-[34px] flex items-center justify-center gap-[1.5px] ${align === option ? "" : "opacity-60"} hover:opacity-100 transition-opacity`}
                    style={{
                      border: `1px solid ${align === option ? textColor : "var(--border-color)"}`,
                      borderRadius: 4,
                    }}
                  >
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        style={{
                          display: "block",
                          width: 3,
                          height: 10,
                          borderRadius: 1,
                          background: "currentColor",
                          opacity: i === highlight ? 1 : 0.25,
                        }}
                      />
                    ))}
                  </button>
                );
              })}
            </div>
          </div>

          <Slider
            label="Noise"
            value={noise}
            onChange={setNoise}
            min={0}
            max={80}
            suffix="%"
          />
          <Slider
            label="Noise speed"
            value={noiseSpeed}
            onChange={setNoiseSpeed}
            min={1}
            max={25}
            suffix="fps"
          />
          <Slider
            label="Sound waves"
            value={waves}
            onChange={setWaves}
            min={0}
            max={200}
            suffix="%"
          />
          <Slider
            label="Borders"
            value={borders}
            onChange={setBorders}
            min={0}
            max={100}
            suffix="%"
          />

          <div className="flex gap-2 mt-4">
            <button
              onClick={randomize}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-[4px] opacity-60 hover:opacity-100 transition-opacity"
              style={{ border: "1px solid var(--border-color)" }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 3h5v5" />
                <path d="M4 20L21 3" />
                <path d="M21 16v5h-5" />
                <path d="M15 15l6 6" />
                <path d="M4 4l5 5" />
              </svg>
              <span>Random</span>
            </button>
            <button
              onClick={reset}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-[4px] opacity-60 hover:opacity-100 transition-opacity"
              style={{ border: "1px solid var(--border-color)" }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
              <span>Reset</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
