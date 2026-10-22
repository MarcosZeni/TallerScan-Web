import type { Metadata, Viewport } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";
import { SelectorPaleta, scriptPaleta } from "@/components/selector-paleta";
import { SITE } from "@/lib/site";
import "./globals.css";

// Barlow: la tipografía de la señalización vial y de los tableros. La
// condensada para títulos y precios (se lee como el cartel del taller), la
// normal para el texto. Next la baja al compilar y la sirve desde el sitio.
const barlow = Barlow({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-barlow", display: "swap" });
const barlowCondensed = Barlow_Condensed({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-barlow-condensed", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} | Mecánica con precios a la vista`, template: `%s | ${SITE.name}` },
  description: "Taller mecánico con precios publicados, escaneo computarizado y turnos online.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f7f5" },
    { media: "(prefers-color-scheme: dark)", color: "#11171d" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR" className={`${barlow.variable} ${barlowCondensed.variable}`} suppressHydrationWarning>
      <head>
        {/* Antes de pintar: la paleta elegida, sin parpadeo. */}
        <script dangerouslySetInnerHTML={{ __html: scriptPaleta }} />
      </head>
      <body className="min-h-dvh font-sans antialiased">
        {children}
        <SelectorPaleta />
      </body>
    </html>
  );
}
