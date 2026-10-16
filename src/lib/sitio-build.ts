import type { Sitio } from "./tipos";

/**
 * Lee los datos del taller AL COMPILAR, para que el HTML estático ya traiga el
 * tarifario (buscadores, y por si la API está caída al abrir la página). Si no
 * hay BUILD_API_URL o la API no contesta, devuelve null y la página los pide
 * al abrirse. Solo se usa desde componentes de servidor.
 */
export async function sitioDelBuild(): Promise<Sitio | null> {
  const base = process.env.BUILD_API_URL;
  if (!base) return null;
  try {
    const res = await fetch(`${base.replace(/\/+$/, "")}/api/v1/sitio`, { signal: AbortSignal.timeout(4000) });
    return res.ok ? ((await res.json()) as Sitio) : null;
  } catch {
    return null;
  }
}
