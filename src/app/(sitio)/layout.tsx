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
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <Marca sobreBanda />
          <nav aria-label="Principal" className="hidden items-center gap-1 sm:flex">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} className="rounded-md px-3 py-2 font-medium text-on-banda hover:bg-banda-hover hover:text-banda-enlace">
                {n.label}
              </Link>
            ))}
          </nav>
          <ButtonLink href="/turnos" variante="accion" className="shrink-0">Pedir turno</ButtonLink>
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
