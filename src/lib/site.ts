// Nombre y URL del sitio. Salen de variables de BUILD (NEXT_PUBLIC_*), así
// cambiar de marca es cambiar una variable y volver a compilar. El resto de los
// datos del taller (dirección, horarios, redes, WhatsApp) viene de la API y se
// edita desde el panel.
export const SITE = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || "TallerScan",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, ""),
} as const;
