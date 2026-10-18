"use client";

import Link from "next/link";
import { useState } from "react";
import { Aviso, Etiqueta, tonoEstado } from "@/components/ui/aviso";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { api, ApiError, mensajeDe } from "@/lib/api";
import { ESTADOS, fechaCorta, franjaTexto, hora } from "@/lib/format";
import type { MiTurnoResumen } from "@/lib/tipos";

/**
 * Buscar los turnos propios sin el link: patente + WhatsApp o email. La
 * patente sola no alcanza (se ve en la calle); la API pide los dos.
 */
export function BuscarTurnos({ ultimo }: { ultimo: string | null }) {
  const [patente, setPatente] = useState("");
  const [contacto, setContacto] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [error, setError] = useState<{ mensaje: string; campo?: string | null } | null>(null);
  const [turnos, setTurnos] = useState<MiTurnoResumen[] | null>(null);

  async function buscar(ev: React.FormEvent) {
    ev.preventDefault();
    setBuscando(true);
    setError(null);
    try {
      setTurnos(await api<MiTurnoResumen[]>("/api/v1/turnos/buscar", { method: "POST", json: { patente, contacto } }));
    } catch (e) {
      setTurnos(null);
      setError({ mensaje: mensajeDe(e), campo: e instanceof ApiError ? e.campo : null });
    } finally {
      setBuscando(false);
    }
  }

  const e = (campo: string) => (error?.campo === campo ? error.mensaje : null);

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-4xl font-bold">Mi turno</h1>
      <p className="mt-3 text-muted">Buscá tus turnos con la patente y el WhatsApp o el email que dejaste al pedirlo.</p>

      {ultimo && (
        <div className="mt-6">
          <ButtonLink href={`/mi-turno?c=${encodeURIComponent(ultimo)}`} variante="primario">Ver mi último turno</ButtonLink>
        </div>
      )}

      <form className="mt-8 space-y-5" onSubmit={buscar} noValidate>
        <Field label="Patente" htmlFor="patente" error={e("patente")}>
          <Input id="patente" autoCapitalize="characters" value={patente} onChange={(x) => setPatente(x.target.value)}
            placeholder="AB123CD" className="uppercase" aria-invalid={!!e("patente")} required />
        </Field>
        <Field label="WhatsApp o email" htmlFor="contacto" ayuda="El mismo que pusiste al pedir el turno." error={e("contacto")}>
          <Input id="contacto" value={contacto} onChange={(x) => setContacto(x.target.value)}
            placeholder="11 2233 4455" autoComplete="email" aria-invalid={!!e("contacto")} required />
        </Field>
        {error && !error.campo && <Aviso tipo="error">{error.mensaje}</Aviso>}
        <Button type="submit" variante="accion" disabled={buscando}>{buscando ? "Buscando…" : "Buscar"}</Button>
      </form>

      {turnos && (
        <section className="mt-10 space-y-3" aria-live="polite">
          {turnos.length === 0 ? (
            <Aviso tipo="atencion" titulo="No encontramos turnos">
              Revisá la patente y que el WhatsApp o el email sean los mismos que dejaste al pedir el turno.
            </Aviso>
          ) : (
            <>
              <h2 className="text-2xl font-bold">Tus turnos</h2>
              <ul className="space-y-3">
                {turnos.map((t) => (
                  <li key={t.id}>
                    <Link href={`/mi-turno?c=${encodeURIComponent(t.codigo)}`}
                      className="block space-y-1 rounded-md border-2 border-border bg-surface p-4 hover:border-primary">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-display text-lg font-bold capitalize">
                          {t.estado === "pendiente" && t.tipo === "dia"
                            ? "Día a confirmar"
                            : `${fechaCorta(t.fecha)} ${t.hora ? `a las ${hora(t.hora)}` : franjaTexto(t.franja)}`}
                        </span>
                        <Etiqueta tono={tonoEstado(t.estado)}>{ESTADOS[t.estado]}</Etiqueta>
                      </div>
                      <p className="text-muted">{[...t.servicios, ...(t.otro ? [`Otro: ${t.otro}`] : [])].join(", ")}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      )}
    </div>
  );
}
