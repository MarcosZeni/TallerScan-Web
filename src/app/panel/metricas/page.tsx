"use client";

import { useState } from "react";
import { Aviso, Cargando } from "@/components/ui/aviso";
import { CONOCIO, fechaCorta, formatoPesos, hoyTaller, sumarDias } from "@/lib/format";
import type { Metricas } from "@/lib/tipos";
import { useDatos } from "@/lib/use-datos";

const RANGOS = [
  { dias: 7, label: "7 días" },
  { dias: 30, label: "30 días" },
  { dias: 90, label: "90 días" },
  { dias: 365, label: "1 año" },
];

export default function Page() {
  const [dias, setDias] = useState(30);
  const hasta = hoyTaller();
  const { datos: m, error } = useDatos<Metricas>(`/api/v1/admin/metricas?desde=${sumarDias(hasta, -(dias - 1))}&hasta=${hasta}`);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-3xl font-bold sm:text-4xl">Métricas</h1>
        <div className="flex gap-1 rounded-md border-2 border-border p-1" role="radiogroup" aria-label="Período">
          {RANGOS.map((r) => (
            <button key={r.dias} role="radio" aria-checked={dias === r.dias} onClick={() => setDias(r.dias)}
              className={`min-h-10 rounded px-3 font-semibold ${dias === r.dias ? "bg-primary text-on-primary" : "hover:bg-primary-soft"}`}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {error && <Aviso tipo="error">{error}</Aviso>}
      {!m && !error && <Cargando />}
      {m && <Tablero m={m} />}
    </div>
  );
}

function Tablero({ m }: { m: Metricas }) {
  const pct = (n: number) => `${n.toLocaleString("es-AR")} %`;
  return (
    <>
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Dato titulo="Ingresos" valor={formatoPesos(m.ingresos)} pie={`${m.realizados} trabajos, promedio ${formatoPesos(m.ticketPromedio)}`} />
        <Dato titulo="Ganancia (tramos)" valor={formatoPesos(m.gananciaDesarrollador)} pie={`Mecánico: ${formatoPesos(m.parteMecanico)}`} />
        <Dato titulo="Pedidos de turno" valor={String(m.pedidos)} pie={`${m.visitas} visitas a la web`} />
        <Dato titulo="Tasa de éxito" valor={pct(m.tasaExito)} pie="de los pedidos se hicieron" />
      </section>

      <section>
        <h2 className="text-2xl font-bold">Del pedido al trabajo</h2>
        <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-4">
          <Fila t="Tasa de contacto" v={pct(m.tasaContacto)} d="pedidos / visitas" />
          <Fila t="Confirmados" v={`${m.confirmados} (${pct(m.tasaConfirmacion)})`} />
          <Fila t="Rechazados" v={String(m.rechazados)} />
          <Fila t="Cancelados" v={String(m.cancelados)} />
          <Fila t="Se liberaron sin respuesta" v={`${m.liberados} (${pct(m.tasaLiberados)})`} d="nadie contestó en 17 min" />
        </dl>
      </section>

      <section className="rounded-md border-2 border-border bg-surface p-4">
        <h2 className="text-2xl font-bold">¿Funciona el gancho del escaneo?</h2>
        {m.escaneo.realizados === 0 ? (
          <p className="mt-2 text-muted">Todavía no hay escaneos realizados en este período.</p>
        ) : (
          <p className="mt-2 text-lg">
            De <b>{m.escaneo.realizados}</b> escaneos realizados, <b>{m.escaneo.convertidos}</b> terminaron en un arreglo
            dentro de los {m.escaneo.diasVentana} días: <b className="tabular">{pct(m.escaneo.tasa)}</b>.
          </p>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-bold">Qué publicidad rinde</h2>
        <p className="text-muted">Según el link con el que entraron (utm_source / utm_campaign) y el gasto cargado con esa campaña.</p>
        {m.origenes.length === 0 ? <p className="mt-3 text-muted">Sin datos en este período.</p> : (
          <div className="mt-3 overflow-x-auto">
            <table className="tabular w-full min-w-[640px] text-left">
              <thead className="border-b-2 border-foreground text-sm">
                <tr><th className="py-2 pr-3">Origen</th><th className="pr-3">Campaña</th><th className="pr-3 text-right">Visitas</th><th className="pr-3 text-right">Pedidos</th><th className="pr-3 text-right">Hechos</th><th className="pr-3 text-right">Ingresos</th><th className="pr-3 text-right">Gasto</th><th className="text-right">Rinde</th></tr>
              </thead>
              <tbody className="divide-y divide-border">
                {m.origenes.map((o) => (
                  <tr key={`${o.origen}|${o.campania}`}>
                    <td className="py-2 pr-3">{o.origen || "Directo / sin dato"}</td>
                    <td className="pr-3 text-muted">{o.campania || "—"}</td>
                    <td className="pr-3 text-right">{o.visitas}</td>
                    <td className="pr-3 text-right">{o.pedidos}</td>
                    <td className="pr-3 text-right">{o.realizados}</td>
                    <td className="pr-3 text-right">{formatoPesos(o.ingresos)}</td>
                    <td className="pr-3 text-right">{o.gasto ? formatoPesos(o.gasto) : "—"}</td>
                    <td className="text-right font-semibold">{o.gasto ? `${(o.ingresos / o.gasto).toLocaleString("es-AR", { maximumFractionDigits: 1 })}x` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-bold">Visitas y pedidos por día</h2>
        <BarrasDia datos={m.porDia} />
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="text-2xl font-bold">Servicios más y menos pedidos</h2>
          {m.servicios.length === 0 ? <p className="mt-3 text-muted">Sin pedidos en este período.</p> : (
            <BarrasHorizontales filas={m.servicios.map((s) => ({ etiqueta: s.nombre, valor: s.pedidos, detalle: `${s.realizados} hechos` }))} />
          )}
        </section>
        <section>
          <h2 className="text-2xl font-bold">¿Cómo nos conocieron?</h2>
          {m.conocio.length === 0 ? <p className="mt-3 text-muted">Sin datos.</p> : (
            <BarrasHorizontales filas={m.conocio.map((c) => ({ etiqueta: CONOCIO[c.clave] ?? c.clave, valor: c.cantidad }))} />
          )}
        </section>
      </div>
    </>
  );
}

function Dato({ titulo, valor, pie }: { titulo: string; valor: string; pie?: string }) {
  return (
    <div className="rounded-md border-2 border-border bg-surface p-4">
      <p className="text-sm font-semibold text-muted">{titulo}</p>
      <p className="tabular mt-1 font-display text-3xl font-bold">{valor}</p>
      {pie && <p className="text-sm text-muted">{pie}</p>}
    </div>
  );
}

function Fila({ t, v, d }: { t: string; v: string; d?: string }) {
  return (
    <div>
      <dt className="text-sm text-muted">{t}</dt>
      <dd className="tabular text-xl font-semibold">{v}{d && <span className="block text-sm font-normal text-muted">{d}</span>}</dd>
    </div>
  );
}

/** Una serie por gráfico (pedidos), en el azul de la marca; las visitas van en la tabla y en el tooltip. */
function BarrasDia({ datos }: { datos: Metricas["porDia"] }) {
  const max = Math.max(1, ...datos.map((d) => d.pedidos));
  const [abierto, setAbierto] = useState(false);
  return (
    <div className="mt-3">
      <p className="text-sm text-muted">Pedidos de turno por día (pasá el mouse o tocá una barra para ver el detalle)</p>
      <div className="mt-2 flex h-40 items-end gap-[2px] border-b border-border-strong" role="img" aria-label="Pedidos por día">
        {datos.map((d) => (
          <div key={d.fecha} className="group relative flex h-full flex-1 items-end" tabIndex={0}>
            <div className="w-full rounded-t-[4px] bg-primary" style={{ height: `${(d.pedidos / max) * 100}%`, minHeight: d.pedidos ? 2 : 0 }} />
            <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded border border-border bg-surface px-2 py-1 text-sm shadow group-hover:block group-focus:block">
              <span className="capitalize">{fechaCorta(d.fecha)}</span>: {d.pedidos} pedidos, {d.visitas} visitas
            </div>
          </div>
        ))}
      </div>
      <div className="tabular mt-1 flex justify-between text-sm text-muted">
        <span>{fechaCorta(datos[0]?.fecha ?? "")}</span>
        <span>máx. {max} por día</span>
        <span>{fechaCorta(datos[datos.length - 1]?.fecha ?? "")}</span>
      </div>
      <button className="mt-2 text-sm font-semibold text-primary underline" onClick={() => setAbierto(!abierto)}>{abierto ? "Ocultar tabla" : "Ver como tabla"}</button>
      {abierto && (
        <table className="tabular mt-2 w-full max-w-md text-left text-sm">
          <thead><tr className="border-b border-border"><th className="py-1">Día</th><th className="text-right">Visitas</th><th className="text-right">Pedidos</th></tr></thead>
          <tbody>{datos.filter((d) => d.visitas || d.pedidos).map((d) => (
            <tr key={d.fecha} className="border-b border-border"><td className="py-1 capitalize">{fechaCorta(d.fecha)}</td><td className="text-right">{d.visitas}</td><td className="text-right">{d.pedidos}</td></tr>
          ))}</tbody>
        </table>
      )}
    </div>
  );
}

function BarrasHorizontales({ filas }: { filas: { etiqueta: string; valor: number; detalle?: string }[] }) {
  const max = Math.max(1, ...filas.map((f) => f.valor));
  return (
    <ul className="mt-3 space-y-2">
      {filas.map((f) => (
        <li key={f.etiqueta}>
          <div className="flex justify-between gap-3 text-sm">
            <span>{f.etiqueta}</span>
            <span className="tabular whitespace-nowrap font-semibold">{f.valor}{f.detalle && <span className="font-normal text-muted">, {f.detalle}</span>}</span>
          </div>
          <div className="mt-1 h-2 rounded-r-[4px] bg-primary" style={{ width: `${(f.valor / max) * 100}%` }} />
        </li>
      ))}
    </ul>
  );
}
