import type { Metadata } from "next";
import { Inter, Bricolage_Grotesque, Archivo_Narrow, Inconsolata } from "next/font/google";
import NoiseTexture from "./components/NoiseTexture";
import ScanLines from "./components/ScanLines";
import CursorTrail from "./components/CursorTrail";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${inter.variable} ${bricolage.variable} ${archivo.variable} ${inconsolata.variable} antialiased`}>
        <NoiseTexture />
        <ScanLines />
        <CursorTrail />
        {children}
      </body>
    </html>
  );
}
