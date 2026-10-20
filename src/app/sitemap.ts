import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

// Next lo escribe como /sitemap.xml al compilar (sirve con la exportación
// estática). Solo las páginas públicas que vale la pena indexar: el panel,
// el ingreso y "mi turno" (links personales) quedan afuera, ver robots.ts.
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const paginas: { ruta: string; prioridad: number }[] = [
    { ruta: "/", prioridad: 1 },
    { ruta: "/tarifas", prioridad: 0.9 },
    { ruta: "/turnos", prioridad: 0.8 },
    { ruta: "/ubicacion", prioridad: 0.7 },
  ];
  return paginas.map((p) => ({ url: `${SITE.url}${p.ruta}`, changeFrequency: "weekly", priority: p.prioridad }));
}
