"use client";

import { useEffect, useState } from "react";
import { api } from "./api";
import type { Sitio } from "./tipos";

// Datos públicos del taller (precios, dirección, horarios). La página llega
// con lo que había al compilar (si había API) y se actualiza al abrirse, así un
// cambio de precio desde el panel se ve sin volver a compilar.

let cache: Sitio | null = null;
let pedido: Promise<Sitio> | null = null;

export function useSitio(inicial: Sitio | null) {
  const [sitio, setSitio] = useState<Sitio | null>(cache ?? inicial);
  const [error, setError] = useState(false);

  useEffect(() => {
    let vivo = true;
    pedido ??= api<Sitio>("/api/v1/sitio");
    pedido
      .then((s) => {
        cache = s;
        if (vivo) setSitio(s);
      })
      .catch(() => {
        pedido = null;
        if (vivo) setError(true);
      });
    return () => {
      vivo = false;
    };
  }, []);

  return { sitio, error: error && !sitio };
}
