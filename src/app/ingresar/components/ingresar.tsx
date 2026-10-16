"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Marca } from "@/components/marca";
import { Aviso } from "@/components/ui/aviso";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { api, mensajeDe } from "@/lib/api";
import type { Usuario } from "@/lib/tipos";
import { useDatos } from "@/lib/use-datos";

export function Ingresar() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  // Solo rutas propias del panel: nada de volver a un sitio ajeno.
  const volver = params.get("volver");
  const destino = volver && volver.startsWith("/panel") ? volver : "/panel";

  // Con la sesión ya abierta, directo al panel. Sin sesión, /auth/yo da 401 y se queda acá.
  const { datos: yaAdentro } = useDatos<Usuario>("/api/v1/auth/yo");
  useEffect(() => {
    if (yaAdentro) router.replace(destino);
  }, [yaAdentro, router, destino]);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setError(null);
    try {
      await api("/api/v1/auth/ingresar", { method: "POST", json: { email, password } });
      router.replace(destino);
    } catch (err) {
      setError(mensajeDe(err));
      setPassword("");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <Marca />
      <h1 className="mt-8 text-3xl font-bold">Ingresar al panel</h1>
      <form onSubmit={enviar} className="mt-6 space-y-4">
        {error && <Aviso tipo="error">{error}</Aviso>}
        <Field label="Email" htmlFor="email">
          <Input id="email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </Field>
        <Field label="Contraseña" htmlFor="password">
          <Input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </Field>
        <Button type="submit" variante="primario" disabled={enviando} className="w-full">{enviando ? "Ingresando…" : "Ingresar"}</Button>
      </form>
    </div>
  );
}
