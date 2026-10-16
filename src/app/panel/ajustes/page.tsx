"use client";

import { useCallback, useEffect, useState } from "react";
import { Aviso, Cargando, Etiqueta } from "@/components/ui/aviso";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { api, mensajeDe } from "@/lib/api";
import { siVencio, useUsuario } from "@/lib/sesion";
import type { ConfigCompleta, Notificacion, Taller, TurnosConfig, Usuario } from "@/lib/tipos";

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
      <DatosTaller inicial={config.taller} />
      <ReglasTurnos inicial={config.turnos} />
      <Avisos />
      {usuario.editaTarifas && <Socios />}
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
  const horaCampo = (k: keyof TurnosConfig, label: string) => (
    <Field label={label} htmlFor={`c-${k}`}>
      <Input id={`c-${k}`} type="time" value={c[k] as string} onChange={(e) => setC({ ...c, [k]: e.target.value })} />
    </Field>
  );

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold">Turnos</h2>
      <div>
        <p className="mb-2 font-semibold">Días que se pueden pedir para adelante</p>
        <div className="flex flex-wrap gap-2">
          {DIAS.map((d, i) => (
            <button key={d} aria-pressed={c.diasSemana.includes(i)}
              onClick={() => setC({ ...c, diasSemana: c.diasSemana.includes(i) ? c.diasSemana.filter((x) => x !== i) : [...c.diasSemana, i] })}
              className={`min-h-11 min-w-14 rounded-md border-2 font-semibold ${c.diasSemana.includes(i) ? "border-primary bg-primary text-on-primary" : "border-border"}`}>{d}</button>
          ))}
        </div>
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
      {msg && <Aviso tipo={msg.ok ? "ok" : "error"}>{msg.t}</Aviso>}
      <Button variante="primario" onClick={() => guardar({ ...c, minutosAviso: avisos.split(/[,\s]+/).map(Number).filter((n) => n > 0) })}>Guardar reglas de turnos</Button>
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

function Socios() {
  const { usuario: yo } = useUsuario();
  const [lista, setLista] = useState<Usuario[] | null>(null);
  const [nuevo, setNuevo] = useState({ nombre: "", email: "", password: "", esMecanico: true, editaTarifas: false });
  const [abierto, setAbierto] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(() => api<Usuario[]>("/api/v1/admin/usuarios").then(setLista).catch((e) => setError(mensajeDe(e))), []);
  useEffect(() => { void cargar(); }, [cargar]);

  async function editar(u: Usuario, c: Partial<Usuario>) {
    setError(null);
    const v = { ...u, ...c };
    try {
      await api(`/api/v1/admin/usuarios/${u.id}`, { method: "PUT", json: { nombre: v.nombre, esAdmin: true, esMecanico: v.esMecanico, editaTarifas: v.editaTarifas, estado: v.estado } });
      void cargar();
    } catch (e) {
      setError(mensajeDe(e));
    }
  }

  async function crear() {
    setError(null);
    try {
      await api("/api/v1/admin/usuarios", { method: "POST", json: { ...nuevo, esAdmin: true } });
      setAbierto(false);
      setNuevo({ nombre: "", email: "", password: "", esMecanico: true, editaTarifas: false });
      void cargar();
    } catch (e) {
      setError(mensajeDe(e));
    }
  }

  return (
    <section className="space-y-3">
      <h2 className="text-2xl font-bold">Socios</h2>
      <p className="text-muted">Todos ven métricas y finanzas. &quot;Mecánico&quot; recibe los turnos por Telegram; &quot;Precios&quot; edita el tarifario y los socios.</p>
      {error && <Aviso tipo="error">{error}</Aviso>}
      {!lista ? <Cargando /> : (
        <ul className="divide-y divide-border rounded-md border-2 border-border bg-surface">
          {lista.map((u) => (
            <li key={u.id} className="flex flex-wrap items-center justify-between gap-3 p-3">
              <div>
                <p className="font-semibold">{u.nombre} {u.id === yo.id && <span className="text-muted">(vos)</span>}</p>
                <p className="text-sm text-muted">{u.email}</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {u.telegramVinculado ? <Etiqueta tono="ok">Telegram vinculado</Etiqueta> : <Etiqueta>Sin Telegram</Etiqueta>}
                  {u.estado === "suspendido" && <Etiqueta tono="error">Suspendido</Etiqueta>}
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <label className="flex items-center gap-2"><input type="checkbox" className="size-5" checked={u.esMecanico} onChange={(e) => editar(u, { esMecanico: e.target.checked })} /> Mecánico</label>
                <label className="flex items-center gap-2"><input type="checkbox" className="size-5" checked={u.editaTarifas} disabled={u.id === yo.id} onChange={(e) => editar(u, { editaTarifas: e.target.checked })} /> Precios</label>
                {u.id !== yo.id && <Button variante="fantasma" onClick={() => editar(u, { estado: u.estado === "activo" ? "suspendido" : "activo" })}>{u.estado === "activo" ? "Suspender" : "Reactivar"}</Button>}
              </div>
            </li>
          ))}
        </ul>
      )}
      {!abierto ? <Button variante="secundario" onClick={() => setAbierto(true)}>Agregar socio</Button> : (
        <div className="grid gap-3 rounded-md border-2 border-primary bg-surface p-4 sm:grid-cols-3">
          <Field label="Nombre" htmlFor="s-n"><Input id="s-n" value={nuevo.nombre} onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })} /></Field>
          <Field label="Email" htmlFor="s-e"><Input id="s-e" type="email" value={nuevo.email} onChange={(e) => setNuevo({ ...nuevo, email: e.target.value })} /></Field>
          <Field label="Contraseña inicial" htmlFor="s-p" ayuda="Al menos 10 caracteres. Que la cambie al entrar."><Input id="s-p" type="text" value={nuevo.password} onChange={(e) => setNuevo({ ...nuevo, password: e.target.value })} /></Field>
          <label className="flex items-center gap-2"><input type="checkbox" className="size-5" checked={nuevo.esMecanico} onChange={(e) => setNuevo({ ...nuevo, esMecanico: e.target.checked })} /> Mecánico</label>
          <label className="flex items-center gap-2"><input type="checkbox" className="size-5" checked={nuevo.editaTarifas} onChange={(e) => setNuevo({ ...nuevo, editaTarifas: e.target.checked })} /> Precios</label>
          <div className="flex gap-3 sm:col-span-3">
            <Button variante="primario" onClick={crear}>Crear cuenta</Button>
            <Button variante="fantasma" onClick={() => setAbierto(false)}>Volver</Button>
          </div>
        </div>
      )}
    </section>
  );
}
