"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import Image from "next/image";
import { SoundWaves, useRecentTrack } from "./NowPlaying";
import { useNottingham, WEATHER_ICONS, WEATHER_LABELS } from "./Weather";
import { projects } from "./projects";
import { testimonials } from "./testimonials";
import { FilmCard, useRecentFilms } from "./Films";
import { PRESETS } from "./ControlPanel";
import { WeatherBackdrop, DotGrid, ColourDrift } from "./TileBackdrops";
import { OnAirLight, Paintbrush, RadarPing, WavingHand } from "./LabelIcons";

function Tile({
  label,
  icon,
  aside,
  index,
  className = "",
  children,
}: {
  label?: string;
  icon?: ReactNode;
  aside?: ReactNode;
  index: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={`bento-tile relative flex flex-col p-5 bg-(--bg-color) ${className}`}
      style={{ "--tile-delay": `${index * 100}ms` } as CSSProperties}
    >
      {label && (
        <div className="relative flex items-center justify-between min-h-6">
          <span className="flex items-center gap-2">
            {icon}
            <span className="tile-label">{label}</span>
          </span>
          {aside}
        </div>
      )}
      {children}
    </section>
  );
}

function Identity() {
  return (
    <div className="flex items-center gap-3">
      <div className="glass-poster image-edge" style={{ borderRadius: 4, overflow: "hidden", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)" }}>
        <Image src="/images/avatar.png" alt="George Wood" width={40} height={40} className="block" />
      </div>
      <div>
        <p className="font-medium text-sm leading-snug">George Wood</p>
        <p className="text-sm opacity-80 leading-snug">Product Designer at Stripe</p>
      </div>
    </div>
  );
}

// The intro's identity row, pinned to the top; its background fades in once the page scrolls under it
export function PageHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-40 h-0">
      <div className="absolute inset-x-0 top-0 h-20 flex items-center px-5 pointer-events-none">
        <div
          aria-hidden="true"
          className="frost absolute inset-0 border-b border-r transition-opacity duration-300 ease-out"
          style={{ opacity: scrolled ? 1 : 0 }}
        />
        <div className="relative">
          <Identity />
        </div>
      </div>
    </header>
  );
}

export function IntroTile({ index }: { index: number }) {
  return (
    <Tile index={index} className="col-span-2 lg:row-span-2">
      <div className="h-10" aria-hidden="true" />
      <div className="mt-auto pt-10 sm:pt-16">
        <p className="text-2xl sm:text-[28px] font-medium leading-[1.2] text-balance" style={{ letterSpacing: "-0.02em" }}>
          I’m a Product Designer at Stripe working in Extensibility, helping to shape how developers and users extend our platform with apps and extensions.
        </p>
        <div className="mt-8 grid sm:grid-cols-2 gap-4 text-sm leading-normal opacity-80">
          <p>
            I previously spent over 15 years working in agencies, specialising in designing ecommerce platforms and the tools that let brands build and curate campaigns their own way.
          </p>
          <p>
            Across all of that, what’s stayed consistent is a focus on the people actually using the thing – and a habit of noticing the small stuff that’s easy to overlook but ends up mattering.
          </p>
        </div>
      </div>
    </Tile>
  );
}

export function NowPlayingTile({ index }: { index: number }) {
  const track = useRecentTrack();
  return (
    <Tile index={index} label={track?.nowPlaying ? "Listening to" : "Last played"} icon={<OnAirLight live={!!track?.nowPlaying} />} className="col-span-1 min-h-60">
      <div className="relative z-10 mt-auto pt-4">
        <div
          className="image-edge w-14 h-14 rounded-[4px] overflow-hidden flex items-center justify-center"
        >
          {track?.imageLarge ? (
            <img src={track.imageLarge} alt="" className="w-full h-full object-cover" />
          ) : (
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4 }}>
              <circle cx="8" cy="18" r="4" />
              <path d="M12 18V2l7 4" />
            </svg>
          )}
        </div>
        <p className="mt-3 text-base font-medium leading-snug line-clamp-2">{track?.title ?? "\u00a0"}</p>
        <p className="text-sm leading-snug opacity-80 truncate">{track?.artist ?? "\u00a0"}</p>
      </div>
      <div className="absolute inset-0" style={{ maskImage: "linear-gradient(to top, black, transparent 90%)" }}>
        <SoundWaves />
      </div>
    </Tile>
  );
}

export function ClockTile({ index }: { index: number }) {
  const { time, weather } = useNottingham();
  const Icon = weather ? WEATHER_ICONS[weather.type] : null;
  return (
    <Tile index={index} label="Nottingham, UK" icon={<RadarPing />} className="col-span-1 min-h-60 overflow-hidden">
      <WeatherBackdrop type={weather?.type ?? null} />
      <div className="relative mt-auto">
        <p className="text-[40px] min-[375px]:text-[44px] sm:text-5xl font-medium leading-none tabular-nums" style={{ letterSpacing: "-0.03em" }}>
          {time || " "}
        </p>
        <p className="mt-3 flex items-center gap-1.5 text-sm leading-snug opacity-80 tabular-nums min-h-5">
          {weather && Icon && (
            <>
              <Icon />
              <span>{weather.temp}°C</span>
              <span className="hidden sm:inline">· {WEATHER_LABELS[weather.type]}</span>
            </>
          )}
        </p>
      </div>
    </Tile>
  );
}

const contactLinks = [
  { label: "Email", href: "mailto:georgewood.me@gmail.com" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/georgewood-me/" },
  { label: "X", href: "https://x.com/georgewood_me" },
];

export function ContactTile({ index }: { index: number }) {
  return (
    <Tile index={index} label="Say hello" icon={<WavingHand />} className="col-span-2 sm:col-span-1">
      <DotGrid />
      <ul className="relative mt-auto pt-4">
        {contactLinks.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              {...(link.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="block py-2.5 sm:py-1 text-xl font-medium leading-[1.2] opacity-80 hover:opacity-100 transition-opacity"
            >
              {link.label} ↗
            </a>
          </li>
        ))}
      </ul>
    </Tile>
  );
}

export function MakeItYoursTile({ index }: { index: number }) {
  const [bg, setBg] = useState(PRESETS[0]);

  useEffect(() => {
    const onChange = (e: Event) => setBg((e as CustomEvent<{ bg: string }>).detail.bg);
    window.addEventListener("controls:change", onChange);
    return () => window.removeEventListener("controls:change", onChange);
  }, []);

  return (
    <Tile index={index} label="Make it yours" icon={<Paintbrush />} className="col-span-2 sm:col-span-1 overflow-hidden">
      <ColourDrift />
      <p className="relative mt-4 text-sm leading-normal opacity-80">
        Change the colour, texture and type, then share your version
      </p>
      <div className="relative mt-auto pt-6 grid grid-cols-8 gap-2">
        {PRESETS.map((color) => (
          <button
            key={color}
            onClick={() => window.dispatchEvent(new CustomEvent("controls:set-bg", { detail: color }))}
            className="glass-swatch aspect-square"
            aria-label={`Set background to ${color}`}
            aria-pressed={bg.toLowerCase() === color.toLowerCase()}
            style={{
              background: color,
              borderRadius: 3,
              border: "1px solid var(--border-color)",
              boxShadow: `0 0 0 2px var(--bg-color), 0 0 0 3px ${bg.toLowerCase() === color.toLowerCase() ? "color-mix(in srgb, var(--text-color) 60%, transparent)" : "transparent"}`,
            }}
          />
        ))}
      </div>
      <button
        onClick={() => window.dispatchEvent(new Event("controls:open"))}
        className="glass-btn glass-surface relative mt-4 h-11 sm:h-9 flex items-center justify-center gap-1.5 rounded-[4px] text-xs opacity-80 hover:opacity-100 transition-opacity"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="4" y1="21" x2="4" y2="3" />
          <line x1="12" y1="21" x2="12" y2="3" />
          <line x1="20" y1="21" x2="20" y2="3" />
          <line x1="1" y1="14" x2="7" y2="14" />
          <line x1="9" y1="8" x2="15" y2="8" />
          <line x1="17" y1="16" x2="23" y2="16" />
        </svg>
        More controls
      </button>
    </Tile>
  );
}

export function WorkTile({ index }: { index: number }) {
  return (
    <Tile index={index} label="Selected work" className="col-span-2">
      {/* Rows share any spare height evenly, so the list lines up with the tile beside it */}
      <ul id="work-list" className="flex flex-col flex-1 mt-4 -mx-5 -mb-5">
        {projects.map((project) => (
          <li
            key={project.name}
            className="flex flex-1 items-center justify-between gap-3 px-5 py-3"
            style={{ borderTop: "1px solid var(--border-color)" }}
          >
            <div
              className="flex flex-1 items-center gap-2 min-w-0 overflow-hidden"
              style={{ maskImage: "linear-gradient(to right, black calc(100% - 24px), transparent)" }}
            >
              <span className="text-sm font-medium leading-snug shrink-0">{project.name}</span>
              {project.awards.map((award) => (
                <span key={award} className="text-xs opacity-50 shrink-0 whitespace-nowrap">
                  {award}
                </span>
              ))}
            </div>
            {project.disabled ? (
              <span className="text-sm opacity-50 shrink-0">Archived</span>
            ) : (
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="-my-3 py-3 text-sm opacity-80 hover:opacity-100 transition-opacity shrink-0"
              >
                View site ↗
              </a>
            )}
          </li>
        ))}
      </ul>
    </Tile>
  );
}

export function KindWordsTile({ index }: { index: number }) {
  const [current, setCurrent] = useState(0);
  const count = testimonials.length;
  const step = (delta: number) => setCurrent((c) => (c + delta + count) % count);
  const pad = (n: number) => String(n).padStart(2, "0");
  const arrow = "relative w-14 flex items-center justify-center border-l opacity-80 hover:opacity-100 transition-opacity";
  const rule = { borderColor: "var(--border-color)" };

  // On desktop this tile sits beside Selected work, so its control strip takes the height of a
  // work row. The rows stretch with this tile, which includes the strip, so the measurement is
  // rounded to whole pixels; the two settle within a frame or two rather than chasing each other.
  const [stripHeight, setStripHeight] = useState<number | null>(null);
  useEffect(() => {
    const list = document.getElementById("work-list");
    if (!list) return;
    const desktop = window.matchMedia("(min-width: 1024px)");
    const sync = () => {
      const row = list.firstElementChild?.getBoundingClientRect().height;
      setStripHeight(desktop.matches && row ? Math.round(row) : null);
    };
    const observer = new ResizeObserver(sync);
    observer.observe(list);
    desktop.addEventListener("change", sync);
    return () => {
      observer.disconnect();
      desktop.removeEventListener("change", sync);
    };
  }, []);

  return (
    <Tile index={index} label="Kind words" className="col-span-2">
      {/* Every quote sits in the same cell so the tile is always as tall as the longest one */}
      <div className="relative grid flex-1 mt-6">
        {testimonials.map((t, i) => (
          <figure
            key={t.name}
            aria-hidden={i !== current}
            className="flex flex-col justify-between transition-opacity duration-300"
            style={{ gridArea: "1 / 1", opacity: i === current ? 1 : 0, pointerEvents: i === current ? "auto" : "none" }}
          >
            <blockquote className="text-[15px] sm:text-base leading-normal max-w-[60ch]">{t.quote}</blockquote>
            <figcaption className="flex items-end justify-between gap-4 mt-8">
              <div>
                <p className="text-sm font-medium leading-snug">{t.name}</p>
                <p className="text-xs opacity-50 mt-0.5">{t.role}</p>
              </div>
              {t.logo && (
                <Image src={t.logo} alt="" width={100} height={24} className="opacity-70" style={{ filter: "invert(var(--svg-invert))" }} />
              )}
            </figcaption>
          </figure>
        ))}
      </div>

      {/* Controls sit in a ruled strip along the foot of the tile, like the grid around it */}
      <div className="relative flex h-14 -mx-5 -mb-5 mt-8 border-t" style={{ ...rule, ...(stripHeight ? { height: stripHeight } : {}) }}>
        <span className="tile-label flex items-center px-5 mr-auto tabular-nums" aria-live="polite">
          {pad(current + 1)} / {pad(count)}
        </span>
        <button onClick={() => step(-1)} className={arrow} style={rule} aria-label="Previous quote">
          <img src="/images/left.svg" alt="" width={16} height={10} style={{ filter: "invert(var(--svg-invert))" }} />
        </button>
        <button onClick={() => step(1)} className={arrow} style={rule} aria-label="Next quote">
          <img src="/images/right.svg" alt="" width={16} height={10} style={{ filter: "invert(var(--svg-invert))" }} />
        </button>
      </div>
    </Tile>
  );
}

export function FilmsTile({ index }: { index: number }) {
  const films = useRecentFilms();
  if (films.length === 0) return null;

  return (
    <Tile
      index={index}
      label="Recently watched"
      className="col-span-2 lg:col-span-4"
      aside={
        <a
          href="https://letterboxd.com/Woody7Figure/"
          target="_blank"
          rel="noopener noreferrer"
          className="-my-3 py-3 text-sm opacity-80 hover:opacity-100 transition-opacity"
        >
          Letterboxd ↗
        </a>
      }
    >
      <div className="relative mt-4 grid grid-cols-3 sm:grid-cols-6 gap-3">
        {films.map((film) => (
          <FilmCard key={film.url} film={film} />
        ))}
      </div>
    </Tile>
  );
}
