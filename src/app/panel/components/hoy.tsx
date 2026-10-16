"use client";

import { useEffect, useState } from "react";
import { Aviso, Cargando } from "@/components/ui/aviso";
import { Button } from "@/components/ui/button";
import { fechaLarga, hoyTaller, sumarDias } from "@/lib/format";
import { useUsuario } from "@/lib/sesion";
import type { Agenda, Turno } from "@/lib/tipos";
import { useDatos } from "@/lib/use-datos";
import { EditorJornada } from "./editor-jornada";
import { TurnoCard } from "./turno-card";

export function Hoy() {
  const { usuario } = useUsuario();
  const hoy = hoyTaller();
  const [fecha, setFechaEstado] = useState(hoy);
  const [editando, setEditando] = useState(false);
  const { datos: agenda, error, recargar, setDatos } = useDatos<Agenda>(`/api/v1/panel/agenda?fecha=${fecha}`);

  const setFecha = (f: string) => {
    setEditando(false);
    setFechaEstado(f);
  };

  // Los turnos nuevos llegan por Telegram, pero si la pantalla queda abierta en
  // el taller, que se actualice sola cada minuto (salvo mientras se edita).
  useEffect(() => {
    if (editando) return;
    const id = setInterval(recargar, 60_000);
    return () => clearInterval(id);
  }, [recargar, editando]);

  const cambio = (t: Turno) => setDatos((a) => ({ ...a, turnos: a.turnos.map((x) => (x.id === t.id ? t : x)) }));

  const pendientes = agenda?.turnos.filter((t) => t.estado === "pendiente") ?? [];
  const resto = agenda?.turnos.filter((t) => t.estado !== "pendiente") ?? [];
  const jornada = agenda?.jornada;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-muted">Hola, {usuario.nombre.split(" ")[0]}</p>
          <h1 className="text-3xl font-bold capitalize sm:text-4xl">{fecha === hoy ? "Hoy, " : ""}{fechaLarga(fecha)}</h1>
        </div>
        <div className="flex gap-2">
          <Button variante="secundario" onClick={() => setFecha(sumarDias(fecha, -1))} disabled={fecha <= hoy} aria-label="Día anterior">Anterior</Button>
          {fecha !== hoy && <Button variante="fantasma" onClick={() => setFecha(hoy)}>Hoy</Button>}
          <Button variante="secundario" onClick={() => setFecha(sumarDias(fecha, 1))} aria-label="Día siguiente">Siguiente</Button>
        </div>
      </div>

      {error && <Aviso tipo="error">{error}</Aviso>}
      {!agenda && !error && <Cargando />}

      {agenda && (
        <>
          {!usuario.telegramVinculado && usuario.esMecanico && (
            <Aviso tipo="atencion" titulo="Todavía no recibís avisos por Telegram">Vinculalo desde tu cuenta para que te lleguen los turnos nuevos al celular.</Aviso>
          )}

          <section className="rounded-md border-2 border-border bg-surface p-4">
            {editando || !jornada ? (
              <EditorJornada key={`${fecha}-${jornada?.bloqueMinutos ?? 0}`} fecha={fecha} agenda={agenda}
                onGuardado={() => { setEditando(false); recargar(); }} onCancelar={jornada ? () => setEditando(false) : undefined} />
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold">
                    {jornada.estado === "cerrada" ? "Marcado como cerrado: no se toman turnos." : `Agenda abierta, bloques de ${jornada.bloqueMinutos === 120 ? "2 horas" : jornada.bloqueMinutos === 60 ? "1 hora" : "30 minutos"}.`}
                  </p>
                  {jornada.estado === "abierta" && (
                    <p className="tabular text-muted">
                      {jornada.bloques.length} bloques, {jornada.bloques.reduce((a, b) => a + Math.max(0, b.cupo - b.ocupados), 0)} lugares libres.
                    </p>
                  )}
                </div>
                <Button variante="secundario" onClick={() => setEditando(true)}>Cambiar horarios</Button>
              </div>
            )}
          </section>

          {jornada?.estado === "abierta" && !editando && jornada.bloques.length > 0 && (
            <ul className="flex flex-wrap gap-2" aria-label="Ocupación por bloque">
              {jornada.bloques.map((b) => (
                <li key={b.id} className={`tabular rounded border px-2 py-1 text-sm font-semibold ${b.ocupados >= b.cupo ? "border-primary bg-primary text-on-primary" : "border-border"}`}>
                  {b.inicio.slice(0, 5)}: {b.ocupados} de {b.cupo}
                </li>
              ))}
            </ul>
          )}

          {pendientes.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-2xl font-bold">Para responder ({pendientes.length})</h2>
              {pendientes.map((t) => <TurnoCard key={t.id} turno={t} onCambio={cambio} />)}
            </section>
          )}

          <section className="space-y-3">
            <h2 className="text-2xl font-bold">Turnos del día</h2>
            {resto.length === 0 && pendientes.length === 0 ? (
              <p className="text-muted">No hay turnos para este día.</p>
            ) : resto.map((t) => <TurnoCard key={t.id} turno={t} onCambio={cambio} />)}
          </section>
        </>
      )}
    </div>
  );
}
