"use client";

import { useMemo, useState } from "react";
import { Aviso } from "@/components/ui/aviso";
import { Button } from "@/components/ui/button";
import { api, mensajeDe } from "@/lib/api";
import { siVencio } from "@/lib/sesion";
import type { Agenda } from "@/lib/tipos";

const aMin = (h: string) => Number(h.slice(0, 2)) * 60 + Number(h.slice(3, 5));
const aHora = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

type Slot = { inicio: string; activo: boolean; cupo: number; ocupados: number };

/**
 * "Estoy disponible": el mecánico elige el tamaño de bloque y toca los
 * horarios libres. La grilla va del inicio de la mañana al fin de la tarde, y
 * el corte del mediodía arranca apagado (se puede prender si ese día no cortan).
 */
export function EditorJornada({ fecha, agenda, onGuardado, onCancelar }: {
  fecha: string;
  agenda: Agenda;
  onGuardado: () => void;
  onCancelar?: () => void;
}) {
  const j = agenda.jornada;
  const [minutos, setMinutos] = useState(j?.bloqueMinutos ?? 60);
  const [cambios, setCambios] = useState<Record<string, { activo: boolean; cupo: number }>>({});
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const slots: Slot[] = useMemo(() => {
    const desde = aMin(agenda.franjas.manana.desde), hasta = aMin(agenda.franjas.tarde.hasta);
    const corteD = aMin(agenda.corte.desde), corteH = aMin(agenda.corte.hasta);
    const existentes = new Map((j?.bloques ?? []).map((b) => [b.inicio.slice(0, 5), b]));
    const lista: Slot[] = [];
    for (let m = desde; m + minutos <= hasta; m += minutos) {
      const h = aHora(m);
      const ex = existentes.get(h);
      const enCorte = m < corteH && m + minutos > corteD;
      lista.push({ inicio: h, activo: ex ? true : j ? false : !enCorte, cupo: ex?.cupo ?? 1, ocupados: ex?.ocupados ?? 0 });
      existentes.delete(h);
    }
    // Bloques que quedaron fuera de la grilla nueva (otro tamaño): se muestran igual.
    for (const [h, b] of existentes) lista.push({ inicio: h, activo: true, cupo: b.cupo, ocupados: b.ocupados });
    return lista
      .map((s) => ({ ...s, ...cambios[s.inicio] }))
      .sort((a, b) => a.inicio.localeCompare(b.inicio));
  }, [agenda, j, minutos, cambios]);

  const cambiar = (s: Slot, c: Partial<{ activo: boolean; cupo: number }>) =>
    // `s` ya trae los cambios anteriores aplicados: alcanza con pisar lo nuevo.
    setCambios((x) => ({ ...x, [s.inicio]: { activo: s.activo, cupo: s.cupo, ...c } }));

  async function guardar(estado: "abierta" | "cerrada") {
    setGuardando(true);
    setError(null);
    try {
      await api(`/api/v1/panel/jornadas/${fecha}`, {
        method: "PUT",
        json: {
          estado,
          bloqueMinutos: minutos,
          bloques: estado === "cerrada" ? slots.filter((s) => s.ocupados > 0).map((s) => ({ inicio: `${s.inicio}:00`, cupo: s.cupo }))
            : slots.filter((s) => s.activo).map((s) => ({ inicio: `${s.inicio}:00`, cupo: s.cupo })),
        },
      });
      onGuardado();
    } catch (e) {
      if (!siVencio(e)) setError(mensajeDe(e));
    } finally {
      setGuardando(false);
    }
  }

  const activos = slots.filter((s) => s.activo);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold">{j ? "Horarios del día" : "¿Hoy atendés?"}</h2>
        <p className="text-muted">Tocá los horarios en los que podés recibir autos. Los apagados no se pueden pedir.</p>
      </div>

      <div>
        <p className="mb-2 font-semibold">Tamaño de cada bloque</p>
        <div className="grid grid-cols-3 gap-2 sm:max-w-md" role="radiogroup">
          {[30, 60, 120].map((m) => (
            <button key={m} role="radio" aria-checked={minutos === m} onClick={() => { setMinutos(m); setCambios({}); }}
              className={`min-h-11 rounded-md border-2 font-semibold ${minutos === m ? "border-primary bg-primary text-on-primary" : "border-border"}`}>
              {m === 30 ? "30 min" : m === 60 ? "1 hora" : "2 horas"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {slots.map((s) => (
          <div key={s.inicio} className={`rounded-md border-2 p-2 ${s.activo ? "border-primary bg-primary-soft" : "border-border"}`}>
            <label className="flex min-h-10 cursor-pointer items-center gap-2">
              <input type="checkbox" className="size-5 accent-[var(--color-primary)]" checked={s.activo}
                disabled={s.ocupados > 0} onChange={(e) => cambiar(s, { activo: e.target.checked })} />
              <span className="tabular font-display text-xl font-bold">{s.inicio}</span>
            </label>
            {s.activo && (
              <div className="mt-1 flex items-center justify-between gap-1 text-sm">
                <span className="text-muted">{s.ocupados > 0 ? `${s.ocupados} tomado${s.ocupados > 1 ? "s" : ""}` : "Autos"}</span>
                <span className="flex items-center gap-1">
                  <button aria-label={`Menos autos a las ${s.inicio}`} className="size-8 rounded border border-border font-bold disabled:opacity-40"
                    disabled={s.cupo <= Math.max(1, s.ocupados)} onClick={() => cambiar(s, { cupo: s.cupo - 1 })}>−</button>
                  <span className="tabular w-5 text-center font-semibold">{s.cupo}</span>
                  <button aria-label={`Más autos a las ${s.inicio}`} className="size-8 rounded border border-border font-bold disabled:opacity-40"
                    disabled={s.cupo >= 10} onClick={() => cambiar(s, { cupo: s.cupo + 1 })}>+</button>
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {error && <Aviso tipo="error">{error}</Aviso>}

      <div className="flex flex-wrap gap-3">
        <Button variante="accion" disabled={guardando || activos.length === 0} onClick={() => guardar("abierta")} className="px-6">
          {j?.estado === "abierta" ? "Guardar horarios" : "Estoy disponible"}
        </Button>
        <Button variante="peligro" disabled={guardando} onClick={() => guardar("cerrada")}>Cerrado, no hay turnos</Button>
        {onCancelar && <Button variante="fantasma" onClick={onCancelar}>Volver</Button>}
      </div>
    </div>
  );
}
