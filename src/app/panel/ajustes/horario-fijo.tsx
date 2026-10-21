"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import type { HorarioFijo } from "@/lib/tipos";

const aMin = (h: string) => Number(h.slice(0, 2)) * 60 + Number(h.slice(3, 5));
const aHora = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

/**
 * "Horario fijo": con lo que se abre sola la agenda de hoy cada día de atención. Es el mismo
 * armado que "Estoy disponible" (tamaño de bloque, horarios y cuántos autos entran en cada uno),
 * pero guardado de una vez para que nadie tenga que abrir el día a mano.
 */
export function HorarioFijoEditor({ valor, onChange }: { valor: HorarioFijo; onChange: (v: HorarioFijo) => void }) {
  const cambiarBloque = (i: number, cambio: Partial<HorarioFijo["bloques"][number]>) =>
    onChange({ ...valor, bloques: valor.bloques.map((b, j) => (j === i ? { ...b, ...cambio } : b)) });

  const agregar = () => {
    // El siguiente a continuación del último; si no hay ninguno, las 9.
    const ultimo = valor.bloques.reduce((m, b) => Math.max(m, aMin(b.inicio)), -1);
    const siguiente = ultimo < 0 ? 9 * 60 : ultimo + valor.bloqueMinutos;
    onChange({ ...valor, bloques: [...valor.bloques, { inicio: aHora(Math.min(siguiente, 23 * 60)), cupo: 1 }] });
  };

  return (
    <div className="space-y-4 rounded-md border-2 border-border bg-surface p-4">
      <div>
        <h3 className="text-xl font-bold">Horario fijo</h3>
        <p className="text-muted">
          Cada día de atención la agenda de hoy se abre sola con estos horarios, así no depende de que te acuerdes de tocar
          &quot;Estoy disponible&quot;. Si ese día ya lo abriste, lo cambiaste o lo cerraste vos, no se toca.
        </p>
      </div>

      <label className="flex min-h-11 cursor-pointer items-center gap-3">
        <input type="checkbox" className="size-6 accent-[var(--color-primary)]" checked={valor.activo}
          onChange={(e) => onChange({ ...valor, activo: e.target.checked })} />
        <span className="font-semibold">Abrir la agenda sola</span>
      </label>

      {valor.activo && (
        <>
          <div>
            <p className="mb-2 font-semibold">Tamaño de cada bloque</p>
            <div className="grid grid-cols-3 gap-2 sm:max-w-md" role="radiogroup" aria-label="Tamaño de cada bloque">
              {[30, 60, 120].map((m) => (
                <button key={m} type="button" role="radio" aria-checked={valor.bloqueMinutos === m}
                  onClick={() => onChange({ ...valor, bloqueMinutos: m })}
                  className={`min-h-11 rounded-md border-2 font-semibold ${valor.bloqueMinutos === m ? "border-primary bg-primary text-on-primary" : "border-border"}`}>
                  {m === 30 ? "30 min" : m === 60 ? "1 hora" : "2 horas"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 font-semibold">Horarios y cuántos autos entran en cada uno</p>
            {valor.bloques.length === 0 && <p className="mb-2 text-muted">No hay ningún horario: agregá al menos uno.</p>}
            <ul className="space-y-2">
              {valor.bloques.map((b, i) => (
                <li key={i} className="flex flex-wrap items-center gap-3 rounded-md border-2 border-border bg-background p-2">
                  <div className="w-36">
                    <Input type="time" aria-label={`Hora del horario ${i + 1}`} value={b.inicio}
                      onChange={(e) => cambiarBloque(i, { inicio: e.target.value })} />
                  </div>
                  <span className="flex items-center gap-1">
                    <span className="mr-1 text-muted">Autos</span>
                    <button type="button" aria-label={`Menos autos a las ${b.inicio}`} disabled={b.cupo <= 1}
                      className="size-11 rounded border border-border text-lg font-bold disabled:opacity-40"
                      onClick={() => cambiarBloque(i, { cupo: b.cupo - 1 })}>−</button>
                    <span className="tabular w-6 text-center text-lg font-semibold">{b.cupo}</span>
                    <button type="button" aria-label={`Más autos a las ${b.inicio}`} disabled={b.cupo >= 10}
                      className="size-11 rounded border border-border text-lg font-bold disabled:opacity-40"
                      onClick={() => cambiarBloque(i, { cupo: b.cupo + 1 })}>+</button>
                  </span>
                  <Button variante="peligro" className="ml-auto" aria-label={`Quitar el horario de las ${b.inicio}`}
                    onClick={() => onChange({ ...valor, bloques: valor.bloques.filter((_, j) => j !== i) })}>Quitar</Button>
                </li>
              ))}
            </ul>
            <div className="mt-3">
              <Button variante="secundario" onClick={agregar} disabled={valor.bloques.length >= 48}>Agregar horario</Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
