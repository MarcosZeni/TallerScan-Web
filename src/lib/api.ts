// Única puerta a la API. La web es estática: todo se pide desde el navegador.
//
// En producción NEXT_PUBLIC_API_URL va vacía y las llamadas van a /api en el
// mismo origen (nginx las pasa a ApiCore). En desarrollo apunta a
// http://localhost:5100: mismo "sitio" que localhost:3000, así la cookie de
// sesión (SameSite=Strict) viaja igual.
const BASE = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, "");

export const apiUrl = (path: string) => `${BASE}${path}`;

/** Error de la API con código estable y mensaje listo para mostrar. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly codigo: string,
    mensaje: string,
    readonly campo?: string | null,
  ) {
    super(mensaje);
  }
}

type Init = Omit<RequestInit, "body"> & { json?: unknown; body?: BodyInit };

export async function api<T>(path: string, init: Init = {}): Promise<T> {
  const { json, ...resto } = init;
  const headers = new Headers(resto.headers);
  if (json !== undefined) headers.set("Content-Type", "application/json");

  let res: Response;
  try {
    res = await fetch(apiUrl(path), {
      ...resto,
      headers,
      body: json !== undefined ? JSON.stringify(json) : resto.body,
      credentials: "include",
      cache: "no-store",
    });
  } catch {
    throw new ApiError(0, "sin_conexion", "No pudimos conectarnos. Revisá tu conexión y probá de nuevo.");
  }

  if (res.ok) {
    const texto = await res.text();
    return (texto ? JSON.parse(texto) : undefined) as T;
  }

  const cuerpo = (await res.json().catch(() => null)) as { codigo?: string; mensaje?: string; campo?: string } | null;
  throw new ApiError(
    res.status,
    cuerpo?.codigo ?? "error",
    cuerpo?.mensaje ?? (res.status >= 500 ? "El sistema no responde. Probá de nuevo en un rato." : "Algo salió mal. Probá de nuevo."),
    cuerpo?.campo,
  );
}

export const mensajeDe = (e: unknown) => (e instanceof Error ? e.message : "Algo salió mal. Probá de nuevo.");
