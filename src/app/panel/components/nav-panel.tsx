"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Marca } from "@/components/marca";
import { useUsuario } from "@/lib/sesion";

const items = [
  { href: "/panel", label: "Hoy", corto: "Hoy" },
  { href: "/panel/turnos", label: "Turnos", corto: "Turnos" },
  { href: "/panel/metricas", label: "Métricas", corto: "Métricas" },
  { href: "/panel/finanzas", label: "Finanzas", corto: "Plata" },
  { href: "/panel/ajustes", label: "Ajustes", corto: "Ajustes" },
];

export function NavPanel() {
  const { usuario } = useUsuario();
  const path = usePathname().replace(/\/$/, "") || "/panel";
  const activo = (href: string) => (href === "/panel" ? path === "/panel" : path.startsWith(href));
  // Precios solo para quien edita el tarifario; Socios solo para el dueño. Ajustes siempre al final.
  const lista = [
    ...items.slice(0, 4),
    ...(usuario.editaTarifas ? [{ href: "/panel/tarifas", label: "Precios", corto: "Precios" }] : []),
    ...(usuario.esDueno ? [{ href: "/panel/socios", label: "Socios", corto: "Socios" }] : []),
    items[4],
  ];

  return (
    <>
      <header className="border-b border-banda-borde bg-banda text-on-banda">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          {/* El logo siempre lleva a la portada; el panel se vuelve desde "Hoy". */}
          <Marca sobreBanda />
          <nav aria-label="Panel" className="hidden gap-1 sm:flex">
            {lista.map((i) => (
              <Link key={i.href} href={i.href} aria-current={activo(i.href) ? "page" : undefined}
                className={`rounded-md px-3 py-2 font-medium ${activo(i.href) ? "bg-primary text-on-primary" : "text-on-banda hover:bg-banda-hover hover:text-banda-enlace"}`}>
                {i.label}
              </Link>
            ))}
          </nav>
          <Link href="/panel/cuenta" className="rounded-md px-2 py-2 font-medium text-banda-muted hover:text-banda-enlace">{usuario.nombre.split(" ")[0]}</Link>
        </div>
      </header>
      {/* Celular: barra abajo, como en las apps. */}
      <nav aria-label="Panel" className="fixed inset-x-0 bottom-0 z-20 flex border-t border-border bg-surface sm:hidden">
        {lista.map((i) => (
          <Link key={i.href} href={i.href} aria-current={activo(i.href) ? "page" : undefined}
            className={`flex min-h-14 flex-1 items-center justify-center text-sm font-semibold ${activo(i.href) ? "text-primary" : "text-muted"}`}>
            <span className={activo(i.href) ? "border-b-2 border-primary pb-0.5" : ""}>{i.corto}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
