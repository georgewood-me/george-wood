"use client";

import { useState, useEffect } from "react";

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
      <div className="flex justify-between mb-1.5">
        <span className="opacity-60">{label}</span>
        <span className="opacity-40">
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

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--bg-color", bg);
    root.style.setProperty("--text-color", textColor);
    root.style.setProperty("--svg-invert", textColor === "#000000" ? "1" : "0");
    root.style.setProperty("--noise-opacity", String(noise / 100));
    root.style.setProperty("--noise-speed", String(noiseSpeed));
    root.style.setProperty("--marquee-duration", `${marquee}s`);
    root.style.setProperty("--wave-intensity", String(waves / 100));
    const borderRgb = textColor === "#ffffff" ? "255, 255, 255" : "0, 0, 0";
    root.style.setProperty("--border-color", `rgba(${borderRgb}, ${borders / 100})`);
    document.body.style.background = bg;
    document.body.style.color = textColor;
  }, [bg, noise, noiseSpeed, marquee, waves, borders]);

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
  }

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="control-edge fixed top-[24px] right-[16px] w-[32px] h-[32px] rounded-[4px] lg:rounded-none lg:top-[34px] lg:left-[640px] lg:right-auto lg:w-[40px] lg:h-[40px] z-60 flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity"
        style={{
          border: "1px solid var(--border-color)",
          background: "var(--bg-color)",
          color: "var(--text-color)",
        }}
        aria-label="Toggle control panel"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <line x1="4" y1="21" x2="4" y2="14" />
          <line x1="4" y1="10" x2="4" y2="3" />
          <line x1="12" y1="21" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12" y2="3" />
          <line x1="20" y1="21" x2="20" y2="16" />
          <line x1="20" y1="12" x2="20" y2="3" />
          <line x1="1" y1="14" x2="7" y2="14" />
          <line x1="9" y1="8" x2="15" y2="8" />
          <line x1="17" y1="16" x2="23" y2="16" />
        </svg>
      </button>

      {open && (
        <div
          className="control-edge fixed top-[64px] right-[16px] lg:top-[82px] lg:left-[640px] lg:right-auto z-60 w-[260px] p-4 text-xs"
          style={{
            border: "1px solid var(--border-color)",
            background: "var(--bg-color)",
            color: "var(--text-color)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <span
              className="font-medium text-xs"
              style={{ letterSpacing: "0.04em", opacity: 0.6 }}
            >
              CONTROLS
            </span>
            <div className="flex gap-3">
              <button
                onClick={randomize}
                className="opacity-60 hover:opacity-100 transition-opacity"
              >
                Random
              </button>
              <button
                onClick={reset}
                className="opacity-60 hover:opacity-100 transition-opacity"
              >
                Reset
              </button>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between mb-1.5">
              <span className="opacity-60">Background</span>
            </div>
            <div className="flex gap-1.5 items-center">
              {PRESETS.map((color) => (
                <button
                  key={color}
                  onClick={() => setBg(color)}
                  className="w-5 h-5 transition-transform hover:scale-110 shrink-0"
                  style={{
                    background: color,
                    borderRadius: 4,
                    border:
                      bg === color
                        ? `2px solid ${textColor}`
                        : "1px solid var(--border-color)",
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
                <span className="w-full h-full flex items-center justify-center text-[8px] leading-none opacity-60">
                  +
                </span>
              </label>
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
        </div>
      )}
    </>
  );
}
