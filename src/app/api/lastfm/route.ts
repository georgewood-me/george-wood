import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const USERNAME = "georgewood_me";

export async function GET() {
  const apiKey = process.env.LASTFM_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${USERNAME}&api_key=${apiKey}&format=json&limit=1`;

  const res = await fetch(url);

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
