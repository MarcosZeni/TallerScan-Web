import Link from "next/link";
import { Marca } from "@/components/marca";
import { ButtonLink } from "@/components/ui/button";
import { PieSitio } from "./components/pie-sitio";

const nav = [
  { href: "/tarifas", label: "Precios" },
  { href: "/turnos", label: "Turnos" },
  { href: "/mi-turno", label: "Mi turno" },
  { href: "/ubicacion", label: "Dónde estamos" },
];

export default function SitioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-banda-borde bg-banda text-on-banda">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <Marca sobreBanda />
          <nav aria-label="Principal" className="hidden items-center gap-1 sm:flex">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} className="rounded-md px-3 py-2 font-medium text-on-banda hover:bg-banda-hover hover:text-banda-enlace">
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <AccesoSocios />
            <ButtonLink href="/turnos" variante="accion">Pedir turno</ButtonLink>
          </div>
        </div>
        {/* En el celular, los links en una fila propia: cuatro entran sin menú escondido. */}
        <nav aria-label="Principal" className="flex justify-around border-t border-banda-borde sm:hidden">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="flex-1 py-2.5 text-center font-medium text-on-banda hover:text-banda-enlace">
              {n.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="flex-1">{children}</main>
      <PieSitio />
    </div>
  );
}

/**
 * Entrada al panel para los socios: arriba a la derecha, al lado de "Pedir
 * turno" pero apagado, para que el cliente no lo confunda con una acción
 * suya. En el celular queda solo el ícono (44 px de toque); en pantallas
 * medianas se suma la palabra. Con la sesión abierta, /ingresar pasa directo
 * al panel.
 */
function AccesoSocios() {
  return (
    <Link href="/ingresar" aria-label="Acceso socios" title="Acceso socios"
      className="flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-md px-2 text-sm font-medium text-banda-muted hover:bg-banda-hover hover:text-banda-enlace">
      <svg aria-hidden width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9.5" />
        <circle cx="12" cy="10" r="3.2" />
        <path d="M5.8 18.6c1.3-2.3 3.6-3.6 6.2-3.6s4.9 1.3 6.2 3.6" />
      </svg>
      <span className="hidden md:inline">Socios</span>
    </Link>
  );
}
