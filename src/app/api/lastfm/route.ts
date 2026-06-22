import { NextResponse } from "next/server";

const API_KEY = process.env.LASTFM_API_KEY!;
const USERNAME = "georgewood_me";

export async function GET() {
  const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${USERNAME}&api_key=${API_KEY}&format=json&limit=1`;

  const res = await fetch(url, { next: { revalidate: 60 } });

  if (!res.ok) {
    return NextResponse.json(
      { error: "Failed to fetch recent tracks" },
      { status: res.status }
    );
  }

  const data = await res.json();
  const track = data.recenttracks?.track?.[0];

  if (!track) {
    return NextResponse.json({ error: "No recent tracks" }, { status: 404 });
  }

  return NextResponse.json({
    title: track.name,
    artist: track.artist["#text"],
    nowPlaying: track["@attr"]?.nowplaying === "true",
  });
}
