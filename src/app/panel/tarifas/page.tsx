"use client";

import { useState } from "react";
import { useDatos } from "@/lib/use-datos";
import { Aviso, Cargando } from "@/components/ui/aviso";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { api, mensajeDe } from "@/lib/api";
import { formatoPesos, rangoPesos } from "@/lib/format";
import { siVencio, useUsuario } from "@/lib/sesion";
import type { ConfigCompleta, PreciosConfig, ServicioAdmin } from "@/lib/tipos";

export default function Page() {
  const { usuario } = useUsuario();
  const s = useDatos<ServicioAdmin[]>(usuario.editaTarifas ? "/api/v1/admin/servicios" : null);
  // Los tramos de ganancia son del dueño: a los demás ni se les piden.
  const c = useDatos<ConfigCompleta>(usuario.esDueno ? "/api/v1/admin/config" : null);
  const servicios = s.datos, precios = c.datos?.precios ?? null;
  const cargar = () => { s.recargar(); if (usuario.esDueno) c.recargar(); };

  if (!usuario.editaTarifas) return <Aviso tipo="atencion">Los precios los edita solo quien tiene el permiso de tarifas.</Aviso>;
  if (s.error || c.error) return <Aviso tipo="error">{s.error ?? c.error}</Aviso>;
  if (!servicios || (usuario.esDueno && !precios)) return <Cargando />;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold sm:text-4xl">Precios</h1>
        <p className="text-muted">Cargás el precio base (lo que cobra el mecánico). La web publica el precio final, redondeado hacia arriba.</p>
      </div>
      {precios && <Tramos inicial={precios} onGuardado={cargar} />}
      <section className="space-y-3">
        <h2 className="text-2xl font-bold">Servicios</h2>
        {servicios.map((s) => <ServicioFila key={s.id} s={s} onGuardado={cargar} />)}
        <ServicioFila s={null} onGuardado={cargar} />
      </section>
    </div>
  );
}

function Tramos({ inicial, onGuardado }: { inicial: PreciosConfig; onGuardado: () => void }) {
  const [p, setP] = useState(inicial);
  const [msg, setMsg] = useState<{ tipo: "ok" | "error"; t: string } | null>(null);

  async function guardar() {
    setMsg(null);
    try {
      await api("/api/v1/admin/config/precios", { method: "PUT", json: p });
      setMsg({ tipo: "ok", t: "Guardado. Los precios de la web ya están actualizados." });
      onGuardado();
    } catch (e) {
      if (!siVencio(e)) setMsg({ tipo: "error", t: mensajeDe(e) });
    }
  }

  const setTramo = (i: number, c: Partial<PreciosConfig["tramos"][number]>) =>
    setP({ ...p, tramos: p.tramos.map((t, k) => (k === i ? { ...t, ...c } : t)) });

  return (
    <section className="space-y-4 rounded-md border-2 border-border bg-surface p-4">
      <h2 className="text-2xl font-bold">Ganancia por tramos</h2>
      <p className="text-muted">Cada porcentaje se aplica solo a la parte del precio base que cae en su tramo.</p>
      <div className="space-y-2">
        {p.tramos.map((t, i) => {
          const desde = i === 0 ? 0 : p.tramos[i - 1].hasta ?? 0;
          const ultimo = i === p.tramos.length - 1;
          return (
            <div key={i} className="flex flex-wrap items-end gap-3">
              <p className="tabular min-w-28 pb-2.5">Desde {formatoPesos(desde)}</p>
              {!ultimo ? (
                <Field label="Hasta" htmlFor={`th-${i}`}>
                  <Input id={`th-${i}`} inputMode="numeric" className="w-36" value={t.hasta ?? ""} onChange={(e) => setTramo(i, { hasta: Number(e.target.value.replace(/\D/g, "")) || null })} />
                </Field>
              ) : <p className="pb-2.5 text-muted">en adelante</p>}
              <Field label="%" htmlFor={`tp-${i}`}>
                <Input id={`tp-${i}`} inputMode="decimal" className="w-24" value={t.porcentaje} onChange={(e) => setTramo(i, { porcentaje: Number(e.target.value.replace(",", ".")) || 0 })} />
              </Field>
              {p.tramos.length > 1 && <Button variante="fantasma" onClick={() => {
                const tramos = p.tramos.filter((_, k) => k !== i);
                tramos[tramos.length - 1] = { ...tramos[tramos.length - 1], hasta: null };
                setP({ ...p, tramos });
              }}>Quitar</Button>}
            </div>
          );
        })}
        <Button variante="fantasma" onClick={() => {
          const tramos = [...p.tramos];
          const ultimo = tramos[tramos.length - 1];
          const anterior = tramos.length > 1 ? tramos[tramos.length - 2].hasta ?? 0 : 0;
          tramos[tramos.length - 1] = { ...ultimo, hasta: anterior + 200000 };
          tramos.push({ hasta: null, porcentaje: ultimo.porcentaje });
          setP({ ...p, tramos });
        }}>Agregar tramo</Button>
      </div>
      <div className="flex flex-wrap gap-4">
        <Field label="Redondear hacia arriba a múltiplos de" htmlFor="red">
          <Input id="red" inputMode="numeric" className="w-36" value={p.redondeo} onChange={(e) => setP({ ...p, redondeo: Number(e.target.value.replace(/\D/g, "")) || 1 })} />
        </Field>
        <Field label="Del escaneo, para el mecánico" htmlFor="esc">
          <Input id="esc" inputMode="numeric" className="w-36" value={p.escaneoParteMecanico} onChange={(e) => setP({ ...p, escaneoParteMecanico: Number(e.target.value.replace(/\D/g, "")) || 0 })} />
        </Field>
      </div>
      {msg && <Aviso tipo={msg.tipo === "ok" ? "ok" : "error"}>{msg.t}</Aviso>}
      <Button variante="accion" onClick={guardar}>Guardar tramos</Button>
    </section>
  );
}

function ServicioFila({ s, onGuardado }: { s: ServicioAdmin | null; onGuardado: () => void }) {
  const [abierto, setAbierto] = useState(false);
  const [v, setV] = useState({
    categoria: s?.categoria ?? "", nombre: s?.nombre ?? "", tiempo: s?.tiempo ?? "1 h",
    baseMin: String(s?.baseMin ?? ""), baseMax: String(s?.baseMax ?? ""), precioFijo: String(s?.precioFijo ?? ""),
    orden: String(s?.orden ?? 500), activo: s?.activo ?? true, esEscaneo: s?.esEscaneo ?? false,
  });
  const [error, setError] = useState<string | null>(null);

  async function guardar() {
    setError(null);
    const n = (x: string) => (x.trim() === "" ? null : Number(x.replace(/\D/g, "")));
    try {
      await api(`/api/v1/admin/servicios${s ? `/${s.id}` : ""}`, {
        method: s ? "PUT" : "POST",
        json: { ...v, baseMin: n(v.baseMin) ?? 0, baseMax: n(v.baseMax), precioFijo: n(v.precioFijo), orden: n(v.orden) ?? 0 },
      });
      setAbierto(false);
      onGuardado();
    } catch (e) {
      if (!siVencio(e)) setError(mensajeDe(e));
    }
  }

  if (!abierto) {
    return s ? (
      <div className={`flex flex-wrap items-center justify-between gap-3 rounded-md border-2 border-border bg-surface p-3 ${s.activo ? "" : "opacity-60"}`}>
        <div>
          <p className="font-semibold">{s.nombre}{!s.activo && " (oculto)"}</p>
          <p className="tabular text-sm text-muted">
            Base {s.precioFijo != null ? `fijo ${formatoPesos(s.precioFijo)}` : rangoPesos(s.baseMin, s.baseMax ?? s.baseMin)} → en la web <b className="text-foreground">{rangoPesos(s.precioMin, s.precioMax)}</b>
          </p>
        </div>
        <Button variante="fantasma" onClick={() => setAbierto(true)}>Editar</Button>
      </div>
    ) : <Button variante="secundario" onClick={() => setAbierto(true)}>Agregar servicio</Button>;
  }

  return (
    <div className="space-y-3 rounded-md border-2 border-primary bg-surface p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Nombre" htmlFor={`n-${s?.id}`}><Input id={`n-${s?.id}`} value={v.nombre} onChange={(e) => setV({ ...v, nombre: e.target.value })} /></Field>
        <Field label="Categoría" htmlFor={`c-${s?.id}`}><Input id={`c-${s?.id}`} value={v.categoria} onChange={(e) => setV({ ...v, categoria: e.target.value })} /></Field>
        <Field label="Base mínima" htmlFor={`bm-${s?.id}`}><Input id={`bm-${s?.id}`} inputMode="numeric" value={v.baseMin} onChange={(e) => setV({ ...v, baseMin: e.target.value })} /></Field>
        <Field label="Base máxima (si es un rango)" htmlFor={`bx-${s?.id}`}><Input id={`bx-${s?.id}`} inputMode="numeric" value={v.baseMax} onChange={(e) => setV({ ...v, baseMax: e.target.value })} /></Field>
        <Field label="Precio fijo (pisa la fórmula)" htmlFor={`pf-${s?.id}`} ayuda="Para el escaneo. Vacío = se calcula."><Input id={`pf-${s?.id}`} inputMode="numeric" value={v.precioFijo} onChange={(e) => setV({ ...v, precioFijo: e.target.value })} /></Field>
        <Field label="Tiempo estimado" htmlFor={`t-${s?.id}`}><Input id={`t-${s?.id}`} value={v.tiempo} onChange={(e) => setV({ ...v, tiempo: e.target.value })} /></Field>
        <Field label="Orden en la lista" htmlFor={`o-${s?.id}`}><Input id={`o-${s?.id}`} inputMode="numeric" value={v.orden} onChange={(e) => setV({ ...v, orden: e.target.value })} /></Field>
      </div>
      <label className="flex items-center gap-2"><input type="checkbox" className="size-5" checked={v.activo} onChange={(e) => setV({ ...v, activo: e.target.checked })} /> Se muestra en la web</label>
      <label className="flex items-center gap-2"><input type="checkbox" className="size-5" checked={v.esEscaneo} onChange={(e) => setV({ ...v, esEscaneo: e.target.checked })} /> Es el escaneo (se reparte fijo y se puede descontar)</label>
      {error && <Aviso tipo="error">{error}</Aviso>}
      <div className="flex gap-3">
        <Button variante="primario" onClick={guardar}>Guardar</Button>
        <Button variante="fantasma" onClick={() => setAbierto(false)}>Volver</Button>
      </div>
    </div>
  );
}
