import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

// Next lo escribe como /robots.txt al compilar. Fuera del índice: el panel de
// los socios, el ingreso y "mi turno" (cada link lleva un código personal; la
// búsqueda sin código tampoco aporta nada a Google).
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/panel/", "/ingresar", "/mi-turno"] },
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
