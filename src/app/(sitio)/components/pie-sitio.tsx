"use client";

import Link from "next/link";
import { SITE } from "@/lib/site";
import { useSitio } from "@/lib/sitio";
import { linkWhatsApp } from "@/lib/whatsapp";

export function PieSitio() {
  const { sitio } = useSitio(null);
  const t = sitio?.taller;
  const wa = linkWhatsApp(t?.whatsapp, "Hola, quería hacer una consulta.");
  const redes = [
    { href: t?.instagram, label: "Instagram" },
    { href: t?.facebook, label: "Facebook" },
    { href: t?.tiktok, label: "TikTok" },
  ].filter((r) => r.href);

  return (
    <footer className="mt-16 border-t border-banda-borde bg-banda text-on-banda">
      <div className="mx-auto grid max-w-5xl gap-6 px-4 py-8 sm:grid-cols-3">
        <div>
          <p className="font-display text-xl font-bold">{SITE.name}</p>
          {t?.direccion && <p className="text-banda-muted">{t.direccion}{t.localidad ? `, ${t.localidad}` : ""}</p>}
        </div>
        <div>
          <p className="font-semibold">Horarios</p>
          {(t?.horarios ?? []).map((h) => <p key={h} className="text-banda-muted">{h}</p>)}
        </div>
        <div className="space-y-1">
          {wa && <p><a href={wa} target="_blank" rel="noopener noreferrer" className="font-semibold text-banda-enlace underline-offset-4 hover:underline">Escribinos por WhatsApp</a></p>}
          {redes.map((r) => (
            <p key={r.label}><a href={r.href} target="_blank" rel="noopener noreferrer" className="text-banda-enlace underline-offset-4 hover:underline">{r.label}</a></p>
          ))}
          <p><Link href="/mi-turno" className="text-banda-muted underline-offset-4 hover:underline">Ver mi turno</Link></p>
        </div>
      </div>
      {/* Entrada al panel: a la vista para los socios, sin competir con "Pedir turno". */}
      <div className="border-t border-banda-borde">
        <div className="mx-auto flex max-w-5xl justify-end px-4 py-3">
          <Link href="/ingresar" className="text-sm text-banda-muted underline-offset-4 hover:text-banda-enlace hover:underline">Acceso socios</Link>
        </div>
      </div>
    </footer>
  );
}
