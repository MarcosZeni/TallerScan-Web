"use client";

import Link from "next/link";
import { IconoRed, type Red } from "@/components/iconos-redes";
import { Marca } from "@/components/marca";
import { SITE } from "@/lib/site";
import { useSitio } from "@/lib/sitio";
import { linkWhatsApp } from "@/lib/whatsapp";

/**
 * Pie con los datos del taller. Todo sale de la API (se edita desde Ajustes):
 * lo que no está cargado no se muestra, ni siquiera el título, para que el
 * pie nunca quede con encabezados vacíos. El acceso de los socios va en el
 * encabezado, no acá. WhatsApp y las redes van como íconos debajo de los
 * horarios: se reconocen de un vistazo y no alargan el pie en el celular.
 */
export function PieSitio() {
  const { sitio } = useSitio(null);
  const t = sitio?.taller;
  const wa = linkWhatsApp(t?.whatsapp, "Hola, quería hacer una consulta.");
  const horarios = t?.horarios ?? [];
  const redes = (
    [
      { red: "whatsapp", href: wa, label: "Escribinos por WhatsApp" },
      { red: "instagram", href: t?.instagram, label: "Instagram" },
      { red: "facebook", href: t?.facebook, label: "Facebook" },
      { red: "tiktok", href: t?.tiktok, label: "TikTok" },
    ] as { red: Red; href: string | null | undefined; label: string }[]
  ).filter((r): r is { red: Red; href: string; label: string } => !!r.href);

  return (
    <footer className="mt-16 border-t border-banda-borde bg-banda text-on-banda">
      <div className="mx-auto grid max-w-5xl gap-6 px-4 py-8 sm:grid-cols-3">
        <div className="space-y-2">
          <Marca sobreBanda />
          {/* Eslogan: el mismo mensaje que el título de la pestaña y la portada. */}
          <p className="font-display text-xl font-semibold">Mecánica con precios a la vista.</p>
          <p className="text-banda-muted">Escaneo computarizado, turnos online y el precio publicado antes de empezar.</p>
          {t?.direccion && (
            <p className="text-banda-muted">
              {t.mapaUrl ? <a href={t.mapaUrl} target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:text-banda-enlace hover:underline">{t.direccion}{t.localidad ? `, ${t.localidad}` : ""}</a> : <>{t.direccion}{t.localidad ? `, ${t.localidad}` : ""}</>}
            </p>
          )}
        </div>
        {(horarios.length > 0 || redes.length > 0) && (
          <div>
            {horarios.length > 0 && <p className="font-semibold">Horarios</p>}
            {horarios.map((h) => <p key={h} className="text-banda-muted">{h}</p>)}
            {redes.length > 0 && (
              /* Área táctil de 44px por ícono; el nombre queda para lectores de pantalla y como tooltip. */
              <ul className="mt-3 flex flex-wrap gap-1">
                {redes.map((r) => (
                  <li key={r.red}>
                    <a href={r.href} target="_blank" rel="noopener noreferrer" aria-label={r.label} title={r.label}
                      className="flex h-11 w-11 items-center justify-center rounded-md text-banda-enlace hover:bg-banda-hover">
                      <IconoRed red={r.red} />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        <div className="space-y-1 sm:col-start-3">
          <p><Link href="/mi-turno" className="text-banda-muted underline-offset-4 hover:underline">Ver mi turno</Link></p>
          <p><Link href="/ubicacion" className="text-banda-muted underline-offset-4 hover:underline">Dónde estamos</Link></p>
          <p><Link href="/nosotros" className="text-banda-muted underline-offset-4 hover:underline">Nosotros</Link></p>
          <p><Link href="/privacidad" className="text-banda-muted underline-offset-4 hover:underline">Privacidad</Link></p>
        </div>
      </div>
      {/* La localidad sale de Ajustes, como el resto de los datos del taller. */}
      <div className="border-t border-banda-borde">
        <p className="mx-auto max-w-5xl px-4 py-3 text-sm text-banda-muted">© {new Date().getFullYear()} {SITE.name}{t?.localidad ? `. Taller mecánico en ${t.localidad}.` : "."}</p>
      </div>
    </footer>
  );
}
