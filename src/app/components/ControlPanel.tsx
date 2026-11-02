"use client";

import { useState, useEffect, useRef } from "react";
import ColourPicker from "./ColourPicker";

export const PRESETS = ["#0038FF", "#000000", "#FFFFFF", "#E50000", "#E28C00", "#06CA1D", "#06BDCA", "#CA06CA"];

const FONTS = [
  { label: "Inter", cssVar: "--font-inter", name: "inter", features: '"cv05", "ss03"' },
  { label: "Geist", cssVar: "--font-geist", name: "geist", features: "normal" },
  { label: "Switzer", cssVar: "--font-switzer", name: "switzer", features: "normal" },
  { label: "Bricolage", cssVar: "--font-bricolage", name: "bricolage", features: "normal" },
  { label: "Archivo Narrow", cssVar: "--font-archivo", name: "archivo", features: "normal" },
  { label: "Inconsolata", cssVar: "--font-inconsolata", name: "inconsolata", features: "normal" },
] as const;

type Finish = "flat" | "glass";

const FINISHES: { name: Finish; label: string; param: string }[] = [
  { name: "flat", label: "Flat", param: "0" },
  { name: "glass", label: "Frosted", param: "1" },
];

const DEFAULTS = {
  bg: "#0038FF",
  noise: 20,
  noiseSpeed: 0,
  waves: 100,
  borders: 20,
  scanlines: 0,
  cursorTrail: 0,
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
    <div>
      <div className="flex items-baseline justify-between">
        <span>{label}</span>
        <span className="panel-value">
          {value}
          {suffix}
        </span>
      </div>
      {/* The line sits 12px under the label, clear of the thumb; the rest of the 32px hit area overlaps the gaps */}
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="control-slider -mt-1 -mb-4"
        aria-label={label}
      />
    </div>
  );
}

export default function ControlPanel({ containerWidth = 640, desktopTop = 34 }: { containerWidth?: number; desktopTop?: number }) {
  const [open, setOpen] = useState(false);
  const [panelVisible, setPanelVisible] = useState(false);
  const [bg, setBg] = useState(DEFAULTS.bg);
  const textColor = textColorForBg(bg);
  const [noise, setNoise] = useState(DEFAULTS.noise);
  const [noiseSpeed, setNoiseSpeed] = useState(DEFAULTS.noiseSpeed);
  const [waves, setWaves] = useState(DEFAULTS.waves);
  const [borders, setBorders] = useState(DEFAULTS.borders);
  const [scanlines, setScanlines] = useState(DEFAULTS.scanlines);
  const [cursorTrail, setCursorTrail] = useState(DEFAULTS.cursorTrail);
  const [font, setFont] = useState("inter");
  const [align, setAlign] = useState<"left" | "center" | "right">("left");
  const [finish, setFinish] = useState<Finish>("flat");
  const [pickerOpen, setPickerOpen] = useState(false);
  const gloss = finish === "glass";
  const flat = finish === "flat";
  const [toastMounted, setToastMounted] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
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
    if (params.has("ct")) setCursorTrail(Number(params.get("ct")));
    if (params.has("f")) setFont(params.get("f")!);
    if (params.has("a")) setAlign(params.get("a") as "left" | "center" | "right");
    if (params.has("g")) setFinish(FINISHES.find((f) => f.param === params.get("g"))?.name ?? "flat");
  }, []);

  function openPanel() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setPanelVisible(true)));
  }

  function togglePanel() {
    if (open) {
      closePanel();
    } else {
      openPanel();
    }
  }

  // Lets other parts of the page (like the bento's "Make it yours" tile) drive the panel
  useEffect(() => {
    const onSetBg = (e: Event) => setBg((e as CustomEvent<string>).detail);
    window.addEventListener("controls:set-bg", onSetBg);
    window.addEventListener("controls:open", openPanel);
    return () => {
      window.removeEventListener("controls:set-bg", onSetBg);
      window.removeEventListener("controls:open", openPanel);
    };
  }, []);

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
    root.style.setProperty("--wave-intensity", String(waves / 100));
    root.style.setProperty("--scanlines", String(scanlines));
    root.style.setProperty("--cursor-trail", String(cursorTrail));
    root.setAttribute("data-cursor-trail", String(cursorTrail > 0));
    const activeFont = FONTS.find((f) => f.name === font);
    if (activeFont) {
      const fontValue = getComputedStyle(document.body).getPropertyValue(activeFont.cssVar).trim();
      root.style.setProperty("--active-font", fontValue);
      root.style.setProperty("--active-features", activeFont.features);
    }
    const bgLum = luminance(bg);
    const textLum = luminance(textColor);
    root.style.setProperty("--duotone-highlight", bgLum > textLum ? bg : textColor);
    root.style.setProperty("--duotone-shadow", bgLum > textLum ? textColor : bg);
    const borderRgb = textColor === "#ffffff" ? "255, 255, 255" : "0, 0, 0";
    root.style.setProperty("--border-color", `rgba(${borderRgb}, ${borders / 100})`);
    const borderVal = `1px solid rgba(${borderRgb}, ${borders / 100})`;
    const half = containerWidth / 2;
    const ml = align === "left" ? "0px" : align === "center" ? `max(0px, calc(50vw - ${half}px))` : `max(0px, calc(100vw - ${containerWidth}px))`;
    root.style.setProperty("--container-ml", ml);
    root.style.setProperty("--container-mr", "0");
    root.style.setProperty("--container-bl", align === "left" ? "none" : borderVal);
    root.setAttribute("data-align", align);
    root.setAttribute("data-gloss", String(gloss));
    document.body.style.background = bg;
    document.body.style.color = textColor;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", bg);
    window.dispatchEvent(new CustomEvent("controls:change", { detail: { bg } }));
  }, [bg, noise, noiseSpeed, waves, borders, scanlines, cursorTrail, font, align, finish, containerWidth]);

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
      b: String(borders), sl: String(scanlines), ct: String(cursorTrail),
      f: font, a: align, g: FINISHES.find((f) => f.name === finish)!.param,
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
    copyPromise.then(() => showToast("Link copied to clipboard"));
  }

  function showToast(message: string) {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToastMessage(message);
    setToastMounted(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setToastVisible(true)));
    toastTimer.current = setTimeout(() => {
      setToastVisible(false);
      toastTimer.current = setTimeout(() => setToastMounted(false), 350);
    }, 2000);
  }

  function reset() {
    setBg(DEFAULTS.bg);
    setNoise(DEFAULTS.noise);
    setNoiseSpeed(DEFAULTS.noiseSpeed);
    setWaves(DEFAULTS.waves);
    setBorders(DEFAULTS.borders);
    setScanlines(DEFAULTS.scanlines);
    setCursorTrail(DEFAULTS.cursorTrail);
    setFont("inter");
    setAlign("left");
    setFinish("flat");
  }

  const panelContent = (
    <>
      <div className="mb-5">
        <div className="tile-label mb-2">Background</div>
        <div className="grid grid-cols-9 gap-2">
          {PRESETS.map((color) => (
            <button
              key={color}
              onClick={() => setBg(color)}
              aria-pressed={bg === color}
              className="glass-swatch aspect-square transition-opacity hover:opacity-80"
              style={{
                background: color,
                borderRadius: 4,
                border: "1px solid var(--border-color)",
                boxShadow: `0 0 0 2px var(--bg-color), 0 0 0 3px ${bg === color ? `color-mix(in srgb, ${textColor} 60%, transparent)` : "var(--border-color)"}`,
              }}
            />
          ))}
          <button
            onClick={() => setPickerOpen((o) => !o)}
            aria-expanded={pickerOpen}
            aria-label="Pick a custom colour"
            className="aspect-square flex items-center justify-center transition-opacity hover:opacity-80"
            style={{
              borderRadius: 4,
              border: "1px solid var(--border-color)",
              // Ringed like a selected swatch while the picker is open or a custom colour is in use
              boxShadow: pickerOpen || !PRESETS.includes(bg) ? `0 0 0 2px var(--bg-color), 0 0 0 3px color-mix(in srgb, ${textColor} 60%, transparent)` : undefined,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="opacity-80" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>
        {/* Grows open from nothing to its full height and fades in, rather than appearing at once.
            The inner padding leaves room for the field's thumb at the edges while it's clipped. */}
        <div
          className="grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none"
          style={{ gridTemplateRows: pickerOpen ? "1fr" : "0fr", opacity: pickerOpen ? 1 : 0 }}
          inert={!pickerOpen}
        >
          <div className="min-h-0 overflow-hidden -mx-2 px-2">
            <ColourPicker value={bg} onChange={setBg} />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 mb-5">
      <Slider label="Borders" value={borders} onChange={setBorders} min={0} max={100} suffix="%" />
      <Slider label="Noise" value={noise} onChange={setNoise} min={0} max={80} suffix="%" />
      <Slider label="Noise speed" value={noiseSpeed} onChange={setNoiseSpeed} min={0} max={25} suffix="fps" />
      <Slider label="Motion" value={waves} onChange={setWaves} min={0} max={200} suffix="%" />
      <Slider label="Scanlines" value={scanlines} onChange={setScanlines} min={0} max={100} suffix="%" />
      </div>

      <div className="mb-5">
        <div className="tile-label mb-2">Typeface</div>
        <div className="grid grid-cols-3 gap-2">
          {FONTS.map((f) => (
            <button
              key={f.name}
              onClick={() => setFont(f.name)}
              aria-pressed={font === f.name}
              className={`glass-btn flex-1 h-9 flex items-center justify-center ${font === f.name ? "" : "opacity-60"} hover:opacity-100`}
              style={{
                borderRadius: 4,
                fontFamily: `var(${f.cssVar})`,
                fontSize: 13,
                ...(font === f.name ? { border: "1px solid color-mix(in srgb, var(--text-color) 60%, transparent)" } : {}),
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-5 hidden lg:block">
        <div className="tile-label mb-2">Container</div>
        <div className="flex gap-2">
          {(["left", "center", "right"] as const).map((option) => {
            const highlight = option === "left" ? 0 : option === "center" ? 1 : 2;
            return (
              <button
                key={option}
                onClick={() => setAlign(option)}
                aria-pressed={align === option}
                className={`glass-btn flex-1 h-9 flex items-center justify-center gap-[1.5px] ${align === option ? "" : "opacity-60"} hover:opacity-100`}
                style={{ borderRadius: 4, ...(align === option ? { border: "1px solid color-mix(in srgb, var(--text-color) 60%, transparent)" } : {}) }}
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
    </>
  );

  // The action bar stays pinned to the bottom of the panel; only the settings above it scroll
  const panelFooter = (
    <>
      <div className={`shrink-0 flex gap-2 px-5 pt-5 ${isMobile ? "pb-8" : "pb-5"}`} style={{ borderTop: "1px solid var(--border-color)" }}>
        <button
          onClick={randomize}
          className="glass-btn flex-1 h-9 flex items-center justify-center gap-1.5 rounded-[4px] opacity-60 hover:opacity-100"
          style={{ borderRadius: 4 }}
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
          className="glass-btn flex-1 h-9 flex items-center justify-center gap-1.5 rounded-[4px] opacity-60 hover:opacity-100"
          style={{ borderRadius: 4 }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
          <span>Reset</span>
        </button>
        {isDesktop && (
          <button
            onClick={() => setCursorTrail(cursorTrail > 0 ? 0 : 100)}
            className={`glass-btn h-9 flex items-center justify-center px-3 rounded-[4px] hover:opacity-100 ${cursorTrail > 0 ? "" : "opacity-60"}`}
            aria-label="Toggle cursor trail"
            aria-pressed={cursorTrail > 0}
            style={{ borderRadius: 4, ...(cursorTrail > 0 ? { border: "1px solid color-mix(in srgb, var(--text-color) 60%, transparent)" } : {}) }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4l7.07 17 2.51-7.39L21 11.07z" />
            </svg>
          </button>
        )}
        <button
          onClick={() => { closePanel(); showToast("Settings saved"); }}
          className="glass-btn h-9 flex items-center justify-center px-3 rounded-[4px] opacity-60 hover:opacity-100"
          aria-label="Save settings"
          style={{ borderRadius: 4 }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
          </svg>
        </button>
        <button
          onClick={share}
          className="glass-btn h-9 flex items-center justify-center px-3 rounded-[4px] opacity-60 hover:opacity-100"
          aria-label="Copy share link"
          style={{ borderRadius: 4 }}
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
          className="fixed bottom-6 z-100 text-xs pl-3 pr-4 py-2 rounded-[4px] flex items-center justify-center gap-2 whitespace-nowrap"
          style={{
            left: "50%",
            background: "var(--text-color)",
            color: "var(--bg-color)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
            transition: "opacity 0.35s, transform 0.35s",
            opacity: toastVisible ? 1 : 0,
            transform: toastVisible ? "translateX(-50%)" : "translateX(-50%) translateY(20px)",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
          {toastMessage}
        </div>
      )}

      <button
        ref={btnRef}
        onClick={togglePanel}
        className="glass-surface fixed top-[20px] right-[16px] w-[40px] h-[40px] rounded-[4px] z-70 flex items-center justify-center hover:opacity-100 transition-opacity"
        style={{
          color: "var(--text-color)",
          ...(!flat ? {} : {
            border: "1px solid var(--border-color)",
            background: "var(--bg-color)",
          }),
          ...(isDesktop ? {
            left: align === "left" ? `min(${containerWidth - 56}px, calc(100vw - 56px))` : align === "center" ? `calc(min(50vw + ${containerWidth / 2}px, 100vw) - 56px)` : "calc(100vw - 56px)",
            top: desktopTop,
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
            <line x1="1" y1="14" x2="7" y2="14" />
            <line x1="9" y1="8" x2="15" y2="8" />
            <line x1="17" y1="16" x2="23" y2="16" />
          </svg>
        )}
      </button>

      {open && (
        <>
          {isMobile && (
            <div
              className="fixed inset-0 z-50"
              style={{
                background: gloss ? "rgba(0, 0, 0, 0.15)" : "rgba(0, 0, 0, 0.5)",
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
                ? "glass-surface fixed bottom-0 left-0 right-0 z-60 flex flex-col overflow-hidden text-xs"
                : "glass-surface fixed z-60 w-[350px] flex flex-col overflow-hidden text-xs rounded-[4px]"
            }
            style={{
              color: "var(--text-color)",
              ...(!flat ? {} : { backgroundColor: "var(--bg-color)" }),
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
                    ...(!flat ? {} : { borderTop: "1px solid var(--border-color)" }),
                    borderRadius: "12px 12px 0 0",
                    maxHeight: "85vh",
                  }
                : {
                    ...(!flat ? {} : { border: "1px solid var(--border-color)" }),
                    top: isDesktop ? desktopTop + 48 : 68,
                    // Scroll rather than run off shorter screens, e.g. with the colour picker open
                    maxHeight: `calc(100vh - ${(isDesktop ? desktopTop + 48 : 68) + 20}px)`,
                    right: isDesktop ? "auto" : 16,
                    ...(isDesktop
                      ? {
                          left: align === "left" ? `min(${containerWidth - 366}px, calc(100vw - 366px))` : align === "center" ? `calc(min(50vw + ${containerWidth / 2}px, 100vw) - 366px)` : "calc(100vw - 366px)",
                        }
                      : {}),
                  }),
            }}
          >
            <div className={`min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 ${isMobile ? "pt-2" : "pt-5"}`}>
            <div className={`${isMobile ? "mb-5 mt-2" : "mb-5"} flex items-center justify-between`}>
              <span className="tile-label">Make it yours</span>
              <div className="flex gap-1.5">
                {FINISHES.map((f) => (
                  <button
                    key={f.name}
                    onClick={() => setFinish(f.name)}
                    aria-pressed={finish === f.name}
                    className={`glass-btn text-xs px-2.5 py-1 rounded-[4px] ${finish === f.name ? "" : "opacity-60 hover:opacity-100"}`}
                    style={finish === f.name ? { border: `1px solid color-mix(in srgb, var(--text-color) 60%, transparent)` } : {}}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {panelContent}
            </div>

            {panelFooter}
          </div>
        </>
      )}
    </>
  );
}
