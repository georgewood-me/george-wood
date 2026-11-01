import type { Metadata, Viewport } from "next";
import { Inter, Geist, Geist_Mono, Bricolage_Grotesque, Archivo_Narrow, Inconsolata } from "next/font/google";
import localFont from "next/font/local";
import NoiseTexture from "./components/NoiseTexture";
import ScanLines from "./components/ScanLines";
import CursorTrail from "./components/CursorTrail";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";

// The optical size axis switches Inter to its Display cut at larger sizes
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  axes: ["opsz"],
});

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Switzer by Indian Type Foundry, via Fontshare (ITF Free Font License)
const switzer = localFont({
  variable: "--font-switzer",
  src: "./fonts/Switzer-Variable.woff2",
  weight: "100 900",
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

const archivo = Archivo_Narrow({
  variable: "--font-archivo",
  subsets: ["latin"],
});

const inconsolata = Inconsolata({
  variable: "--font-inconsolata",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "George Wood • Product Designer",
  description: "Digital & Product Designer based in Nottingham • George Wood",
  icons: { icon: "/icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#0038FF",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${inter.variable} ${geist.variable} ${geistMono.variable} ${switzer.variable} ${bricolage.variable} ${archivo.variable} ${inconsolata.variable} antialiased`}>
        <NoiseTexture />
        <ScanLines />
        <CursorTrail />
        {children}
        <GoogleAnalytics gaId="G-FMZ2ERBWLZ" />
      </body>
    </html>
  );
}
