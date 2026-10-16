import type { NextConfig } from "next";

// Exportación estática: `next build` deja la web armada en out/ y la sirve
// nginx. En el servidor no corre Node (tiene 1 GB de RAM). Todo lo que cambia
// (precios, horarios libres, turnos) lo pide el navegador a /api.
//
// Sin headers(), rewrites() ni middleware: no existen en un sitio estático.
// Las cabeceras de seguridad las pone nginx.
const nextConfig: NextConfig = {
  output: "export",
  poweredByHeader: false,
  images: { unoptimized: true },
};

export default nextConfig;
