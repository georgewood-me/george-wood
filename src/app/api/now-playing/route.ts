import { NextResponse } from "next/server";
import { LASTFM_PUBLIC_KEY, parseRecentTrack, recentTrackUrl, type Track } from "../../components/lastfm";

export const dynamic = "force-dynamic";

// What's playing right now comes from Spotify, which knows straight away, even on speakers
// that report to Last.fm late (like the Sonos). When nothing is playing, or Spotify isn't
// set up, the last track comes from Last.fm as before.

// Access tokens last an hour, so keep one between requests while the server is warm
let spotifyToken: { value: string; expires: number } | null = null;

// Each request collects why a source came up empty, so a failure can be diagnosed (never any keys)
type Problems = string[];

async function spotifyAccessToken(problems: Problems) {
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
async function spotifyNowPlaying(problems: Problems): Promise<Track | null | undefined> {
  const token = await spotifyAccessToken(problems);
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

  const images: { url: string }[] = item.album?.images ?? [];
  return {
    title: item.name,
    artist: item.artists.map((a: { name: string }) => a.name).join(", "),
    nowPlaying: true,
    image: images.at(-1)?.url ?? "",
    imageLarge: images[0]?.url ?? "",
  };
}

async function lastfmRecent(problems: Problems): Promise<Track | null> {
  // The configured key first, then the public one if Last.fm refuses it
  const keys = [...new Set([process.env.LASTFM_API_KEY, LASTFM_PUBLIC_KEY].filter((key): key is string => !!key))];
  for (const apiKey of keys) {
    const res = await fetch(recentTrackUrl(apiKey), {
      cache: "no-store",
      // Last.fm asks API clients to identify themselves
      headers: { "User-Agent": "georgewood.me now-playing" },
    });
    if (res.ok) return parseRecentTrack(await res.json());
    problems.push(`lastfm: ${res.status}`);
  }
  return null;
}

export async function GET() {
  const problems: Problems = [];
  const live = await spotifyNowPlaying(problems).catch((e) => (problems.push(`spotify: ${e}`), undefined));
  let track = live ?? (await lastfmRecent(problems).catch((e) => (problems.push(`lastfm: ${e}`), null)));
  // Last.fm keeps calling a track "now playing" for a while after it's paused or stopped,
  // so once Spotify has said nothing is playing, its last track is only ever "Last played"
  if (live === null && track) track = { ...track, nowPlaying: false };
  // idle tells the browser's own Last.fm fallback that Spotify has said nothing is playing
  if (!track) return NextResponse.json({ error: "No recent tracks", idle: live === null, problems }, { status: 404 });
  // problems says why Spotify was skipped, if it was (statuses only, never keys)
  return NextResponse.json({ ...track, ...(problems.length ? { problems } : {}) }, { headers: { "Cache-Control": "no-store" } });
}
