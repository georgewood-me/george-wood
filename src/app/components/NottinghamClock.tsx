"use client";

import { useEffect, useState, type ReactNode } from "react";

const iconProps = {
  width: 12,
  height: 12,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function Sun() {
  return (
    <svg {...iconProps}>
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function CloudSun() {
  return (
    <svg {...iconProps}>
      <path d="M12 2v2" />
      <path d="M4.93 4.93l1.41 1.41" />
      <path d="M20 12h2" />
      <path d="M19.07 4.93l-1.41 1.41" />
      <path d="M15.95 5.63a5 5 0 0 0-8.48 3.87 4 4 0 0 0-.62 7.5h11.3a3 3 0 0 0 .76-5.9 5 5 0 0 0-2.96-5.47Z" />
    </svg>
  );
}

function Cloud() {
  return (
    <svg {...iconProps}>
      <path d="M17.5 19a4.5 4.5 0 1 0 0-9h-1.8A7 7 0 1 0 4 14.5" />
      <path d="M6 19h11.5" />
    </svg>
  );
}

function Fog() {
  return (
    <svg {...iconProps}>
      <path d="M4 14h16" />
      <path d="M4 18h16" />
      <path d="M6 10a4 4 0 0 1 8 0" />
      <path d="M14 10a4 4 0 0 1 4-4" />
    </svg>
  );
}

function CloudRain() {
  return (
    <svg {...iconProps}>
      <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
      <path d="M16 14v6" />
      <path d="M8 14v6" />
      <path d="M12 16v6" />
    </svg>
  );
}

function CloudDrizzle() {
  return (
    <svg {...iconProps}>
      <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
      <path d="M8 15v1" />
      <path d="M8 19v1" />
      <path d="M12 17v1" />
      <path d="M12 21v1" />
      <path d="M16 15v1" />
      <path d="M16 19v1" />
    </svg>
  );
}

function CloudSnow() {
  return (
    <svg {...iconProps}>
      <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
      <path d="M8 15h.01" />
      <path d="M8 19h.01" />
      <path d="M12 17h.01" />
      <path d="M12 21h.01" />
      <path d="M16 15h.01" />
      <path d="M16 19h.01" />
    </svg>
  );
}

function Snowflake() {
  return (
    <svg {...iconProps}>
      <line x1="2" y1="12" x2="22" y2="12" />
      <line x1="12" y1="2" x2="12" y2="22" />
      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
      <line x1="19.07" y1="4.93" x2="4.93" y2="19.07" />
    </svg>
  );
}

function CloudLightning() {
  return (
    <svg {...iconProps}>
      <path d="M6 16.326A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 .5 8.973" />
      <path d="M13 12l-3 5h4l-3 5" />
    </svg>
  );
}

type WeatherType = "sun" | "cloud-sun" | "cloud" | "fog" | "drizzle" | "rain" | "snow" | "snowflake" | "thunder";

const WEATHER_MAP: Record<number, WeatherType> = {
  0: "sun",
  1: "cloud-sun",
  2: "cloud-sun",
  3: "cloud",
  45: "fog",
  48: "fog",
  51: "drizzle",
  53: "drizzle",
  55: "rain",
  61: "rain",
  63: "rain",
  65: "rain",
  71: "snow",
  73: "snow",
  75: "snowflake",
  77: "snowflake",
  80: "drizzle",
  81: "rain",
  82: "rain",
  85: "snow",
  86: "snow",
  95: "thunder",
  96: "thunder",
  99: "thunder",
};

const WEATHER_COMPONENTS: Record<WeatherType, () => ReactNode> = {
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

export default function NottinghamClock() {
  const [time, setTime] = useState<string>("");
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
      } catch {
        // Silently fail — banner still shows location and time
      }
    }
    fetchWeather();
    const interval = setInterval(fetchWeather, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const WeatherIcon = weather ? WEATHER_COMPONENTS[weather.type] : null;

  return (
    <div
      className="w-full py-2 px-4 flex items-center justify-between font-mono text-white border-b"
      style={{ fontSize: "0.6875rem", borderColor: "rgba(255, 255, 255, 0.2)" }}
    >
      <div className="flex items-center gap-1 font-mono">
        <span className="font-bold">GW</span>
        <span className="font-normal">Product Designer</span>
      </div>
      <div className="flex items-center gap-2">
        <span>Nottingham /</span>
        <span>{time} /</span>
        {weather && WeatherIcon && (
          <span className="flex items-center gap-1">
            <WeatherIcon /> {weather.temp}°C
          </span>
        )}
      </div>
    </div>
  );
}
