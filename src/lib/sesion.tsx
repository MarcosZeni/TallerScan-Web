"use client";

import { createContext, useContext } from "react";
import { ApiError } from "./api";
import type { Usuario } from "./tipos";
import { useDatos } from "./use-datos";

// Sesión del panel. La cookie es httpOnly (la pone la API), así que la web no
// la ve: pregunta /auth/yo. Esto es comodidad para mostrar u ocultar cosas;
// quien autoriza es la API en cada pedido. Un 401 manda a /ingresar (useDatos).

type Ctx = { usuario: Usuario; recargar: () => void };
const SesionCtx = createContext<Ctx | null>(null);

export function useUsuario() {
  const c = useContext(SesionCtx);
  if (!c) throw new Error("useUsuario fuera del panel");
  return c;
}

export function SesionProvider({ children }: { children: React.ReactNode }) {
  const { datos: usuario, error, recargar } = useDatos<Usuario>("/api/v1/auth/yo");

  if (error) return <p className="p-6 text-danger">{error} Recargá la página.</p>;
  if (!usuario) return <p className="p-6 text-muted">Cargando…</p>;
  return <SesionCtx.Provider value={{ usuario, recargar }}>{children}</SesionCtx.Provider>;
}

/** Errores 401 en medio de una acción (sesión vencida): mandar a ingresar. */
export function siVencio(e: unknown) {
  if (e instanceof ApiError && e.status === 401) {
    window.location.replace(`/ingresar?volver=${encodeURIComponent(window.location.pathname)}`);
    return true;
  }
  return false;
}
