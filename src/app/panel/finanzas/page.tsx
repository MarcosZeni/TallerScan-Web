"use client";

import { useState } from "react";
import { useDatos } from "@/lib/use-datos";
import { Aviso, Cargando, Etiqueta } from "@/components/ui/aviso";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { api, apiUrl, mensajeDe } from "@/lib/api";
import { fechaCorta, formatoPesos, hoyTaller } from "@/lib/format";
import { siVencio } from "@/lib/sesion";
import type { Movimiento, Recurrente, ResumenFinanzas } from "@/lib/tipos";

const CATEGORIAS: Record<string, string> = {
  hosting: "Hosting / servidor", dominio: "Dominio", correo: "Correo", publicidad: "Publicidad",
  herramientas: "Herramientas", telefono: "Teléfono / chip", otros: "Otros", turno: "Trabajo",
};
const MEDIOS: Record<string, string> = { transferencia: "Transferencia", tarjeta: "Tarjeta", mercadopago: "Mercado Pago", efectivo: "Efectivo", otro: "Otro" };

export default function Page() {
  const r = useDatos<ResumenFinanzas>("/api/v1/admin/finanzas/resumen");
  const m = useDatos<Movimiento[]>("/api/v1/admin/finanzas/movimientos");
  const rec = useDatos<Recurrente[]>("/api/v1/admin/finanzas/recurrentes");
  const resumen = r.datos, movs = m.datos, recurrentes = rec.datos;
  const error = r.error ?? m.error ?? rec.error;
  const cargar = () => { r.recargar(); m.recargar(); rec.recargar(); };

  if (error) return <Aviso tipo="error">{error}</Aviso>;
  if (!resumen || !movs || !recurrentes) return <Cargando />;

  const pendientes = movs.filter((m) => m.estado === "pendiente");
  const resto = movs.filter((m) => m.estado !== "pendiente");

  return (
    <div className="space-y-10">
      <h1 className="text-3xl font-bold sm:text-4xl">Finanzas</h1>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Tile t="Saldo desde el inicio" v={resumen.saldoAcumulado} destacado />
        <Tile t="Ingresos del mes" v={resumen.ingresosMes} />
        <Tile t="Gastos del mes" v={resumen.gastosMes} />
        <Tile t="Por pagar" v={resumen.pendientesMonto} pie={`${resumen.pendientesCantidad} gasto${resumen.pendientesCantidad === 1 ? "" : "s"}`} />
      </section>
      <p className="tabular -mt-6 text-muted">
        Este mes: parte del mecánico {formatoPesos(resumen.parteMecanicoMes)}
        {resumen.gananciaDesarrolladorMes != null && <>, ganancia por tramos {formatoPesos(resumen.gananciaDesarrolladorMes)}</>}.
      </p>

      {pendientes.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-2xl font-bold">Por pagar</h2>
          {pendientes.map((m) => <MovimientoFila key={m.id} m={m} onCambio={cargar} />)}
        </section>
      )}

      <NuevoGasto onCreado={cargar} />

      <section>
        <h2 className="text-2xl font-bold">Mes a mes</h2>
        {resumen.meses.length === 0 ? <p className="mt-2 text-muted">Todavía no hay movimientos.</p> : (
          <div className="mt-3 overflow-x-auto">
            <table className="tabular w-full min-w-[480px] text-left">
              <thead className="border-b-2 border-foreground text-sm"><tr><th className="py-2">Mes</th><th className="text-right">Ingresos</th><th className="text-right">Gastos</th><th className="text-right">Resultado</th><th className="text-right">Acumulado</th></tr></thead>
              <tbody className="divide-y divide-border">
                {[...resumen.meses].reverse().map((x) => (
                  <tr key={x.periodo}>
                    <td className="py-2">{new Date(`${x.periodo}-15`).toLocaleDateString("es-AR", { month: "long", year: "numeric" })}</td>
                    <td className="text-right">{formatoPesos(x.ingresos)}</td>
                    <td className="text-right">{formatoPesos(x.gastos)}</td>
                    <td className={`text-right font-semibold ${x.resultado < 0 ? "text-danger" : "text-success"}`}>{x.resultado < 0 ? "−" : ""}{formatoPesos(Math.abs(x.resultado))}</td>
                    <td className={`text-right ${x.acumulado < 0 ? "text-danger" : ""}`}>{x.acumulado < 0 ? "−" : ""}{formatoPesos(Math.abs(x.acumulado))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Recurrentes lista={recurrentes} onCambio={cargar} />

      <section className="space-y-3">
        <h2 className="text-2xl font-bold">Movimientos</h2>
        {resto.length === 0 ? <p className="text-muted">Sin movimientos en los últimos meses.</p> : resto.map((m) => <MovimientoFila key={m.id} m={m} onCambio={cargar} />)}
      </section>
    </div>
  );
}

function Tile({ t, v, pie, destacado }: { t: string; v: number; pie?: string; destacado?: boolean }) {
  return (
    <div className={`rounded-md border-2 p-4 ${destacado ? "border-primary bg-primary-soft" : "border-border bg-surface"}`}>
      <p className="text-sm font-semibold text-muted">{t}</p>
      <p className={`tabular mt-1 font-display text-3xl font-bold ${v < 0 ? "text-danger" : ""}`}>{v < 0 ? "−" : ""}{formatoPesos(Math.abs(v))}</p>
      {pie && <p className="text-sm text-muted">{pie}</p>}
    </div>
  );
}

function MovimientoFila({ m, onCambio }: { m: Movimiento; onCambio: () => void }) {
  const [modo, setModo] = useState<null | "pagar" | "adjuntar" | "borrar">(null);
  const [fecha, setFecha] = useState(hoyTaller());
  const [medio, setMedio] = useState("transferencia");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);

  async function enviar(path: "pagar" | "comprobantes") {
    setOcupado(true);
    setError(null);
    const fd = new FormData();
    if (path === "pagar") { fd.set("fecha", fecha); fd.set("medio", medio); }
    if (archivo) fd.set("archivo", archivo);
    try {
      await api(`/api/v1/admin/finanzas/movimientos/${m.id}/${path}`, { method: "POST", body: fd });
      setModo(null);
      onCambio();
    } catch (e) {
      if (!siVencio(e)) setError(mensajeDe(e));
    } finally {
      setOcupado(false);
    }
  }

  async function borrar() {
    setOcupado(true);
    try {
      await api(`/api/v1/admin/finanzas/movimientos/${m.id}`, { method: "DELETE" });
      onCambio();
    } catch (e) {
      if (!siVencio(e)) setError(mensajeDe(e));
      setOcupado(false);
    }
  }

  const ingreso = m.tipo === "ingreso";
  return (
    <article className="rounded-md border-2 border-border bg-surface p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-semibold">{m.descripcion}</p>
          <p className="text-sm text-muted">
            <span className="capitalize">{fechaCorta(m.fecha)}</span>, {CATEGORIAS[m.categoria] ?? m.categoria}
            {m.campania ? `, campaña ${m.campania}` : ""}{m.cargadoPor ? `, cargó ${m.cargadoPor}` : ""}
          </p>
        </div>
        <div className="text-right">
          <p className={`tabular font-display text-2xl font-bold ${ingreso ? "text-success" : ""}`}>{ingreso ? "+" : "−"}{formatoPesos(m.monto)}</p>
          {m.tipo === "gasto" && (m.estado === "pendiente"
            ? <Etiqueta tono="atencion">Sin pagar</Etiqueta>
            : <Etiqueta tono="ok">Pagado{m.medioPago ? ` con ${MEDIOS[m.medioPago]?.toLowerCase() ?? m.medioPago}` : ""}</Etiqueta>)}
        </div>
      </div>

      {m.comprobantes.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-2 text-sm">
          {m.comprobantes.map((c) => (
            <li key={c.id}><a className="font-semibold text-primary underline" href={apiUrl(`/api/v1/admin/finanzas/comprobantes/${c.id}`)}>Comprobante: {c.nombre}</a></li>
          ))}
        </ul>
      )}

      {error && <div className="mt-3"><Aviso tipo="error">{error}</Aviso></div>}

      {(modo === "pagar" || modo === "adjuntar") && (
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {modo === "pagar" && (
            <>
              <Field label="Fecha de pago" htmlFor={`f-${m.id}`}><Input id={`f-${m.id}`} type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} /></Field>
              <Field label="Medio" htmlFor={`me-${m.id}`}>
                <Select id={`me-${m.id}`} value={medio} onChange={(e) => setMedio(e.target.value)}>
                  {Object.entries(MEDIOS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </Select>
              </Field>
            </>
          )}
          <Field label={modo === "pagar" ? "Comprobante (opcional)" : "Comprobante"} htmlFor={`a-${m.id}`} ayuda="Foto o PDF, hasta 5 MB">
            <Input id={`a-${m.id}`} type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={(e) => setArchivo(e.target.files?.[0] ?? null)} className="py-1.5" />
          </Field>
          <div className="flex flex-wrap gap-3 sm:col-span-3">
            <Button variante="primario" disabled={ocupado || (modo === "adjuntar" && !archivo)} onClick={() => enviar(modo === "pagar" ? "pagar" : "comprobantes")}>
              {ocupado ? "Guardando…" : modo === "pagar" ? "Marcar pagado" : "Subir comprobante"}
            </Button>
            <Button variante="fantasma" onClick={() => setModo(null)}>Volver</Button>
          </div>
        </div>
      )}

      {modo === "borrar" && (
        <div className="mt-4"><Aviso tipo="atencion" titulo="¿Borrar este gasto?">Se borran también sus comprobantes.
          <div className="mt-3 flex gap-3"><Button variante="peligro" disabled={ocupado} onClick={borrar}>Sí, borrar</Button><Button variante="fantasma" onClick={() => setModo(null)}>No</Button></div>
        </Aviso></div>
      )}

      {modo === null && m.tipo === "gasto" && (
        <div className="mt-3 flex flex-wrap gap-2">
          {m.estado === "pendiente" && <Button variante="accion" onClick={() => setModo("pagar")}>Pagar</Button>}
          <Button variante="fantasma" onClick={() => setModo("adjuntar")}>Subir comprobante</Button>
          <Button variante="fantasma" onClick={() => setModo("borrar")}>Borrar</Button>
        </div>
      )}
    </article>
  );
}

function NuevoGasto({ onCreado }: { onCreado: () => void }) {
  const vacio = { fecha: hoyTaller(), categoria: "publicidad", descripcion: "", monto: "", campania: "", pagado: true, medioPago: "transferencia" };
  const [abierto, setAbierto] = useState(false);
  const [g, setG] = useState(vacio);
  const [error, setError] = useState<{ m: string; c?: string | null } | null>(null);
  const [ocupado, setOcupado] = useState(false);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setOcupado(true);
    setError(null);
    try {
      await api("/api/v1/admin/finanzas/movimientos", { method: "POST", json: { ...g, monto: Number(g.monto) || null, campania: g.campania || null } });
      setG(vacio);
      setAbierto(false);
      onCreado();
    } catch (err) {
      if (!siVencio(err)) setError({ m: mensajeDe(err), c: (err as { campo?: string }).campo });
    } finally {
      setOcupado(false);
    }
  }

  if (!abierto) return <Button variante="primario" onClick={() => setAbierto(true)}>Cargar un gasto</Button>;
  return (
    <form onSubmit={guardar} className="space-y-4 rounded-md border-2 border-primary bg-surface p-4">
      <h2 className="text-2xl font-bold">Nuevo gasto</h2>
      {error && <Aviso tipo="error">{error.m}</Aviso>}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Qué es" htmlFor="g-desc"><Input id="g-desc" value={g.descripcion} onChange={(e) => setG({ ...g, descripcion: e.target.value })} placeholder="Publicidad Instagram escaneo" /></Field>
        <Field label="Monto" htmlFor="g-monto"><Input id="g-monto" inputMode="numeric" value={g.monto} onChange={(e) => setG({ ...g, monto: e.target.value.replace(/\D/g, "") })} /></Field>
        <Field label="Categoría" htmlFor="g-cat">
          <Select id="g-cat" value={g.categoria} onChange={(e) => setG({ ...g, categoria: e.target.value })}>
            {Object.entries(CATEGORIAS).filter(([k]) => k !== "turno").map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </Select>
        </Field>
        <Field label="Fecha" htmlFor="g-fecha"><Input id="g-fecha" type="date" value={g.fecha} onChange={(e) => setG({ ...g, fecha: e.target.value })} /></Field>
        {g.categoria === "publicidad" && (
          <Field label="Campaña" htmlFor="g-camp" ayuda="La misma que va en el link: utm_campaign. Así se cruza con lo que trajo.">
            <Input id="g-camp" value={g.campania} onChange={(e) => setG({ ...g, campania: e.target.value })} placeholder="escaneo-oct" />
          </Field>
        )}
        <Field label="¿Ya está pagado?" htmlFor="g-pag">
          <Select id="g-pag" value={g.pagado ? "si" : "no"} onChange={(e) => setG({ ...g, pagado: e.target.value === "si" })}>
            <option value="si">Sí, ya lo pagamos</option>
            <option value="no">No, queda para pagar</option>
          </Select>
        </Field>
      </div>
      <div className="flex gap-3">
        <Button type="submit" variante="accion" disabled={ocupado}>Guardar gasto</Button>
        <Button variante="fantasma" onClick={() => setAbierto(false)}>Volver</Button>
      </div>
    </form>
  );
}

function Recurrentes({ lista, onCambio }: { lista: Recurrente[]; onCambio: () => void }) {
  const [nuevo, setNuevo] = useState({ descripcion: "", categoria: "hosting", monto: "", diaMes: "1" });
  const [abierto, setAbierto] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function guardar(id: number | null, datos: { descripcion: string; categoria: string; monto: number; diaMes: number; activo: boolean }) {
    setError(null);
    try {
      await api(`/api/v1/admin/finanzas/recurrentes${id ? `/${id}` : ""}`, { method: id ? "PUT" : "POST", json: datos });
      setAbierto(false);
      setNuevo({ descripcion: "", categoria: "hosting", monto: "", diaMes: "1" });
      onCambio();
    } catch (e) {
      if (!siVencio(e)) setError(mensajeDe(e));
    }
  }

  return (
    <section className="space-y-3">
      <h2 className="text-2xl font-bold">Gastos de todos los meses</h2>
      <p className="text-muted">Se cargan solos el día del mes elegido, como &quot;por pagar&quot;. Después tocás Pagar y subís el comprobante.</p>
      {error && <Aviso tipo="error">{error}</Aviso>}
      <ul className="divide-y divide-border rounded-md border-2 border-border bg-surface">
        {lista.length === 0 && <li className="p-3 text-muted">Ninguno todavía. Por ejemplo: el servidor de DonWeb.</li>}
        {lista.map((r) => (
          <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 p-3">
            <div>
              <p className="font-semibold">{r.descripcion}</p>
              <p className="tabular text-sm text-muted">{formatoPesos(r.monto)} el día {r.diaMes} de cada mes{r.activo ? "" : " (pausado)"}</p>
            </div>
            <Button variante="fantasma" onClick={() => guardar(r.id, { ...r, activo: !r.activo })}>{r.activo ? "Pausar" : "Reactivar"}</Button>
          </li>
        ))}
      </ul>
      {!abierto ? <Button variante="secundario" onClick={() => setAbierto(true)}>Agregar gasto mensual</Button> : (
        <div className="grid gap-3 rounded-md border-2 border-primary bg-surface p-4 sm:grid-cols-4">
          <Field label="Qué es" htmlFor="r-d"><Input id="r-d" value={nuevo.descripcion} onChange={(e) => setNuevo({ ...nuevo, descripcion: e.target.value })} placeholder="Cloud Server DonWeb" /></Field>
          <Field label="Monto" htmlFor="r-m"><Input id="r-m" inputMode="numeric" value={nuevo.monto} onChange={(e) => setNuevo({ ...nuevo, monto: e.target.value.replace(/\D/g, "") })} /></Field>
          <Field label="Categoría" htmlFor="r-c">
            <Select id="r-c" value={nuevo.categoria} onChange={(e) => setNuevo({ ...nuevo, categoria: e.target.value })}>
              {Object.entries(CATEGORIAS).filter(([k]) => k !== "turno").map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </Select>
          </Field>
          <Field label="Día del mes" htmlFor="r-dia"><Input id="r-dia" inputMode="numeric" value={nuevo.diaMes} onChange={(e) => setNuevo({ ...nuevo, diaMes: e.target.value.replace(/\D/g, "") })} /></Field>
          <div className="flex gap-3 sm:col-span-4">
            <Button variante="primario" onClick={() => guardar(null, { descripcion: nuevo.descripcion, categoria: nuevo.categoria, monto: Number(nuevo.monto), diaMes: Number(nuevo.diaMes) || 1, activo: true })}>Guardar</Button>
            <Button variante="fantasma" onClick={() => setAbierto(false)}>Volver</Button>
          </div>
        </div>
      )}
    </section>
  );
}
