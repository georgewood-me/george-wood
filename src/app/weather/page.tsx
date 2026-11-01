"use client";

import { notFound } from "next/navigation";
import { WeatherBackdrop } from "../components/TileBackdrops";
import { WEATHER_ICONS, WEATHER_LABELS, type WeatherType } from "../components/Weather";

// Local preview of every weather backdrop at once; not served in production
const TYPES: WeatherType[] = ["sun", "cloud-sun", "cloud", "fog", "drizzle", "rain", "snow", "snowflake", "thunder"];

export default function WeatherPreview() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <main className="grid grid-cols-2 lg:grid-cols-3 gap-px max-w-[1120px]" style={{ background: "var(--border-color)" }}>
      {TYPES.map((type) => {
        const Icon = WEATHER_ICONS[type];
        return (
          <section key={type} className="relative flex flex-col p-5 min-h-60 overflow-hidden bg-(--bg-color)">
            <WeatherBackdrop type={type} />
            <span className="tile-label relative">{type}</span>
            <p className="relative mt-auto flex items-center gap-1.5 text-sm opacity-80">
              <Icon />
              {WEATHER_LABELS[type]}
            </p>
          </section>
        );
      })}
    </main>
  );
}
