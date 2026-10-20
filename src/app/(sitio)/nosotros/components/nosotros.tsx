"use client";

import { useEffect } from "react";
import { Cargando } from "@/components/ui/aviso";
import { ButtonLink } from "@/components/ui/button";
import { registrarVisita } from "@/lib/atribucion";
import { useSitio } from "@/lib/sitio";
import type { Sitio } from "@/lib/tipos";

/**
 * Quiénes somos. El texto sale de Ajustes ("Página Nosotros"): párrafos
 * separados por una línea en blanco y **negrita** entre dobles asteriscos (lo
 * único de formato que se admite; nada de HTML). Sin nombres propios ni
 * talleres ajenos.
 */
export function Nosotros({ inicial }: { inicial: Sitio | null }) {
  const { sitio } = useSitio(inicial);
  useEffect(() => registrarVisita("nosotros"), []);
  const t = sitio?.taller;
  const parrafos = (t?.nosotros ?? "").split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-4xl font-bold sm:text-5xl">Nosotros</h1>
      {!t ? <Cargando /> : parrafos.length === 0 ? (
        <p className="mt-6 text-muted">Pronto contamos quiénes somos. Mientras tanto, escribinos.</p>
      ) : (
        <div className="mt-6 space-y-5 text-lg leading-relaxed">
          {parrafos.map((p, i) => <p key={i}>{conNegritas(p)}</p>)}
        </div>
      )}
      <div className="mt-10 flex flex-wrap gap-3">
        <ButtonLink href="/turnos" variante="accion">Pedir turno</ButtonLink>
        <ButtonLink href="/tarifas" variante="secundario">Ver precios</ButtonLink>
      </div>
    </div>
  );
}

/** "texto **fuerte** texto" → texto, <strong>fuerte</strong>, texto. Sin cerrar, los asteriscos quedan como están. */
function conNegritas(texto: string) {
  const partes = texto.split(/\*\*(.+?)\*\*/);
  // Las posiciones impares son lo que estaba entre asteriscos.
  return partes.map((parte, i) => (i % 2 === 1 ? <strong key={i} className="font-semibold">{parte}</strong> : parte));
}
