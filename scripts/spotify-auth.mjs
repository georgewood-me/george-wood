// One-off: sign in to Spotify and save a refresh token for api/now-playing.
//
// 1. Put SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in .env.local
// 2. Add http://127.0.0.1:8888/callback as a redirect URI on the Spotify app
// 3. Run `node scripts/spotify-auth.mjs` and open the link it prints
//
// The token is written to .env.local as SPOTIFY_REFRESH_TOKEN and never printed.

import { createServer } from "node:http";
import { randomBytes } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";

const ENV_FILE = new URL("../.env.local", import.meta.url);
const REDIRECT_URI = "http://127.0.0.1:8888/callback";
const SCOPE = "user-read-currently-playing";

const envText = readFileSync(ENV_FILE, "utf8");
const env = Object.fromEntries(
  envText
    .split("\n")
    .map((line) => line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/))
    .filter(Boolean)
    .map(([, key, value]) => [key, value.replace(/^["']|["']$/g, "")]),
);

const clientId = env.SPOTIFY_CLIENT_ID;
const clientSecret = env.SPOTIFY_CLIENT_SECRET;
if (!clientId || !clientSecret) {
  console.error("Add SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET to .env.local first.");
  process.exit(1);
}

const state = randomBytes(16).toString("hex");
const authorizeUrl =
  "https://accounts.spotify.com/authorize?" +
  new URLSearchParams({ client_id: clientId, response_type: "code", redirect_uri: REDIRECT_URI, scope: SCOPE, state });

function saveRefreshToken(token) {
  const line = `SPOTIFY_REFRESH_TOKEN=${token}`;
  const current = readFileSync(ENV_FILE, "utf8");
  const next = /^SPOTIFY_REFRESH_TOKEN=.*$/m.test(current)
    ? current.replace(/^SPOTIFY_REFRESH_TOKEN=.*$/m, line)
    : `${current.replace(/\n?$/, "\n")}${line}\n`;
  writeFileSync(ENV_FILE, next);
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, REDIRECT_URI);
  if (url.pathname !== "/callback") {
    res.writeHead(404).end();
    return;
  }

  const finish = (status, message) => {
    res.writeHead(status, { "Content-Type": "text/plain; charset=utf-8" }).end(message);
    console.log(message);
    server.close();
  };

  if (url.searchParams.get("state") !== state) return finish(400, "Sign-in didn't match this run. Try again.");
  const code = url.searchParams.get("code");
  if (!code) return finish(400, `Spotify said: ${url.searchParams.get("error") ?? "no code returned"}`);

  const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "authorization_code", code, redirect_uri: REDIRECT_URI }),
  });
  const data = await tokenRes.json();
  if (!tokenRes.ok || !data.refresh_token) {
    return finish(500, `Couldn't get a token: ${data.error_description ?? data.error ?? tokenRes.status}`);
  }

  saveRefreshToken(data.refresh_token);
  finish(200, "Done. SPOTIFY_REFRESH_TOKEN is saved in .env.local. You can close this tab.");
});

server.listen(8888, "127.0.0.1", () => {
  console.log("Open this link and approve the app:\n");
  console.log(authorizeUrl + "\n");
});
