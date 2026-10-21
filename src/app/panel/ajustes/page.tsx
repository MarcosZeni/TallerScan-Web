"use client";

import { useCallback, useEffect, useState } from "react";
import { Aviso, Cargando } from "@/components/ui/aviso";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { api, mensajeDe } from "@/lib/api";
import { siVencio, useUsuario } from "@/lib/sesion";
import { FotosTaller } from "./fotos-taller";
import { HorarioFijoEditor } from "./horario-fijo";
import type { ConfigCompleta, Notificacion, Taller, TurnosConfig } from "@/lib/tipos";

export default function Page() {
  const { usuario } = useUsuario();
  const [config, setConfig] = useState<ConfigCompleta | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<ConfigCompleta>("/api/v1/admin/config").then(setConfig).catch((e) => { if (!siVencio(e)) setError(mensajeDe(e)); });
  }, []);

  if (error) return <Aviso tipo="error">{error}</Aviso>;
  if (!config) return <Cargando />;

  return (
    <div className="max-w-3xl space-y-12">
      <h1 className="text-3xl font-bold sm:text-4xl">Ajustes</h1>
      {usuario.esDueno ? <DatosTaller inicial={config.taller} /> : <p className="text-muted">Los datos del taller los edita el dueño. Las cuentas de los socios están en la pestaña &quot;Socios&quot;, también del dueño.</p>}
      <FotosTaller />
      <ReglasTurnos inicial={config.turnos} />
      <Avisos />
    </div>
  );
}

function useGuardar<T>(path: string) {
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const guardar = async (v: T) => {
    setMsg(null);
    try {
      await api(path, { method: "PUT", json: v });
      setMsg({ ok: true, t: "Guardado." });
    } catch (e) {
      if (!siVencio(e)) setMsg({ ok: false, t: mensajeDe(e) });
    }
  };
  return { msg, guardar };
}

function DatosTaller({ inicial }: { inicial: Taller }) {
  const [t, setT] = useState(inicial);
  const [horarios, setHorarios] = useState(inicial.horarios.join("\n"));
  const { msg, guardar } = useGuardar<Taller>("/api/v1/admin/config/taller");
  const campo = (k: keyof Taller, label: string, ayuda?: string, tipo = "text") => (
    <Field label={label} htmlFor={`t-${k}`} ayuda={ayuda}>
      <Input id={`t-${k}`} type={tipo} value={t[k] as string} onChange={(e) => setT({ ...t, [k]: e.target.value })} />
    </Field>
  );

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold">Datos del taller</h2>
      <p className="text-muted">Lo que se ve en la web: dirección, horarios, WhatsApp y redes.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        {campo("direccion", "Dirección")}
        {campo("localidad", "Localidad")}
        {campo("whatsapp", "WhatsApp del taller", "Con característica, sin el 15")}
        {campo("emailContacto", "Email de contacto", undefined, "email")}
        {campo("mapaUrl", "Link de Google Maps", "Empieza con https://")}
        {campo("instagram", "Instagram", "https://instagram.com/...")}
        {campo("facebook", "Facebook")}
        {campo("tiktok", "TikTok")}
      </div>
      <Field label="Horarios de atención" htmlFor="t-horarios" ayuda="Una línea por renglón. Ej.: Lunes a viernes de 9 a 18">
        <Textarea id="t-horarios" value={horarios} onChange={(e) => setHorarios(e.target.value)} />
      </Field>
      <Field label='Página "Nosotros"' htmlFor="t-nosotros" ayuda="Quiénes son y cómo trabajan. Un renglón vacío separa los párrafos; **así** va en negrita. Sin nombres de los padres ni de sus talleres.">
        <Textarea id="t-nosotros" rows={10} value={t.nosotros} onChange={(e) => setT({ ...t, nosotros: e.target.value })} />
      </Field>
      {msg && <Aviso tipo={msg.ok ? "ok" : "error"}>{msg.t}</Aviso>}
      <Button variante="accion" onClick={() => guardar({ ...t, horarios: horarios.split("\n") })}>Guardar datos del taller</Button>
    </section>
  );
}

const DIAS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

function ReglasTurnos({ inicial }: { inicial: TurnosConfig }) {
  const [c, setC] = useState(inicial);
  const [avisos, setAvisos] = useState(inicial.minutosAviso.join(", "));
  const { msg, guardar } = useGuardar<TurnosConfig>("/api/v1/admin/config/turnos");
  const horaCampo = (k: keyof TurnosConfig, label: string, ayuda?: string) => (
    <Field label={label} htmlFor={`c-${k}`} ayuda={ayuda}>
      <Input id={`c-${k}`} type="time" value={c[k] as string} onChange={(e) => setC({ ...c, [k]: e.target.value })} />
    </Field>
  );

  // Los horarios fijos se mandan ordenados (la API también los ordena) y quedan así en pantalla.
  const guardarTodo = () => {
    const ordenados = [...c.horarioFijo.bloques].sort((a, b) => a.inicio.localeCompare(b.inicio));
    setC({ ...c, horarioFijo: { ...c.horarioFijo, bloques: ordenados } });
    return guardar({
      ...c,
      horarioFijo: { ...c.horarioFijo, bloques: ordenados },
      minutosAviso: avisos.split(/[,\s]+/).map(Number).filter((n) => n > 0),
    });
  };

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold">Reglas de turnos</h2>
      <div>
        <p className="mb-2 font-semibold">Días que se pueden pedir para adelante</p>
        <div className="flex flex-wrap gap-2">
          {DIAS.map((d, i) => (
            <button key={d} aria-pressed={c.diasSemana.includes(i)}
              onClick={() => setC({ ...c, diasSemana: c.diasSemana.includes(i) ? c.diasSemana.filter((x) => x !== i) : [...c.diasSemana, i] })}
              className={`min-h-11 min-w-14 rounded-md border-2 font-semibold ${c.diasSemana.includes(i) ? "border-primary bg-primary text-on-primary" : "border-border"}`}>{d}</button>
          ))}
        </div>
        <p className="mt-2 text-sm text-muted">Son los días de atención: se pueden pedir para adelante y la agenda de hoy se abre sola (ver &quot;Horario fijo&quot;).</p>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {horaCampo("mananaDesde", "Mañana desde")}
        {horaCampo("mananaHasta", "Mañana hasta")}
        {horaCampo("tardeDesde", "Tarde desde")}
        {horaCampo("tardeHasta", "Tarde hasta")}
        {horaCampo("corteDesde", "Corte del mediodía desde")}
        {horaCampo("corteHasta", "Corte hasta")}
        {horaCampo("horaRecordatorio", "Recordatorio del día anterior a las")}
        <Field label="Días hacia adelante" htmlFor="c-dias">
          <Input id="c-dias" inputMode="numeric" value={c.diasAnticipacion} onChange={(e) => setC({ ...c, diasAnticipacion: Number(e.target.value.replace(/\D/g, "")) || 1 })} />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Re-avisar a los (minutos)" htmlFor="c-avisos" ayuda="Separados por coma">
          <Input id="c-avisos" value={avisos} onChange={(e) => setAvisos(e.target.value)} />
        </Field>
        <Field label="Liberar el turno de hoy a los (minutos)" htmlFor="c-lib">
          <Input id="c-lib" inputMode="numeric" value={c.minutosLiberar} onChange={(e) => setC({ ...c, minutosLiberar: Number(e.target.value.replace(/\D/g, "")) || 17 })} />
        </Field>
        <Field label="Escaneo convertido si arregla dentro de (días)" htmlFor="c-gancho">
          <Input id="c-gancho" inputMode="numeric" value={c.diasGancho} onChange={(e) => setC({ ...c, diasGancho: Number(e.target.value.replace(/\D/g, "")) || 30 })} />
        </Field>
      </div>

      <HorarioFijoEditor valor={c.horarioFijo} onChange={(horarioFijo) => setC({ ...c, horarioFijo })} />

      <div className="space-y-3 rounded-md border-2 border-border bg-surface p-4">
        <div>
          <h3 className="text-xl font-bold">Noche y mañana</h3>
          <p className="text-muted">De noche no te llegan avisos de Telegram: esperan y salen a la mañana, después del resumen. A los clientes los emails les salen igual. Apagado, todo funciona como siempre.</p>
        </div>
        <label className="flex min-h-11 cursor-pointer items-center gap-3">
          <input type="checkbox" className="size-6 accent-[var(--color-primary)]" checked={c.silencioActivo}
            onChange={(e) => setC({ ...c, silencioActivo: e.target.checked })} />
          <span className="font-semibold">Silencio de noche y resumen a la mañana</span>
        </label>
        {c.silencioActivo && (
          <div className="grid gap-4 sm:grid-cols-3">
            {horaCampo("silencioDesde", "Silencio desde las", "Desde esta hora no te llegan turnos nuevos, re-avisos ni cancelaciones. Se guardan y te llegan a la mañana.")}
            {horaCampo("resumenHora", "Resumen de la mañana a las", "Te llega cómo abrió la agenda de hoy y cuántas solicitudes tenés. Ahí termina el silencio.")}
            {horaCampo("reservaHoyDesde", "Reservas de hoy desde las", "Antes de esta hora el cliente no toma un horario de hoy: lo solicita y vos lo confirmás, sin apuro. Así no se libera solo mientras dormís.")}
          </div>
        )}
      </div>

      {msg && <Aviso tipo={msg.ok ? "ok" : "error"}>{msg.t}</Aviso>}
      <Button variante="primario" onClick={guardarTodo}>Guardar reglas de turnos</Button>
    </section>
  );
}

function Avisos() {
  const [lista, setLista] = useState<Notificacion[] | null>(null);
  const cargar = useCallback(() => api<Notificacion[]>("/api/v1/admin/notificaciones?estado=fallida").then(setLista).catch(() => setLista([])), []);
  useEffect(() => { void cargar(); }, [cargar]);

  return (
    <section className="space-y-3">
      <h2 className="text-2xl font-bold">Avisos que no salieron</h2>
      <p className="text-muted">Emails o mensajes de Telegram que fallaron 8 veces. Podés volver a intentarlos.</p>
      {!lista ? <Cargando /> : lista.length === 0 ? <Aviso tipo="ok">Salieron todos los avisos.</Aviso> : (
        <ul className="divide-y divide-border rounded-md border-2 border-border bg-surface">
          {lista.map((n) => (
            <li key={n.id} className="flex flex-wrap items-center justify-between gap-2 p-3">
              <div>
                <p className="font-semibold">{n.canal === "email" ? `Email a ${n.destino}` : "Telegram"}{n.turnoId ? `, turno #${n.turnoId}` : ""}</p>
                <p className="text-sm text-muted">{n.asunto ?? ""} {n.ultimoError ? `(${n.ultimoError.slice(0, 120)})` : ""}</p>
              </div>
              <Button variante="secundario" onClick={async () => { await api(`/api/v1/admin/notificaciones/${n.id}/reintentar`, { method: "POST" }).catch(() => {}); void cargar(); }}>Reintentar</Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
