"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { urlFoto } from "@/lib/fotos";
import type { Foto } from "@/lib/tipos";

/**
 * Fotos del taller debajo del texto de "Nosotros". La página es estática: se
 * piden al abrirla, como el resto de lo que cambia. Sin fotos, o si la API no
 * contesta, no se muestra nada (el texto ya alcanza).
 */
export function Galeria() {
  const [fotos, setFotos] = useState<Foto[]>([]);

  useEffect(() => {
    api<Foto[]>("/api/v1/fotos").then(setFotos).catch(() => setFotos([]));
  }, []);

  if (fotos.length === 0) return null;

  return (
    <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2" aria-label="Fotos del taller">
      {fotos.map((f) => (
        <li key={f.id} className="overflow-hidden rounded-md border-2 border-border bg-surface">
          {/* width/height reservan el lugar antes de que cargue (sin saltos); la altura real la fija el ancho de la columna. */}
          {/* eslint-disable-next-line @next/next/no-img-element -- export estático: sin optimizador de imágenes */}
          <img src={urlFoto(f.id)} alt={f.texto ?? ""} width={f.ancho} height={f.alto} loading="lazy" decoding="async" className="block h-auto w-full" />
          {f.texto && <p className="px-3 py-2 text-sm text-muted">{f.texto}</p>}
        </li>
      ))}
    </ul>
  );
}
