import type { Metadata, Viewport } from "next";
import "./globals.css";
import { NoiseOverlay } from "@/components/ui/NoiseOverlay";

export const metadata: Metadata = {
  title: "Club Sportivo Trinidense",
  description: "Plataforma de scouting: similitud de jugadores, clustering táctico y datos físicos.",
};

export const viewport: Viewport = {
  themeColor: "#090c1f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full">
      <body className="min-h-full bg-bg text-text font-sans antialiased">
        <NoiseOverlay />
        {children}
      </body>
    </html>
  );
}
