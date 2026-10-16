"use client";

import { useCallback, useEffect, useState } from "react";
import { Aviso, Cargando } from "@/components/ui/aviso";
import { Field, Input, Select } from "@/components/ui/field";
import { api, mensajeDe } from "@/lib/api";
import { ESTADOS, hoyTaller, sumarDias } from "@/lib/format";
import { siVencio } from "@/lib/sesion";
import type { Turno } from "@/lib/tipos";
import { TurnoCard } from "../components/turno-card";

export default function Page() {
  const hoy = hoyTaller();
  const [estado, setEstado] = useState("pendiente");
  const [q, setQ] = useState("");
  const [desde, setDesde] = useState(sumarDias(hoy, -30));
  const [turnos, setTurnos] = useState<Turno[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const buscar = useCallback(async () => {
    setError(null);
    const p = new URLSearchParams();
    if (estado) p.set("estado", estado);
    if (q.trim()) p.set("q", q.trim());
    // Pendientes y confirmados: todos, sin importar la fecha. El resto, desde la fecha elegida.
    if (!["pendiente", "confirmado"].includes(estado) && desde) p.set("desde", desde);
    try {
      setTurnos(await api<Turno[]>(`/api/v1/panel/turnos?${p}`));
    } catch (e) {
      if (!siVencio(e)) setError(mensajeDe(e));
    }
  }, [estado, q, desde]);

  useEffect(() => {
    const id = setTimeout(() => void buscar(), 250);
    return () => clearTimeout(id);
  }, [buscar]);

  const cambio = (t: Turno) => setTurnos((l) => l?.map((x) => (x.id === t.id ? t : x)) ?? null);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold sm:text-4xl">Turnos</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Estado" htmlFor="estado">
          <Select id="estado" value={estado} onChange={(e) => setEstado(e.target.value)}>
            <option value="">Todos</option>
            {Object.entries(ESTADOS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </Select>
        </Field>
        <Field label="Buscar" htmlFor="q" ayuda="Patente, nombre o WhatsApp">
          <Input id="q" value={q} onChange={(e) => setQ(e.target.value)} />
        </Field>
        {!["pendiente", "confirmado"].includes(estado) && (
          <Field label="Desde" htmlFor="desde">
            <Input id="desde" type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
          </Field>
        )}
      </div>
      {error && <Aviso tipo="error">{error}</Aviso>}
      {!turnos && !error && <Cargando />}
      {turnos && turnos.length === 0 && <p className="text-muted">No hay turnos con ese filtro.</p>}
      <div className="space-y-3">
        {turnos?.map((t) => <TurnoCard key={t.id} turno={t} onCambio={cambio} mostrarFecha />)}
      </div>
    </div>
  );
}
