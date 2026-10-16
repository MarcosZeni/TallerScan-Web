"use client";

import { useEffect } from "react";
import { Cargando } from "@/components/ui/aviso";
import { ButtonA, ButtonLink } from "@/components/ui/button";
import { registrarVisita } from "@/lib/atribucion";
import { useSitio } from "@/lib/sitio";
import type { Sitio } from "@/lib/tipos";
import { linkWhatsApp } from "@/lib/whatsapp";

export function Ubicacion({ inicial }: { inicial: Sitio | null }) {
  const { sitio } = useSitio(inicial);
  useEffect(() => registrarVisita("ubicacion"), []);
  const t = sitio?.taller;
  const wa = linkWhatsApp(t?.whatsapp, "Hola, quería hacer una consulta.");

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-4xl font-bold sm:text-5xl">Dónde estamos</h1>
      {!t ? <Cargando /> : (
        <div className="mt-8 grid gap-8 sm:grid-cols-2">
          <section>
            <h2 className="text-2xl font-bold">Dirección</h2>
            {t.direccion ? (
              <p className="mt-2 text-lg">{t.direccion}{t.localidad && <><br />{t.localidad}</>}</p>
            ) : (
              <p className="mt-2 text-muted">Escribinos y te pasamos la dirección.</p>
            )}
            {t.mapaUrl && <ButtonA href={t.mapaUrl} variante="secundario" className="mt-4">Cómo llegar</ButtonA>}
          </section>
          <section>
            <h2 className="text-2xl font-bold">Horarios</h2>
            <ul className="mt-2 space-y-1 text-lg">{t.horarios.map((h) => <li key={h}>{h}</li>)}</ul>
          </section>
          <section className="sm:col-span-2">
            <h2 className="text-2xl font-bold">Contacto</h2>
            <div className="mt-3 flex flex-wrap gap-3">
              <ButtonLink href="/turnos" variante="accion">Pedir turno</ButtonLink>
              {wa && <ButtonA href={wa} variante="primario">WhatsApp</ButtonA>}
              {t.instagram && <ButtonA href={t.instagram} variante="secundario">Instagram</ButtonA>}
              {t.facebook && <ButtonA href={t.facebook} variante="secundario">Facebook</ButtonA>}
              {t.tiktok && <ButtonA href={t.tiktok} variante="secundario">TikTok</ButtonA>}
            </div>
            {t.emailContacto && <p className="mt-3 text-muted">Email: <a className="underline" href={`mailto:${t.emailContacto}`}>{t.emailContacto}</a></p>}
          </section>
        </div>
      )}
    </div>
  );
}
