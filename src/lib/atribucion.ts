// De dónde vino el visitante, para las métricas de publicidad.
//
// Cada publicidad lleva su link con ?utm_source=instagram&utm_campaign=...
// Se guarda la PRIMERA visita con parámetros (la publicidad que lo trajo) y
// se manda junto con el turno. Sin cookies de seguimiento ni servicios de
// terceros: solo localStorage del propio navegador.

import { api } from "./api";

const CLAVE = "ts_origen";

type Origen = { origen: string; campania: string };

function leer(): Origen | null {
  try {
    const v = localStorage.getItem(CLAVE);
    return v ? (JSON.parse(v) as Origen) : null;
  } catch {
    return null;
  }
}

export function capturarOrigen(): Origen {
  const guardado = leer();
  if (typeof window === "undefined") return guardado ?? { origen: "", campania: "" };

  const p = new URLSearchParams(window.location.search);
  const origen = p.get("utm_source") ?? p.get("origen") ?? "";
  const campania = p.get("utm_campaign") ?? p.get("campania") ?? "";

  if (origen && !guardado) {
    try {
      localStorage.setItem(CLAVE, JSON.stringify({ origen, campania }));
    } catch {
      // Navegador sin almacenamiento: se cuenta igual esta visita.
    }
    return { origen, campania };
  }
  if (guardado) return guardado;

  // Sin parámetros: si viene de un buscador o red, al menos eso.
  const ref = document.referrer;
  if (ref && !ref.startsWith(window.location.origin)) {
    try {
      return { origen: new URL(ref).hostname.replace(/^www\./, "").split(".")[0], campania: "" };
    } catch {
      /* referrer raro */
    }
  }
  return { origen: "", campania: "" };
}

const contadas = new Set<string>();

/** Suma una visita a la página (una vez por carga). Nunca muestra error. */
export function registrarVisita(pagina: string) {
  if (contadas.has(pagina)) return;
  contadas.add(pagina);
  const { origen, campania } = capturarOrigen();
  api("/api/v1/visitas", { method: "POST", json: { pagina, origen, campania } }).catch(() => {});
}
