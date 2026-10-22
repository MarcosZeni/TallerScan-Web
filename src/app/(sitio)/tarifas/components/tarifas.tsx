"use client";

import { useEffect } from "react";
import { Pizarra } from "@/components/pizarra";
import { Aviso, Cargando } from "@/components/ui/aviso";
import { ButtonLink } from "@/components/ui/button";
import { registrarVisita } from "@/lib/atribucion";
import { useSitio } from "@/lib/sitio";
import type { Sitio } from "@/lib/tipos";

export function Tarifas({ inicial }: { inicial: Sitio | null }) {
  const { sitio, error } = useSitio(inicial);
  useEffect(() => registrarVisita("tarifas"), []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-4xl font-bold sm:text-5xl">Precios</h1>
      <p className="mt-3 text-muted">
        Cada servicio indica si el precio es solo mano de obra o si incluye materiales. Son valores estimados; el final depende
        del modelo y del estado del auto, y te lo confirmamos al revisarlo, antes de empezar.
      </p>

      <div className="mt-8">
        {sitio ? (
          <Pizarra servicios={sitio.servicios} conLinks />
        ) : error ? (
          <Aviso tipo="error" titulo="No pudimos cargar los precios">Recargá la página en un rato.</Aviso>
        ) : (
          <Cargando texto="Cargando precios…" />
        )}
      </div>

      <div className="mt-10 rounded-md border-2 border-border bg-surface p-5">
        <p className="text-lg font-semibold">¿No encontrás lo que necesitás?</p>
        <p className="text-muted">Pedí turno con la opción &quot;Otro&quot; y contanos qué le pasa al auto.</p>
        <ButtonLink href="/turnos" variante="accion" className="mt-4">Pedir turno</ButtonLink>
      </div>
    </div>
  );
}
