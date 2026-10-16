"use client";

import { useState } from "react";
import { Aviso } from "@/components/ui/aviso";
import { Button, ButtonA } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { api, mensajeDe } from "@/lib/api";
import { siVencio, useUsuario } from "@/lib/sesion";

export default function Page() {
  const { usuario, recargar } = useUsuario();
  const [link, setLink] = useState<string | null>(null);
  const [msgTg, setMsgTg] = useState<string | null>(null);
  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [msgPw, setMsgPw] = useState<{ ok: boolean; t: string } | null>(null);

  async function vincular() {
    setMsgTg(null);
    try {
      const r = await api<{ link: string }>("/api/v1/auth/yo/telegram", { method: "POST" });
      setLink(r.link);
    } catch (e) {
      if (!siVencio(e)) setMsgTg(mensajeDe(e));
    }
  }

  async function desvincular() {
    await api("/api/v1/auth/yo/telegram", { method: "DELETE" }).catch(() => {});
    await recargar();
  }

  async function cambiarPassword(e: React.FormEvent) {
    e.preventDefault();
    setMsgPw(null);
    try {
      await api("/api/v1/auth/yo/password", { method: "PUT", json: { actual, nueva } });
      setActual(""); setNueva("");
      setMsgPw({ ok: true, t: "Listo, la contraseña quedó cambiada." });
    } catch (err) {
      if (!siVencio(err)) setMsgPw({ ok: false, t: mensajeDe(err) });
    }
  }

  async function salir() {
    await api("/api/v1/auth/salir", { method: "POST" }).catch(() => {});
    window.location.replace("/ingresar");
  }

  return (
    <div className="max-w-2xl space-y-10">
      <div>
        <h1 className="text-3xl font-bold sm:text-4xl">Mi cuenta</h1>
        <p className="text-muted">{usuario.nombre}, {usuario.email}</p>
        <p className="text-sm text-muted">
          {[usuario.esAdmin && "administrador", usuario.esMecanico && "mecánico", usuario.editaTarifas && "edita precios"].filter(Boolean).join(", ")}
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-2xl font-bold">Avisos por Telegram</h2>
        {usuario.telegramVinculado ? (
          <>
            <Aviso tipo="ok">Tu Telegram está vinculado. {usuario.esMecanico ? "Te llegan los turnos nuevos con botones para responder." : ""}</Aviso>
            <div className="flex gap-3">
              <Button variante="secundario" onClick={vincular}>Vincular otra cuenta</Button>
              <Button variante="fantasma" onClick={desvincular}>Desvincular</Button>
            </div>
          </>
        ) : (
          <p className="text-muted">Tocá el botón, se abre Telegram y apretás &quot;Iniciar&quot;. Listo.</p>
        )}
        {!usuario.telegramVinculado && !link && <Button variante="accion" onClick={vincular}>Vincular Telegram</Button>}
        {link && (
          <div className="space-y-2">
            <ButtonA href={link} variante="accion">Abrir Telegram</ButtonA>
            <p className="text-sm text-muted">El link vale 10 minutos. Cuando el bot te conteste, volvé y recargá esta página.</p>
            <Button variante="fantasma" onClick={() => void recargar()}>Ya lo vinculé</Button>
          </div>
        )}
        {msgTg && <Aviso tipo="error">{msgTg}</Aviso>}
      </section>

      <form onSubmit={cambiarPassword} className="space-y-3">
        <h2 className="text-2xl font-bold">Cambiar contraseña</h2>
        <Field label="Contraseña actual" htmlFor="pa"><Input id="pa" type="password" autoComplete="current-password" value={actual} onChange={(e) => setActual(e.target.value)} /></Field>
        <Field label="Contraseña nueva" htmlFor="pn" ayuda="Al menos 10 caracteres."><Input id="pn" type="password" autoComplete="new-password" value={nueva} onChange={(e) => setNueva(e.target.value)} /></Field>
        {msgPw && <Aviso tipo={msgPw.ok ? "ok" : "error"}>{msgPw.t}</Aviso>}
        <Button type="submit" variante="primario">Cambiar contraseña</Button>
      </form>

      <Button variante="peligro" onClick={salir}>Salir</Button>
    </div>
  );
}
