// Last.fm's most recent track, shared by api/now-playing and the browser fallback in NowPlaying

export interface Track {
  title: string;
  artist: string;
  nowPlaying: boolean;
  image: string;
  imageLarge: string;
}

// The read-only key the page has always used to ask Last.fm from the browser
export const LASTFM_PUBLIC_KEY = "2e7aa7aba14b552f8cf7b048661ff913";

export const recentTrackUrl = (apiKey: string) =>
  `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=georgewood_me&api_key=${apiKey}&format=json&limit=1`;

type LastfmTrack = {
  name: string;
  artist: { "#text": string };
  image?: { size: string; "#text": string }[];
  "@attr"?: { nowplaying?: string };
};

export function parseRecentTrack(data: { recenttracks?: { track?: LastfmTrack[] } } | null): Track | null {
  const t = data?.recenttracks?.track?.[0];
  if (!t) return null;
  const imageOf = (size: string) => t.image?.find((img) => img.size === size)?.["#text"] || "";
  return {
    title: t.name,
    artist: t.artist["#text"],
    nowPlaying: t["@attr"]?.nowplaying === "true",
    image: imageOf("small"),
    imageLarge: imageOf("extralarge"),
  };
}
