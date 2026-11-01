import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // The on-disk dev cache kept serving stale globals.css after edits
    turbopackFileSystemCacheForDev: false,
  },
};

export default nextConfig;
