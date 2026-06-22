"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";

const iconSize = { width: 14, height: 14 };

function Sun() {
  return (
    <svg {...iconSize} viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="4" />
      <rect x="11" y="1" width="2" height="4" rx="1" />
      <rect x="11" y="19" width="2" height="4" rx="1" />
      <rect x="1" y="11" width="4" height="2" rx="1" />
      <rect x="19" y="11" width="4" height="2" rx="1" />
      <rect x="4.22" y="3.51" width="2" height="4" rx="1" transform="rotate(45 5.22 5.51)" />
      <rect x="17.78" y="16.49" width="2" height="4" rx="1" transform="rotate(45 18.78 18.49)" />
      <rect x="3.51" y="17.78" width="4" height="2" rx="1" transform="rotate(45 5.51 18.78)" />
      <rect x="16.49" y="4.22" width="4" height="2" rx="1" transform="rotate(45 18.49 5.22)" />
    </svg>
  );
}

function CloudSun() {
  return (
    <svg {...iconSize} viewBox="0 0 24 24" fill="currentColor">
      <circle cx="10" cy="7" r="3" />
      <rect x="9" y="1" width="2" height="2.5" rx="1" />
      <rect x="3.5" y="6" width="2.5" height="2" rx="1" />
      <rect x="4.5" y="2.8" width="2" height="2.5" rx="1" transform="rotate(45 5.5 4.05)" />
      <path d="M18.5 16a4 4 0 0 0-7.8-1H9.5a3.5 3.5 0 1 0 0 7h9a4 4 0 0 0 0-8z" />
    </svg>
  );
}

function Cloud() {
  return (
    <svg {...iconSize} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.5 16a4.5 4.5 0 0 0-8.7-1.5H9.5a4 4 0 1 0 0 8h10a4.5 4.5 0 0 0 0-9z" />
    </svg>
  );
}

function Fog() {
  return (
    <svg {...iconSize} viewBox="0 0 24 24" fill="currentColor">
      <rect x="2" y="8" width="20" height="2.5" rx="1.25" />
      <rect x="4" y="13" width="16" height="2.5" rx="1.25" />
      <rect x="6" y="18" width="12" height="2.5" rx="1.25" />
    </svg>
  );
}

function CloudRain() {
  return (
    <svg {...iconSize} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 12a4.5 4.5 0 0 0-8.7-1.5H9a3.5 3.5 0 1 0 0 7h10A4.5 4.5 0 0 0 19 12z" />
      <rect x="8" y="20" width="2" height="3" rx="1" />
      <rect x="12" y="21" width="2" height="3" rx="1" />
      <rect x="16" y="20" width="2" height="3" rx="1" />
    </svg>
  );
}

function CloudDrizzle() {
  return (
    <svg {...iconSize} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 12a4.5 4.5 0 0 0-8.7-1.5H9a3.5 3.5 0 1 0 0 7h10A4.5 4.5 0 0 0 19 12z" />
      <circle cx="9" cy="20.5" r="1" />
      <circle cx="13" cy="22" r="1" />
      <circle cx="17" cy="20.5" r="1" />
    </svg>
  );
}

function CloudSnow() {
  return (
    <svg {...iconSize} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 12a4.5 4.5 0 0 0-8.7-1.5H9a3.5 3.5 0 1 0 0 7h10A4.5 4.5 0 0 0 19 12z" />
      <circle cx="9" cy="20" r="1.2" />
      <circle cx="15" cy="20" r="1.2" />
      <circle cx="12" cy="23" r="1.2" />
    </svg>
  );
}

function Snowflake() {
  return (
    <svg {...iconSize} viewBox="0 0 24 24" fill="currentColor">
      <rect x="11" y="2" width="2" height="20" rx="1" />
      <rect x="2" y="11" width="20" height="2" rx="1" />
      <rect x="4.93" y="4.22" width="2" height="16" rx="1" transform="rotate(45 5.93 12.22)" />
      <rect x="16.07" y="4.22" width="2" height="16" rx="1" transform="rotate(-45 17.07 12.22)" />
    </svg>
  );
}

function CloudLightning() {
  return (
    <svg {...iconSize} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 12a4.5 4.5 0 0 0-8.7-1.5H9a3.5 3.5 0 1 0 0 7h10A4.5 4.5 0 0 0 19 12z" />
      <path d="M13 19l-2 4h3l-2 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

type WeatherType = "sun" | "cloud-sun" | "cloud" | "fog" | "drizzle" | "rain" | "snow" | "snowflake" | "thunder";

const WEATHER_MAP: Record<number, WeatherType> = {
  0: "sun", 1: "cloud-sun", 2: "cloud-sun", 3: "cloud",
  45: "fog", 48: "fog", 51: "drizzle", 53: "drizzle", 55: "rain",
  61: "rain", 63: "rain", 65: "rain", 71: "snow", 73: "snow",
  75: "snowflake", 77: "snowflake", 80: "drizzle", 81: "rain", 82: "rain",
  85: "snow", 86: "snow", 95: "thunder", 96: "thunder", 99: "thunder",
};

const WEATHER_ICONS: Record<WeatherType, () => ReactNode> = {
  sun: Sun,
  "cloud-sun": CloudSun,
  cloud: Cloud,
  fog: Fog,
  drizzle: CloudDrizzle,
  rain: CloudRain,
  snow: CloudSnow,
  snowflake: Snowflake,
  thunder: CloudLightning,
};

export default function Header() {
  const [time, setTime] = useState("");
  const [weather, setWeather] = useState<{ temp: number; type: WeatherType } | null>(null);

  useEffect(() => {
    function updateTime() {
      setTime(
        new Date().toLocaleTimeString("en-GB", {
          timeZone: "Europe/London",
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    }
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function fetchWeather() {
      try {
        const res = await fetch(
          "https://api.open-meteo.com/v1/forecast?latitude=52.95&longitude=-1.15&current=temperature_2m,weather_code"
        );
        const data = await res.json();
        const code = data.current.weather_code as number;
        setWeather({
          temp: Math.round(data.current.temperature_2m),
          type: WEATHER_MAP[code] ?? "cloud",
        });
      } catch {}
    }
    fetchWeather();
    const interval = setInterval(fetchWeather, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="flex items-end sm:items-center justify-between py-6">
      <div className="flex gap-3 flex-col items-start sm:flex-row sm:items-center">
        <Image
          src="/images/avatar.png"
          alt="George Wood"
          width={60}
          height={60}
          className="sm:w-[60px] sm:h-[60px] w-[32px] h-[32px]"
          style={{ borderRadius: 4, boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)" }}
        />
        <div>
          <p className="font-semibold text-sm leading-tight">George Wood</p>
          <p className="text-sm opacity-70 leading-tight">Product Designer at Stripe</p>
        </div>
      </div>
      <div className="text-right text-sm">
        <p className="leading-tight">Nottingham, UK</p>
        <p className="opacity-70 leading-tight flex items-center justify-end gap-1">
          <span>{time}</span>
          {weather && (
            <>
              <span>—— {weather.temp}°C</span>
              {(() => { const Icon = WEATHER_ICONS[weather.type]; return <Icon />; })()}
            </>
          )}
        </p>
      </div>
    </header>
  );
}
