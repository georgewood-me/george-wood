"use client";

import { useEffect, useState } from "react";

export interface Film {
  title: string;
  year: string;
  rating: number;
  poster: string;
  url: string;
}

export function Stars({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <span className="flex gap-px">
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} width="10" height="10" viewBox="0 0 24 24" fill={i < full ? "currentColor" : i === full && half ? "url(#half)" : "none"} stroke="currentColor" strokeWidth="1.5">
          {i === full && half && (
            <defs>
              <linearGradient id="half">
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="transparent" />
              </linearGradient>
            </defs>
          )}
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </span>
  );
}

export function useRecentFilms() {
  const [films, setFilms] = useState<Film[]>([]);
  useEffect(() => {
    fetch("/api/letterboxd")
      .then((res) => res.json())
      .then((data: Film[]) => setFilms(data))
      .catch(() => {});
  }, []);
  return films;
}

export function FilmCard({ film }: { film: Film }) {
  return (
    <a href={film.url} target="_blank" rel="noopener noreferrer" className="group">
      <div
        className="glass-poster aspect-2/3 rounded-[4px] overflow-hidden mb-2 relative"
        style={{ border: "1px solid var(--border-color)" }}
      >
        <img src={film.poster} alt={film.title} className="w-full h-full object-cover absolute inset-0" />
        <div
          className="absolute inset-0 transition-opacity duration-500 group-hover:opacity-0"
          style={{ background: "var(--duotone-highlight)" }}
        >
          <img
            src={film.poster}
            alt=""
            className="w-full h-full object-cover"
            style={{ filter: "grayscale(1) contrast(1.1)", mixBlendMode: "multiply" }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "var(--duotone-shadow)", mixBlendMode: "lighten" }}
          />
        </div>
      </div>
      <p className="text-xs font-medium truncate">{film.title}</p>
      <div className="flex items-center gap-1.5 mt-0.5">
        <span className="text-xs opacity-50 tabular-nums">{film.year}</span>
        {film.rating > 0 && <Stars rating={film.rating} />}
      </div>
    </a>
  );
}
