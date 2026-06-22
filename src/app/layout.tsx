import type { Metadata } from "next";
import { Inter } from "next/font/google";
import NoiseTexture from "./components/NoiseTexture";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "George Wood",
  description: "George Wood",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <NoiseTexture />
        {children}
      </body>
    </html>
  );
}
