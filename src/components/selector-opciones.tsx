"use client";

import { fechaCorta, hora } from "@/lib/format";
import type { Disponibilidad, Opcion } from "@/lib/tipos";

/** El mismo tope que la API (TurnoService.ValidarOpcionesAsync): 5 días completos. */
export const MAX_OPCIONES = 10;

const igual = (a: Opcion, b: Opcion) => a.fecha === b.fecha && a.franja === b.franja;
const FRANJAS = ["manana", "tarde"] as const;

/**
 * Turno express: el cliente toca en qué días y franjas puede traer el auto.
 * Una fila por día: "Todo el día" marca las dos franjas de una, y después
 * mañana y tarde por separado. Botones grandes y con texto, no un calendario:
 * es más fácil en el celular y para cualquier edad.
 *
 * De madrugada la API suma hoy como primer día, solo con las franjas que
 * todavía tienen lugar (`manana`/`tarde` de cada día): las otras quedan apagadas.
 */
export function SelectorOpciones({ disp, valor, onChange }: {
  disp: Disponibilidad;
  valor: Opcion[];
  onChange: (o: Opcion[]) => void;
}) {
  const marcada = (o: Opcion) => valor.some((v) => igual(v, o));
  const lleno = valor.length >= MAX_OPCIONES;

  const toggle = (o: Opcion) =>
    onChange(marcada(o) ? valor.filter((v) => !igual(v, o)) : lleno ? valor : [...valor, o]);

  const toggleDia = (fecha: string, franjas: readonly (typeof FRANJAS)[number][]) => {
    const delDia = franjas.map((franja) => ({ fecha, franja }));
    const completo = delDia.every(marcada);
    if (completo) onChange(valor.filter((v) => v.fecha !== fecha));
    else onChange([...valor, ...delDia.filter((o) => !marcada(o))].slice(0, MAX_OPCIONES));
  };

  if (disp.dias.length === 0)
    return <p className="text-muted">No hay días disponibles en los próximos días. Escribinos por WhatsApp.</p>;

  return (
    <div>
      <ul className="space-y-2">
        {disp.dias.map((d) => {
          // Las franjas que se pueden elegir ese día (los días de adelante tienen las dos).
          const posibles = FRANJAS.filter((f) => d[f]);
          const esHoy = d.fecha === disp.hoy.fecha;
          const completo = posibles.length > 0 && posibles.every((franja) => marcada({ fecha: d.fecha, franja }));
          const faltan = posibles.filter((franja) => !marcada({ fecha: d.fecha, franja })).length;
          const sinLugar = !completo && valor.length + faltan > MAX_OPCIONES;
          const titulo = `${esHoy ? "Hoy, " : ""}${fechaCorta(d.fecha)}`;
          return (
            <li key={d.fecha} className="rounded-md border-2 border-border bg-surface p-2">
              {posibles.length === FRANJAS.length ? (
                <label className={`flex min-h-11 cursor-pointer items-center gap-3 rounded px-1 ${sinLugar ? "opacity-50" : ""}`}>
                  <input type="checkbox" className="size-6 accent-[var(--color-primary)]" checked={completo}
                    disabled={sinLugar}
                    onChange={() => toggleDia(d.fecha, posibles)} />
                  <span className="font-semibold capitalize">{titulo}</span>
                  <span className="text-sm text-muted">Todo el día</span>
                </label>
              ) : (
                <p className="flex min-h-11 items-center px-1 font-semibold capitalize">{titulo}</p>
              )}
              <div className="mt-2 grid grid-cols-2 gap-2">
                {FRANJAS.map((f) => {
                  const o = { fecha: d.fecha, franja: f };
                  const activo = marcada(o);
                  const hay = d[f];
                  return (
                    <button key={f} type="button" aria-pressed={activo} onClick={() => toggle(o)}
                      disabled={!hay || (!activo && lleno)}
                      className={`min-h-12 rounded-md border-2 px-2 text-left disabled:opacity-40 ${activo ? "border-primary bg-primary text-on-primary" : "border-border bg-background hover:border-primary"}`}>
                      <span className="block font-semibold">{activo ? "✓ " : ""}{f === "manana" ? "Mañana" : "Tarde"}</span>
                      <span className="tabular text-sm">{hay ? `${hora(disp.franjas[f].desde)} a ${hora(disp.franjas[f].hasta)}` : "Sin lugar hoy"}</span>
                    </button>
                  );
                })}
              </div>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-sm text-muted" aria-live="polite">
        {valor.length === 0
          ? "Marcá todo lo que te sirva. Cuantas más opciones, más rápido te damos turno."
          : lleno
            ? `Marcaste el máximo (${MAX_OPCIONES}). Elegimos una y te confirmamos por WhatsApp.`
            : `${valor.length} ${valor.length === 1 ? "opción marcada" : "opciones marcadas"}. Elegimos una y te confirmamos el día y la hora por WhatsApp.`}
      </p>
    </div>
  );
}
