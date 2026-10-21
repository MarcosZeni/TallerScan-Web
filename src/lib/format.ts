const pesos = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 });

export const formatoPesos = (n: number) => `$${pesos.format(n)}`;

export const rangoPesos = (min: number, max: number) =>
  min === max ? formatoPesos(min) : `${formatoPesos(min)} a ${formatoPesos(max)}`;

/** "2026-10-16" → Date local (sin corrimiento por zona horaria). */
export const dia = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const isoDia = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const sumarDias = (iso: string, n: number) => {
  const d = dia(iso);
  d.setDate(d.getDate() + n);
  return isoDia(d);
};

export const fechaLarga = (iso: string) =>
  dia(iso).toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });

export const fechaCorta = (iso: string) =>
  dia(iso).toLocaleDateString("es-AR", { weekday: "short", day: "numeric", month: "short" });

/** "09:00:00" → "09:00". */
export const hora = (h: string | null | undefined) => (h ? h.slice(0, 5) : "");

/** "08:30" → "8:30": como se dice en voz alta, sin el cero de la izquierda. */
export const horaCorta = (h: string | null | undefined) => (h ? `${Number(h.slice(0, 2))}${h.slice(2, 5)}` : "");

export const franjaTexto = (f: string | null) => (f === "manana" ? "por la mañana" : f === "tarde" ? "por la tarde" : "");

export const ESTADOS: Record<string, string> = {
  pendiente: "Esperando confirmación",
  confirmado: "Confirmado",
  rechazado: "No se pudo tomar",
  liberado: "Se liberó sin confirmar",
  cancelado: "Cancelado",
  realizado: "Realizado",
  archivado: "Archivado",
};

/** Respuestas de "¿Cómo nos conociste?" (la base guarda la clave). */
export const CONOCIO: Record<string, string> = {
  instagram: "Instagram", facebook: "Facebook", tiktok: "TikTok", google: "Google",
  recomendacion: "Recomendación", paso: "Pasó por el taller", otro: "Otro", sin_dato: "No contestó",
};

/** Hoy en la hora del taller (Argentina), como "2026-10-16". */
export const hoyTaller = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "America/Argentina/Buenos_Aires" }).format(new Date());
