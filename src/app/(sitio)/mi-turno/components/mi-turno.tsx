"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { useDatos } from "@/lib/use-datos";

// localStorage no avisa cambios dentro de la misma pestaña: alcanza con leerlo.
const sinSuscripcion = () => () => {};
import { Aviso, Cargando, Etiqueta, tonoEstado } from "@/components/ui/aviso";
import { Button, ButtonA, ButtonLink } from "@/components/ui/button";
import { api, mensajeDe } from "@/lib/api";
import { registrarVisita } from "@/lib/atribucion";
import { ESTADOS, fechaCorta, fechaLarga, franjaTexto, hora, rangoPesos } from "@/lib/format";
import { misTurnos } from "@/lib/mis-turnos";
import { useSitio } from "@/lib/sitio";
import type { Disponibilidad, MiTurno as Turno, Opcion } from "@/lib/tipos";
import { SelectorOpciones } from "@/components/selector-opciones";
import { BuscarTurnos } from "./buscar-turnos";
import { linkWhatsApp } from "@/lib/whatsapp";

export function MiTurno() {
  const params = useSearchParams();
  // Sin código en el link: buscador, con atajo al último turno pedido desde este navegador.
  const ultimo = useSyncExternalStore(sinSuscripcion, () => misTurnos()[0]?.codigo ?? null, () => null);
  const codigo = params.get("c");
  const { datos: turno, error: errorCarga, recargar } = useDatos<Turno>(codigo ? `/api/v1/turnos/mio?c=${encodeURIComponent(codigo)}` : null);
  const [errorAccion, setErrorAccion] = useState<string | null>(null);
  const [confirmando, setConfirmando] = useState(false);
  const [cancelando, setCancelando] = useState(false);
  const { sitio } = useSitio(null);
  const error = errorAccion ?? errorCarga;

  useEffect(() => registrarVisita("mi-turno"), []);

  const [cambiando, setCambiando] = useState(false);
  const [opciones, setOpciones] = useState<Opcion[]>([]);
  const [enviando, setEnviando] = useState(false);
  const { datos: disp } = useDatos<Disponibilidad>(cambiando ? "/api/v1/disponibilidad" : null);
  const esperandoDia = turno?.estado === "pendiente" && turno.tipo === "dia";

  async function reprogramar() {
    if (!codigo) return;
    setEnviando(true);
    setErrorAccion(null);
    try {
      await api("/api/v1/turnos/mio/reprogramar", { method: "POST", json: { codigo, opciones } });
      setCambiando(false);
      recargar();
    } catch (e) {
      setErrorAccion(mensajeDe(e));
    } finally {
      setEnviando(false);
    }
  }

  async function cancelar() {
    if (!codigo) return;
    setCancelando(true);
    setErrorAccion(null);
    try {
      await api("/api/v1/turnos/mio/cancelar", { method: "POST", json: { codigo } });
      setConfirmando(false);
      recargar();
    } catch (e) {
      setErrorAccion(mensajeDe(e));
    } finally {
      setCancelando(false);
    }
  }

  const wa = linkWhatsApp(sitio?.taller.whatsapp, turno ? `Hola, te escribo por mi turno #${turno.id}.` : "Hola, te escribo por mi turno.");

  if (!codigo) return <BuscarTurnos ultimo={ultimo} />;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-4xl font-bold">Mi turno{turno ? ` #${turno.id}` : ""}</h1>
      {error && <div className="mt-6"><Aviso tipo="error">{error}</Aviso></div>}
      {!turno && !error && <Cargando />}
      {turno && (
        <div className="mt-6 space-y-6">
          <div className="space-y-2 rounded-md border-2 border-border bg-surface p-5">
            <Etiqueta tono={tonoEstado(turno.estado)}>{ESTADOS[turno.estado]}</Etiqueta>
            {esperandoDia ? (
              <>
                <p className="text-2xl font-display font-bold">Elegimos el día y te avisamos</p>
                <p className="text-muted">Nos dijiste que podés: {turno.opciones.map((o) => `${fechaCorta(o.fecha)} ${o.franja === "manana" ? "a la mañana" : "a la tarde"}`).join(", ")}.</p>
              </>
            ) : (
              <>
                <p className="text-2xl font-display font-bold capitalize">
                  {fechaLarga(turno.fecha)} {turno.hora ? `a las ${hora(turno.hora)}` : franjaTexto(turno.franja)}
                </p>
                {turno.estado === "pendiente" && <p className="text-muted">Te confirmamos en unos minutos.</p>}
              </>
            )}
            <p>{[...turno.servicios, ...(turno.otro ? [`Otro: ${turno.otro}`] : [])].join(", ")}</p>
            {turno.precioMax > 0 && <p className="tabular text-muted">Mano de obra estimada: {rangoPesos(turno.precioMin, turno.precioMax)} (sin repuestos)</p>}
            <p className="text-muted">{turno.marca} {turno.modelo}, patente {turno.patente}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            {wa && <ButtonA href={wa} variante="secundario">Escribir por WhatsApp</ButtonA>}
            <ButtonLink href="/mi-turno" variante="fantasma">Ver todos mis turnos</ButtonLink>
            {["rechazado", "liberado", "cancelado"].includes(turno.estado) && <ButtonLink href="/turnos" variante="accion">Pedir otro turno</ButtonLink>}
            {turno.puedeCancelar && !confirmando && !cambiando && (
              <>
                <Button variante="primario" onClick={() => { setCambiando(true); setOpciones([]); }}>Cambiar el día</Button>
                <Button variante="peligro" onClick={() => setConfirmando(true)}>Cancelar turno</Button>
              </>
            )}
          </div>

          {cambiando && (
            <section className="space-y-4 rounded-md border-2 border-primary bg-surface p-5">
              <h2 className="text-2xl font-bold">¿Qué días podés?</h2>
              <p>Marcá todos los que te sirvan. Elegimos uno y te confirmamos por WhatsApp.</p>
              {!disp ? <Cargando texto="Buscando días…" /> : <SelectorOpciones disp={disp} valor={opciones} onChange={setOpciones} />}
              <div className="flex flex-wrap gap-3">
                <Button variante="accion" disabled={opciones.length === 0 || enviando} onClick={reprogramar}>{enviando ? "Enviando…" : "Enviar días"}</Button>
                <Button variante="fantasma" onClick={() => setCambiando(false)}>Volver</Button>
              </div>
            </section>
          )}

          {confirmando && (
            <Aviso tipo="atencion" titulo="¿Cancelar el turno?">
              <p>Le dejamos el lugar a otra persona. Si solo querés otro día, mejor tocá &quot;Cambiar el día&quot;.</p>
              <div className="mt-3 flex flex-wrap gap-3">
                <Button variante="peligro" onClick={cancelar} disabled={cancelando}>{cancelando ? "Cancelando…" : "Sí, cancelar"}</Button>
                <Button variante="fantasma" onClick={() => setConfirmando(false)}>No, dejarlo</Button>
              </div>
            </Aviso>
          )}
        </div>
      )}
    </div>
  );
}
