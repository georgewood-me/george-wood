import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("https://letterboxd.com/Woody7Figure/rss/", {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return NextResponse.json([]);
    const xml = await res.text();

    const films: { title: string; year: string; rating: number; poster: string; url: string }[] = [];
    const items = xml.match(/<item>[\s\S]*?<\/item>/g) || [];

    const decode = (s: string) => s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");

    for (const item of items) {
      if (films.length >= 6) break;
      const title = decode(item.match(/letterboxd:filmTitle>([^<]+)</)?.[1] || "");
      const year = item.match(/letterboxd:filmYear>([^<]+)</)?.[1] || "";
      const ratingStr = item.match(/letterboxd:memberRating>([^<]+)</)?.[1];
      const rating = ratingStr ? parseFloat(ratingStr) : 0;
      const poster = item.match(/src="(https:\/\/a\.ltrbxd\.com[^"]+)"/)?.[1] || "";
      const url = item.match(/<link>(https:\/\/letterboxd\.com[^<]+)<\/link>/)?.[1] || "";
      if (title && poster) films.push({ title, year, rating, poster, url });
    }

    return NextResponse.json(films);
  } catch {
    return NextResponse.json([]);
  }
}
