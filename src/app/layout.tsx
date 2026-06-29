import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import NoiseTexture from "./components/NoiseTexture";
import ScanLines from "./components/ScanLines";
import CursorTrail from "./components/CursorTrail";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const aujournuit = localFont({
  src: "../../public/fonts/Aujournuit-Regular.woff2",
  variable: "--font-aujournuit",
  display: "swap",
});

const nectoMono = localFont({
  src: "../../public/fonts/NectoMono-Regular.woff2",
  variable: "--font-necto-mono",
  display: "swap",
});

const absans = localFont({
  src: "../../public/fonts/Absans-Regular.woff2",
  variable: "--font-absans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "George Wood • Product Designer",
  description: "Digital & Product Designer based in Nottingham • George Wood",
  icons: { icon: "/icon.png" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${inter.variable} ${aujournuit.variable} ${nectoMono.variable} ${absans.variable} antialiased`}>
        <NoiseTexture />
        <ScanLines />
        <CursorTrail />
        {children}
      </body>
    </html>
  );
}
