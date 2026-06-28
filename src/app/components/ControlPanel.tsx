"use client";

import { useState, useEffect, useRef } from "react";

const PRESETS = ["#0038FF", "#000000", "#FFFFFF", "#E50000", "#E28C00", "#06CA1D", "#06BDCA", "#CA06CA"];

const FONTS = [
  { label: "Aa", cssVar: "--font-inter", name: "inter" },
  { label: "Aa", cssVar: "--font-bricolage", name: "bricolage" },
  { label: "Aa", cssVar: "--font-archivo", name: "archivo" },
  { label: "Aa", cssVar: "--font-inconsolata", name: "inconsolata" },
] as const;

const DEFAULTS = {
  bg: "#0038FF",
  noise: 20,
  noiseSpeed: 5,
  marquee: 20,
  waves: 100,
  borders: 20,
  scanlines: 0,
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
  const [panelVisible, setPanelVisible] = useState(false);
  const [bg, setBg] = useState(DEFAULTS.bg);
  const textColor = textColorForBg(bg);
  const [noise, setNoise] = useState(DEFAULTS.noise);
  const [noiseSpeed, setNoiseSpeed] = useState(DEFAULTS.noiseSpeed);
  const [marquee, setMarquee] = useState(DEFAULTS.marquee);
  const [waves, setWaves] = useState(DEFAULTS.waves);
  const [borders, setBorders] = useState(DEFAULTS.borders);
  const [scanlines, setScanlines] = useState(DEFAULTS.scanlines);
  const [font, setFont] = useState("inter");
  const [align, setAlign] = useState<"left" | "center" | "right">("left");
  const [toastMounted, setToastMounted] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isMobile, setIsMobile] = useState(true);
  const panelRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const mqDesktop = window.matchMedia("(min-width: 1024px)");
    const mqMobile = window.matchMedia("(max-width: 767px)");
    setIsDesktop(mqDesktop.matches);
    setIsMobile(mqMobile.matches);
    const onDesktop = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    const onMobile = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mqDesktop.addEventListener("change", onDesktop);
    mqMobile.addEventListener("change", onMobile);
    return () => {
      mqDesktop.removeEventListener("change", onDesktop);
      mqMobile.removeEventListener("change", onMobile);
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has("bg")) setBg(params.get("bg")!);
    if (params.has("n")) setNoise(Number(params.get("n")));
    if (params.has("ns")) setNoiseSpeed(Number(params.get("ns")));
    if (params.has("w")) setWaves(Number(params.get("w")));
    if (params.has("b")) setBorders(Number(params.get("b")));
    if (params.has("sl")) setScanlines(Number(params.get("sl")));
    if (params.has("f")) setFont(params.get("f")!);
    if (params.has("a")) setAlign(params.get("a") as "left" | "center" | "right");
  }, []);

  function togglePanel() {
    if (open) {
      closePanel();
    } else {
      if (closeTimer.current) clearTimeout(closeTimer.current);
      setOpen(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setPanelVisible(true)));
    }
  }

  function closePanel() {
    setPanelVisible(false);
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 350);
  }

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (
        panelRef.current?.contains(e.target as Node) ||
        btnRef.current?.contains(e.target as Node)
      ) return;
      closePanel();
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  useEffect(() => {
    if (open && isMobile) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [open, isMobile]);

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
    root.style.setProperty("--scanlines", String(scanlines));
    const activeFont = FONTS.find((f) => f.name === font);
    if (activeFont) {
      const fontValue = getComputedStyle(document.body).getPropertyValue(activeFont.cssVar).trim();
      root.style.setProperty("--active-font", fontValue);
    }
    const bgLum = luminance(bg);
    const textLum = luminance(textColor);
    root.style.setProperty("--duotone-highlight", bgLum > textLum ? bg : textColor);
    root.style.setProperty("--duotone-shadow", bgLum > textLum ? textColor : bg);
    const borderRgb = textColor === "#ffffff" ? "255, 255, 255" : "0, 0, 0";
    root.style.setProperty("--border-color", `rgba(${borderRgb}, ${borders / 100})`);
    const borderVal = `1px solid rgba(${borderRgb}, ${borders / 100})`;
    const ml = align === "left" ? "0px" : align === "center" ? "calc(50vw - 320px)" : "calc(100vw - 640px)";
    root.style.setProperty("--container-ml", ml);
    root.style.setProperty("--container-mr", "0");
    root.style.setProperty("--container-bl", align === "left" ? "none" : borderVal);
    root.style.setProperty("--container-br", align === "right" ? "none" : borderVal);
    root.setAttribute("data-align", align);
    document.body.style.background = bg;
    document.body.style.color = textColor;
  }, [bg, noise, noiseSpeed, marquee, waves, borders, scanlines, font, align]);

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
    setScanlines(Math.random() > 0.5 ? Math.floor(Math.random() * 80) : 0);
  }

  function share() {
    const params = new URLSearchParams({
      bg, n: String(noise), ns: String(noiseSpeed), w: String(waves),
      b: String(borders), sl: String(scanlines),
      f: font, a: align,
    });
    const url = `${window.location.origin}${window.location.pathname}?${params}`;
    const copyPromise = navigator.clipboard?.writeText(url) ?? new Promise<void>((resolve) => {
      const textarea = document.createElement("textarea");
      textarea.value = url;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      resolve();
    });
    copyPromise.then(() => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
      setToastMounted(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setToastVisible(true)));
      toastTimer.current = setTimeout(() => {
        setToastVisible(false);
        toastTimer.current = setTimeout(() => setToastMounted(false), 350);
      }, 2000);
    });
  }

  function reset() {
    setBg(DEFAULTS.bg);
    setNoise(DEFAULTS.noise);
    setNoiseSpeed(DEFAULTS.noiseSpeed);
    setWaves(DEFAULTS.waves);
    setBorders(DEFAULTS.borders);
    setScanlines(DEFAULTS.scanlines);
    setFont("inter");
    setAlign("left");
  }

  const panelContent = (
    <>
      <div className="mb-4">
        <div className="flex justify-between mb-1.5">
          <span>Background</span>
        </div>
        <div className="grid grid-cols-9 gap-2.5">
          {PRESETS.map((color) => (
            <button
              key={color}
              onClick={() => setBg(color)}
              className="aspect-square transition-transform hover:scale-110"
              style={{
                background: color,
                borderRadius: 3,
                border: "1px solid var(--border-color)",
                boxShadow: `0 0 0 2px var(--bg-color), 0 0 0 3px ${bg === color ? textColor : "var(--border-color)"}`,
              }}
            />
          ))}
          <label
            className="aspect-square cursor-pointer overflow-hidden flex items-center justify-center"
            style={{
              borderRadius: 3,
              border: "none",
              boxShadow: "0 0 0 1px var(--border-color)",
            }}
          >
            <input
              type="color"
              value={bg}
              onChange={(e) => setBg(e.target.value)}
              className="opacity-0 w-0 h-0 absolute"
            />
            <span className="text-lg leading-none opacity-60">+</span>
          </label>
        </div>
      </div>

      <Slider label="Borders" value={borders} onChange={setBorders} min={0} max={100} suffix="%" />
      <Slider label="Noise" value={noise} onChange={setNoise} min={0} max={80} suffix="%" />
      <Slider label="Noise speed" value={noiseSpeed} onChange={setNoiseSpeed} min={1} max={25} suffix="fps" />
      <Slider label="Sound waves" value={waves} onChange={setWaves} min={0} max={200} suffix="%" />
      <Slider label="Scanlines" value={scanlines} onChange={setScanlines} min={0} max={100} suffix="%" />

      <div className="mt-4 mb-4">
        <div className="mb-1.5">
          <span>Typeface</span>
        </div>
        <div className="flex gap-2">
          {FONTS.map((f) => (
            <button
              key={f.name}
              onClick={() => setFont(f.name)}
              className={`flex-1 h-[34px] flex items-center justify-center ${font === f.name ? "" : "opacity-60"} hover:opacity-100 transition-opacity`}
              style={{
                border: `1px solid ${font === f.name ? textColor : "var(--border-color)"}`,
                borderRadius: 4,
                fontFamily: `var(${f.cssVar})`,
                fontSize: 13,
              }}
            >
              {f.label}
            </button>
          ))}
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

      <div className="pt-4 -mx-4 px-4 lg:-mx-4 lg:px-4 flex gap-2" style={{ borderTop: "1px solid var(--border-color)" }}>
        <button
          onClick={randomize}
          className="flex-1 h-[34px] flex items-center justify-center gap-1.5 rounded-[4px] opacity-60 hover:opacity-100 transition-opacity"
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
          className="flex-1 h-[34px] flex items-center justify-center gap-1.5 rounded-[4px] opacity-60 hover:opacity-100 transition-opacity"
          style={{ border: "1px solid var(--border-color)" }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
          <span>Reset</span>
        </button>
        <button
          onClick={share}
          className="h-[34px] flex items-center justify-center px-3 rounded-[4px] opacity-60 hover:opacity-100 transition-opacity"
          style={{ border: "1px solid var(--border-color)" }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
        </button>
      </div>
    </>
  );

  return (
    <>
      {toastMounted && (
        <div
          className="fixed bottom-6 z-100 text-xs px-4 py-2 rounded-[4px]"
          style={{
            left: "50%",
            marginLeft: "-110px",
            width: 220,
            textAlign: "center",
            background: "var(--text-color)",
            color: "var(--bg-color)",
            transition: "opacity 0.35s, transform 0.35s",
            opacity: toastVisible ? 1 : 0,
            transform: toastVisible ? "translateY(0)" : "translateY(20px)",
          }}
        >
          Link copied to clipboard
        </div>
      )}

      <button
        ref={btnRef}
        onClick={togglePanel}
        className="fixed top-[24px] right-[16px] w-[32px] h-[32px] rounded-[4px] lg:top-[34px] lg:w-[40px] lg:h-[40px] z-70 flex items-center justify-center hover:opacity-100 transition-opacity control-btn-glow"
        style={{
          border: "1px solid rgba(255,255,255,0.5)",
          background: "linear-gradient(160deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 100%)",
          color: "var(--text-color)",
          WebkitBackdropFilter: "blur(8px)",
          backdropFilter: "blur(8px)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.2), inset 0 1px 1px rgba(255,255,255,0.6)",
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
        <>
          {isMobile && (
            <div
              className="fixed inset-0 z-50"
              style={{
                background: "rgba(0, 0, 0, 0.5)",
                transition: "opacity 0.35s",
                opacity: panelVisible ? 1 : 0,
              }}
              onClick={closePanel}
            />
          )}

          <div
            ref={panelRef}
            className={
              isMobile
                ? "fixed bottom-0 left-0 right-0 z-60 px-5 pt-2 pb-8 text-xs"
                : "fixed z-60 w-[350px] p-4 text-xs rounded-[4px] control-btn-glow"
            }
            style={{
              background: "var(--bg-color)",
              color: "var(--text-color)",
              transition: isMobile
                ? "opacity 0.35s, transform 0.35s"
                : "opacity 0.35s, transform 0.35s, left 0.4s ease",
              opacity: panelVisible ? 1 : 0,
              transform: panelVisible
                ? "translateY(0)"
                : isMobile
                  ? "translateY(100%)"
                  : "translateY(8px)",
              ...(isMobile
                ? {
                    borderTop: "1px solid var(--border-color)",
                    borderRadius: "12px 12px 0 0",
                    maxHeight: "85vh",
                    overflowY: "auto" as const,
                  }
                : {
                    border: "1px solid var(--border-color)",
                    top: isDesktop ? 82 : 64,
                    right: isDesktop ? "auto" : 16,
                    ...(isDesktop
                      ? {
                          left: align === "left" ? 274 : align === "center" ? "calc(50vw - 46px)" : "calc(100vw - 366px)",
                        }
                      : {}),
                  }),
            }}
          >
            <div className={isMobile ? "mb-4 mt-2" : "mb-4"}>
              <span className="font-medium text-xs" style={{ letterSpacing: "0.04em" }}>
                CONTROLS
              </span>
            </div>

            {panelContent}
          </div>
        </>
      )}
    </>
  );
}
