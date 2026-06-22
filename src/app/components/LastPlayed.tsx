"use client";

import { useEffect, useState } from "react";

interface Track {
  title: string;
  artist: string;
  nowPlaying: boolean;
}

export default function LastPlayed() {
  const [track, setTrack] = useState<Track | null>(null);

  useEffect(() => {
    fetch("/api/lastfm")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && !data.error) setTrack(data);
      })
      .catch(() => {});
  }, []);

  if (!track) return null;

  return (
    <span>
      {track.nowPlaying ? "Currently listening to" : "Last played"} <span className="font-bold">{track.title}</span> by <span className="font-bold">{track.artist}</span>.
    </span>
  );
}
