import { SITE } from "@/lib/site";
import type { Sitio } from "@/lib/tipos";

/**
 * Datos estructurados (schema.org `AutoRepair`) para que Google relacione el
 * sitio con la ficha del taller en el mapa. Van en la portada, en un
 * <script type="application/ld+json"> que el visitante no ve.
 *
 * Los datos salen de Ajustes al compilar (BUILD_API_URL): si el build no
 * llegó a la API, va solo el nombre y la URL. Sin coordenadas ni horarios en
 * formato schema: Ajustes guarda los horarios como texto libre y no tiene
 * latitud/longitud; Google los toma de la ficha de Google Business.
 */
export function DatosEstructurados({ sitio }: { sitio: Sitio | null }) {
  const t = sitio?.taller;
  const datos: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "AutoRepair",
    name: SITE.name,
    url: SITE.url,
    image: `${SITE.url}/opengraph-image.png`,
    description: "Taller mecánico con precios publicados, escaneo computarizado y turnos online.",
    priceRange: "$$",
    currenciesAccepted: "ARS",
  };
  if (t?.direccion) {
    datos.address = {
      "@type": "PostalAddress",
      streetAddress: t.direccion,
      addressLocality: t.localidad || undefined,
      addressRegion: "Buenos Aires",
      addressCountry: "AR",
    };
  }
  if (t?.whatsapp) datos.telephone = t.whatsapp;
  if (t?.emailContacto) datos.email = t.emailContacto;
  if (t?.mapaUrl) datos.hasMap = t.mapaUrl;
  const redes = [t?.instagram, t?.facebook, t?.tiktok].filter(Boolean);
  if (redes.length) datos.sameAs = redes;

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datos) }} />;
}
