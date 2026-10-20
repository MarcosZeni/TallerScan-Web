"use client";

import { useEffect } from "react";
import { Cargando } from "@/components/ui/aviso";
import { ButtonLink } from "@/components/ui/button";
import { registrarVisita } from "@/lib/atribucion";
import { useSitio } from "@/lib/sitio";
import type { Sitio } from "@/lib/tipos";

/**
 * Quiénes somos. El texto sale de Ajustes ("Página Nosotros"): párrafos
 * separados por una línea en blanco. Sin nombres propios ni talleres ajenos.
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
          {parrafos.map((p, i) => <p key={i}>{p}</p>)}
        </div>
      )}
      <div className="mt-10 flex flex-wrap gap-3">
        <ButtonLink href="/turnos" variante="accion">Pedir turno</ButtonLink>
        <ButtonLink href="/tarifas" variante="secundario">Ver precios</ButtonLink>
      </div>
    </div>
  );
}
