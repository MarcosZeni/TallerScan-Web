"use client";

import { useState } from "react";
import { Aviso, Etiqueta, tonoEstado } from "@/components/ui/aviso";
import { Button, ButtonA } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { api, mensajeDe } from "@/lib/api";
import { CONOCIO, ESTADOS, fechaCorta, formatoPesos, franjaTexto, hora, hoyTaller, rangoPesos } from "@/lib/format";
import { siVencio } from "@/lib/sesion";
import type { AccionTurno, Turno } from "@/lib/tipos";

type Modo = null | "confirmar" | "realizar" | "reprogramar" | "cancelar";

/**
 * Un turno con las acciones que corresponden a su estado. Cada acción que le
 * cambia algo al cliente devuelve el link de WhatsApp con el mensaje armado:
 * se muestra grande, porque mandarlo es el siguiente paso.
 */
export function TurnoCard({ turno, onCambio, mostrarFecha = false }: { turno: Turno; onCambio: (t: Turno) => void; mostrarFecha?: boolean }) {
  const [modo, setModo] = useState<Modo>(null);
  const [error, setError] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [avisar, setAvisar] = useState<string | null>(null);

  const primera = turno.opciones[0];
  const [fechaConf, setFechaConf] = useState(primera?.fecha ?? turno.fecha);
  const [horaConf, setHoraConf] = useState((primera?.franja ?? turno.franja) === "tarde" ? "14:00" : "09:00");
  const [monto, setMonto] = useState(String(turno.montoCobrado ?? turno.precioMin ?? ""));
  const [escaneos, setEscaneos] = useState<{ id: number; fecha: string; monto: number }[] | null>(null);
  const [escaneoId, setEscaneoId] = useState("");
  const [nuevaFecha, setNuevaFecha] = useState(turno.fecha);
  const [nuevaHora, setNuevaHora] = useState(hora(turno.hora) || "09:00");

  async function accion(path: string, json?: unknown) {
    setOcupado(true);
    setError(null);
    try {
      const r = await api<AccionTurno>(`/api/v1/panel/turnos/${turno.id}/${path}`, { method: "POST", json: json ?? {} });
      setAvisar(r.avisarCliente);
      setModo(null);
      onCambio(r.turno);
    } catch (e) {
      if (!siVencio(e)) setError(mensajeDe(e));
    } finally {
      setOcupado(false);
    }
  }

  async function abrirRealizar() {
    setModo("realizar");
    if (escaneos === null && !turno.servicios.every((s) => s.esEscaneo)) {
      try {
        setEscaneos(await api(`/api/v1/panel/turnos/${turno.id}/escaneos`));
      } catch {
        setEscaneos([]);
      }
    }
  }

  const t = turno;
  const servicios = [...t.servicios.map((s) => s.nombre), ...(t.otro ? [`Otro: ${t.otro}`] : [])].join(", ");
  const express = t.tipo === "dia" && t.estado === "pendiente";
  const cuando = express ? "Turno express" : t.hora ? hora(t.hora) : franjaTexto(t.franja);

  return (
    <article className="rounded-md border-2 border-border bg-surface p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-display text-2xl font-bold">
            {mostrarFecha && !express && <span className="capitalize">{fechaCorta(t.fecha)} </span>}
            <span className="tabular">{cuando || "sin hora"}</span>
            <span className="ml-2 text-base font-sans font-medium text-muted">#{t.id}</span>
          </p>
          <p className="font-semibold">{t.nombre}</p>
        </div>
        <Etiqueta tono={tonoEstado(t.estado)}>{ESTADOS[t.estado]}</Etiqueta>
      </div>

      {express && t.opciones.length > 0 && (
        <p className="mt-1 font-semibold text-primary">Puede: {t.opciones.map((o) => `${fechaCorta(o.fecha)} ${o.franja === "manana" ? "mañana" : "tarde"}`).join(", ")}</p>
      )}
      <p className="mt-2">{servicios}</p>
      <p className="text-muted">{t.marca} {t.modelo} {t.anio}, patente <span className="font-semibold text-foreground">{t.patente}</span></p>
      {t.descripcion && <p className="mt-1 text-muted">“{t.descripcion}”</p>}
      <p className="tabular mt-1 text-muted">
        {t.montoCobrado != null
          ? <>Cobrado {formatoPesos(t.montoCobrado)} (mecánico {formatoPesos(t.parteMecanico ?? 0)}, ganancia {formatoPesos(t.parteDesarrollador ?? 0)}{t.descuentoEscaneo > 0 ? `, se descontó el escaneo de ${formatoPesos(t.descuentoEscaneo)}` : ""})</>
          : t.precioMax > 0 ? <>Estimado {rangoPesos(t.precioMin, t.precioMax)}</> : null}
      </p>
      {t.origen && <p className="text-sm text-muted">Publicidad: {[t.origen, t.campania].filter(Boolean).join(" / ")}</p>}
      {t.conocio && <p className="text-sm text-muted">Nos conoció por: {CONOCIO[t.conocio] ?? t.conocio}</p>}

      {error && <div className="mt-3"><Aviso tipo="error">{error}</Aviso></div>}
      {avisar && (
        <div className="mt-3">
          <ButtonA href={avisar} variante="accion" onClick={() => setAvisar(null)}>Avisar al cliente por WhatsApp</ButtonA>
        </div>
      )}

      {/* ---- Formularios de cada acción ---- */}
      {modo === "confirmar" && (
        <div className="mt-4 space-y-3">
          {t.opciones.length > 0 && (
            <div>
              <p className="mb-2 font-semibold">El cliente puede:</p>
              <div className="flex flex-wrap gap-2">
                {t.opciones.map((o) => {
                  const activo = fechaConf === o.fecha && (horaConf < "14:00" ? "manana" : "tarde") === o.franja;
                  return (
                    <button key={o.fecha + o.franja} type="button" aria-pressed={activo}
                      onClick={() => { setFechaConf(o.fecha); setHoraConf(o.franja === "tarde" ? "14:00" : "09:00"); }}
                      className={`min-h-11 rounded-md border-2 px-3 font-semibold capitalize ${activo ? "border-primary bg-primary text-on-primary" : "border-border hover:border-primary"}`}>
                      {fechaCorta(o.fecha)} {o.franja === "manana" ? "mañana" : "tarde"}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          <div className="flex flex-wrap items-end gap-3">
            <Field label="Día" htmlFor={`fc-${t.id}`}>
              <Input id={`fc-${t.id}`} type="date" min={hoyTaller()} value={fechaConf} onChange={(e) => setFechaConf(e.target.value)} className="w-44" />
            </Field>
            <Field label="Hora" htmlFor={`h-${t.id}`}>
              <Input id={`h-${t.id}`} type="time" step={900} value={horaConf} onChange={(e) => setHoraConf(e.target.value)} className="w-36" />
            </Field>
          </div>
          {t.opciones.length > 0 && !t.opciones.some((o) => o.fecha === fechaConf) && (
            <Aviso tipo="atencion">Ese día no está entre los que marcó el cliente. Confirmalo igual si ya lo hablaron por WhatsApp.</Aviso>
          )}
          <div className="flex flex-wrap gap-3">
            <Button variante="primario" disabled={ocupado || !fechaConf} onClick={() => accion("confirmar", { fecha: fechaConf, hora: `${horaConf}:00` })}>
              Confirmar {fechaCorta(fechaConf)} a las {horaConf}
            </Button>
            <Button variante="fantasma" onClick={() => setModo(null)}>Volver</Button>
          </div>
        </div>
      )}
      {modo === "realizar" && (
        <div className="mt-4 space-y-3">
          <Field label="¿Cuánto se cobró de mano de obra?" htmlFor={`m-${t.id}`} ayuda="Lo que pagó el cliente, sin repuestos. Si se le descontó el escaneo, ya descontado.">
            <Input id={`m-${t.id}`} inputMode="numeric" value={monto} onChange={(e) => setMonto(e.target.value.replace(/\D/g, ""))} className="w-48" />
          </Field>
          {escaneos && escaneos.length > 0 && (
            <Field label="Descontar un escaneo previo de esta patente" htmlFor={`e-${t.id}`}>
              <Select id={`e-${t.id}`} value={escaneoId} onChange={(e) => setEscaneoId(e.target.value)} className="w-auto">
                <option value="">No descontar</option>
                {escaneos.map((e) => <option key={e.id} value={e.id}>Escaneo #{e.id} del {fechaCorta(e.fecha)} ({formatoPesos(e.monto)})</option>)}
              </Select>
            </Field>
          )}
          <div className="flex flex-wrap gap-3">
            <Button variante="primario" disabled={ocupado || monto === ""}
              onClick={() => accion("realizar", { monto: Number(monto), escaneoId: escaneoId ? Number(escaneoId) : null })}>
              Guardar como realizado
            </Button>
            <Button variante="fantasma" onClick={() => setModo(null)}>Volver</Button>
          </div>
        </div>
      )}
      {modo === "reprogramar" && (
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <Field label="Día" htmlFor={`f-${t.id}`}>
            <Input id={`f-${t.id}`} type="date" min={hoyTaller()} value={nuevaFecha} onChange={(e) => setNuevaFecha(e.target.value)} className="w-44" />
          </Field>
          <Field label="Hora" htmlFor={`nh-${t.id}`}>
            <Input id={`nh-${t.id}`} type="time" step={900} value={nuevaHora} onChange={(e) => setNuevaHora(e.target.value)} className="w-36" />
          </Field>
          <Button variante="primario" disabled={ocupado} onClick={() => accion("reprogramar", { fecha: nuevaFecha, hora: `${nuevaHora}:00` })}>Cambiar turno</Button>
          <Button variante="fantasma" onClick={() => setModo(null)}>Volver</Button>
        </div>
      )}
      {modo === "cancelar" && (
        <div className="mt-4">
          <Aviso tipo="atencion" titulo="¿Cancelar este turno?">
            Al cliente le llega un email. Después mandale el WhatsApp para coordinar otro horario.
            <div className="mt-3 flex gap-3">
              <Button variante="peligro" disabled={ocupado} onClick={() => accion("cancelar")}>Sí, cancelar</Button>
              <Button variante="fantasma" onClick={() => setModo(null)}>No</Button>
            </div>
          </Aviso>
        </div>
      )}

      {/* ---- Botones según el estado ---- */}
      {modo === null && (
        <div className="mt-4 flex flex-wrap gap-2">
          {t.estado === "pendiente" && (
            <>
              {t.tipo === "hoy"
                ? <Button variante="primario" disabled={ocupado} onClick={() => accion("confirmar")}>Confirmar</Button>
                : <Button variante="primario" onClick={() => setModo("confirmar")}>Elegir día y hora</Button>}
              <Button variante="peligro" disabled={ocupado} onClick={() => accion("rechazar")}>Rechazar</Button>
            </>
          )}
          {t.estado === "confirmado" && (
            <>
              <Button variante="primario" onClick={abrirRealizar}>Marcar realizado</Button>
              <Button variante="secundario" onClick={() => setModo("reprogramar")}>Cambiar día u hora</Button>
              <Button variante="peligro" onClick={() => setModo("cancelar")}>Cancelar</Button>
            </>
          )}
          {t.estado === "realizado" && <Button variante="secundario" onClick={abrirRealizar}>Corregir monto</Button>}
          {["realizado", "rechazado", "liberado", "cancelado"].includes(t.estado) && (
            <Button variante="fantasma" disabled={ocupado} onClick={() => accion("archivar")}>Archivar</Button>
          )}
          <ButtonA href={t.whatsappLink} variante="fantasma">WhatsApp de {t.nombre.split(" ")[0]}</ButtonA>
        </div>
      )}
    </article>
  );
}
