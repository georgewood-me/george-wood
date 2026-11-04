import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// What's playing right now comes from Spotify, which knows straight away, even on speakers
// that report to Last.fm late (like the Sonos). When nothing is playing, or Spotify isn't
// set up, the last track comes from Last.fm as before.

const LASTFM_USER = "georgewood_me";
// The read-only key the page used when it asked Last.fm from the browser
const LASTFM_PUBLIC_KEY = "2e7aa7aba14b552f8cf7b048661ff913";

type Track = { title: string; artist: string; nowPlaying: boolean; image: string; imageLarge: string };

// Access tokens last an hour, so keep one between requests while the server is warm
let spotifyToken: { value: string; expires: number } | null = null;

// Why each source came up empty, returned with a 404 so a failure can be diagnosed (never any keys)
let problems: string[] = [];

async function spotifyAccessToken() {
  const { SPOTIFY_CLIENT_ID: id, SPOTIFY_CLIENT_SECRET: secret, SPOTIFY_REFRESH_TOKEN: refresh } = process.env;
  if (!id || !secret || !refresh) {
    problems.push("spotify: not configured");
    return null;
  }
  if (spotifyToken && spotifyToken.expires > Date.now()) return spotifyToken.value;

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: refresh }),
    cache: "no-store",
  });
  if (!res.ok) {
    problems.push(`spotify token: ${res.status}`);
    return null;
  }

  const data = await res.json();
  spotifyToken = { value: data.access_token, expires: Date.now() + (data.expires_in - 60) * 1000 };
  return spotifyToken.value;
}

// undefined: Spotify couldn't be asked. null: Spotify says nothing is playing.
async function spotifyNowPlaying(): Promise<Track | null | undefined> {
  const token = await spotifyAccessToken();
  if (!token) return undefined;

  const res = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  // 204 means nothing is playing
  if (res.status === 204) return null;
  if (res.status !== 200) {
    problems.push(`spotify player: ${res.status}`);
    return undefined;
  }

  const data = await res.json();
  const item = data.item;
  // Paused music, podcasts and ads fall through to Last.fm's last track
  if (!data.is_playing || data.currently_playing_type !== "track" || !item) return null;

  const images: { url: string; width: number }[] = item.album?.images ?? [];
  return {
    title: item.name,
    artist: item.artists.map((a: { name: string }) => a.name).join(", "),
    nowPlaying: true,
    image: images.at(-1)?.url ?? "",
    imageLarge: images[0]?.url ?? "",
  };
}

async function lastfmRecent(): Promise<Track | null> {
  const apiKey = process.env.LASTFM_API_KEY || LASTFM_PUBLIC_KEY;

  const res = await fetch(
    `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${LASTFM_USER}&api_key=${apiKey}&format=json&limit=1`,
    // Last.fm asks API clients to identify themselves
    { cache: "no-store", headers: { "User-Agent": "georgewood.me now-playing" } },
  );
  if (!res.ok) {
    problems.push(`lastfm: ${res.status}`);
    return null;
  }

  const t = (await res.json()).recenttracks?.track?.[0];
  if (!t) return null;
  const imageOf = (size: string) => t.image?.find((img: { size: string }) => img.size === size)?.["#text"] || "";
  return {
    title: t.name,
    artist: t.artist["#text"],
    nowPlaying: t["@attr"]?.nowplaying === "true",
    image: imageOf("small"),
    imageLarge: imageOf("extralarge"),
  };
}

export async function GET() {
  problems = [];
  const live = await spotifyNowPlaying().catch((e) => (problems.push(`spotify: ${e}`), undefined));
  let track = live ?? (await lastfmRecent().catch((e) => (problems.push(`lastfm: ${e}`), null)));
  // Last.fm keeps calling a track "now playing" for a while after it's paused or stopped,
  // so once Spotify has said nothing is playing, its last track is only ever "Last played"
  if (live === null && track) track = { ...track, nowPlaying: false };
  if (!track) return NextResponse.json({ error: "No recent tracks", problems }, { status: 404 });
  return NextResponse.json(track, { headers: { "Cache-Control": "no-store" } });
}
