"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError, api, mensajeDe } from "./api";

/**
 * Lee un endpoint GET y lo vuelve a leer cuando cambia el path o se llama a
 * `recargar()`. Con path null no pide nada (todavía no hace falta).
 *
 * El estado se actualiza solo cuando llega la respuesta (nunca de forma
 * sincrónica dentro del efecto), y una respuesta vieja que llega tarde no pisa
 * a la nueva. Una sesión vencida (401) en el panel manda a ingresar.
 */
export function useDatos<T>(path: string | null) {
  const [estado, setEstado] = useState<{ path: string | null; datos: T | null; error: string | null }>({ path: null, datos: null, error: null });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!path) return;
    let vivo = true;
    api<T>(path)
      .then((datos) => vivo && setEstado({ path, datos, error: null }))
      .catch((e) => {
        if (!vivo) return;
        if (e instanceof ApiError && e.status === 401 && window.location.pathname.startsWith("/panel")) {
          window.location.replace(`/ingresar?volver=${encodeURIComponent(window.location.pathname)}`);
          return;
        }
        setEstado((s) => ({ path, datos: s.path === path ? s.datos : null, error: mensajeDe(e) }));
      });
    return () => {
      vivo = false;
    };
  }, [path, version]);

  const recargar = useCallback(() => setVersion((v) => v + 1), []);
  const setDatos = useCallback((f: (d: T) => T) => setEstado((s) => (s.datos ? { ...s, datos: f(s.datos) } : s)), []);

  // Datos de otro path (por ejemplo, el día anterior) no se muestran como si fueran de este.
  const vigente = estado.path === path;
  return {
    datos: vigente ? estado.datos : null,
    error: vigente ? estado.error : null,
    cargando: !!path && (!vigente || (!estado.datos && !estado.error)),
    recargar,
    setDatos,
  };
}
