"use client";

import { useCallback, useEffect, useState } from "react";
import { Aviso, Cargando, Etiqueta } from "@/components/ui/aviso";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { api, mensajeDe } from "@/lib/api";
import { useUsuario } from "@/lib/sesion";
import type { Usuario } from "@/lib/tipos";

/**
 * Cuentas de los socios. Solo el dueño (la pestaña no aparece para los demás,
 * y la API rechaza igual): crea, edita y suspende. El rango dueño no se da
 * desde acá, solo por consola.
 */
export default function Page() {
  const { usuario: yo } = useUsuario();
  const [lista, setLista] = useState<Usuario[] | null>(null);
  const [nuevo, setNuevo] = useState({ nombre: "", email: "", password: "", esMecanico: true, editaTarifas: false });
  const [abierto, setAbierto] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(() => api<Usuario[]>("/api/v1/admin/usuarios").then(setLista).catch((e) => setError(mensajeDe(e))), []);
  useEffect(() => { if (yo.esDueno) void cargar(); }, [cargar, yo.esDueno]);

  if (!yo.esDueno) return <Aviso tipo="atencion">Las cuentas de los socios las maneja el dueño.</Aviso>;

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
    <div className="max-w-3xl space-y-4">
      <h1 className="text-3xl font-bold sm:text-4xl">Socios</h1>
      <p className="text-muted">Todos ven métricas y finanzas. &quot;Mecánico&quot; recibe los turnos por Telegram; &quot;Precios&quot; edita solo el tarifario. Cada socio vincula su Telegram desde su cuenta.</p>
      {error && <Aviso tipo="error">{error}</Aviso>}
      {!lista ? <Cargando /> : (
        <ul className="divide-y divide-border rounded-md border-2 border-border bg-surface">
          {lista.map((u) => (
            <li key={u.id} className="flex flex-wrap items-center justify-between gap-3 p-3">
              <div>
                <p className="font-semibold">{u.nombre} {u.id === yo.id && <span className="text-muted">(vos)</span>}</p>
                <p className="text-sm text-muted">{u.email}</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {u.esDueno && <Etiqueta tono="info">Dueño</Etiqueta>}
                  {u.telegramVinculado ? <Etiqueta tono="ok">Telegram vinculado</Etiqueta> : <Etiqueta>Sin Telegram</Etiqueta>}
                  {u.estado === "suspendido" && <Etiqueta tono="error">Suspendido</Etiqueta>}
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <label className="flex items-center gap-2"><input type="checkbox" className="size-5" checked={u.esMecanico} onChange={(e) => editar(u, { esMecanico: e.target.checked })} /> Mecánico</label>
                {/* El dueño edita precios siempre: la casilla no aplica. */}
                {!u.esDueno && <label className="flex items-center gap-2"><input type="checkbox" className="size-5" checked={u.editaTarifas} onChange={(e) => editar(u, { editaTarifas: e.target.checked })} /> Precios</label>}
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
          <Field label="Contraseña inicial" htmlFor="s-p" ayuda="Al menos 10 caracteres. Le llega por email junto con el link al panel; que la cambie al entrar."><Input id="s-p" type="text" value={nuevo.password} onChange={(e) => setNuevo({ ...nuevo, password: e.target.value })} /></Field>
          <label className="flex items-center gap-2"><input type="checkbox" className="size-5" checked={nuevo.esMecanico} onChange={(e) => setNuevo({ ...nuevo, esMecanico: e.target.checked })} /> Mecánico</label>
          <label className="flex items-center gap-2"><input type="checkbox" className="size-5" checked={nuevo.editaTarifas} onChange={(e) => setNuevo({ ...nuevo, editaTarifas: e.target.checked })} /> Precios</label>
          <div className="flex gap-3 sm:col-span-3">
            <Button variante="primario" onClick={crear}>Crear cuenta</Button>
            <Button variante="fantasma" onClick={() => setAbierto(false)}>Volver</Button>
          </div>
        </div>
      )}
    </div>
  );
}
