"use client";

import { useEffect } from "react";
import { Pizarra } from "@/components/pizarra";
import { ButtonLink } from "@/components/ui/button";
import { registrarVisita } from "@/lib/atribucion";
import { formatoPesos } from "@/lib/format";
import { useSitio } from "@/lib/sitio";
import type { Sitio } from "@/lib/tipos";

export function Inicio({ inicial }: { inicial: Sitio | null }) {
  const { sitio } = useSitio(inicial);
  useEffect(() => registrarVisita("inicio"), []);

  const escaneo = sitio?.escaneoPrecio || 20000;
  // Muestra corta del pizarrón: los trabajos más pedidos, no todo el tarifario.
  const muestra = (sitio?.servicios ?? []).filter((s) => !s.esEscaneo).slice(0, 4);

  return (
    <>
      <section className="bg-banda text-on-banda">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
          <p className="font-semibold text-banda-enlace">Escaneo computarizado</p>
          <h1 className="mt-2 max-w-3xl text-5xl font-bold sm:text-7xl">
            <span className="tabular">{formatoPesos(escaneo)}</span>, y si hacés el arreglo acá, te lo descontamos.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-banda-muted">
            Conectamos el escáner, te decimos qué tiene el auto y cuánto sale arreglarlo antes de tocar nada.
            Todos los precios están publicados.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/turnos" variante="accion" className="px-6 text-lg">Pedir turno</ButtonLink>
            <ButtonLink href="/tarifas" variante="banda" className="px-6 text-lg">Ver todos los precios</ButtonLink>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12">
        <h2 className="text-3xl font-bold sm:text-4xl">Lo que cuesta, antes de venir</h2>
        <p className="mt-2 max-w-xl text-muted">Cada servicio aclara si incluye materiales. El valor final depende del modelo y del estado del auto: te lo confirmamos al revisarlo.</p>
        <div className="mt-6">
          {muestra.length > 0 ? (
            <Pizarra servicios={muestra.map((s) => ({ ...s, categoria: "Los más pedidos" }))} conLinks />
          ) : (
            <p className="text-muted">Estamos cargando los precios.</p>
          )}
        </div>
        <ButtonLink href="/tarifas" variante="fantasma" className="mt-4 -ml-4">Ver el tarifario completo</ButtonLink>
      </section>

      <section className="border-y border-border bg-surface">
        <div className="mx-auto max-w-5xl px-4 py-12">
          <h2 className="text-3xl font-bold sm:text-4xl">Cómo pedir turno</h2>
          <ol className="mt-6 grid gap-6 sm:grid-cols-3">
            {[
              ["Elegí qué necesita el auto", "Uno o varios servicios, o contanos el problema con tus palabras."],
              ["Elegí cuándo", "Si hoy hay lugar, elegís la hora. Si no, el día y si te queda mejor a la mañana o a la tarde."],
              ["Te confirmamos", "Te llega un email y te escribimos por WhatsApp. Desde el link del email podés cancelarlo."],
            ].map(([titulo, texto], i) => (
              <li key={titulo} className="flex gap-4">
                <span aria-hidden className="font-display text-5xl font-bold leading-none text-primary">{i + 1}</span>
                <div>
                  <p className="text-lg font-semibold">{titulo}</p>
                  <p className="text-muted">{texto}</p>
                </div>
              </li>
            ))}
          </ol>
          <ButtonLink href="/turnos" variante="primario" className="mt-8">Pedir turno</ButtonLink>
        </div>
      </section>
    </>
  );
}
