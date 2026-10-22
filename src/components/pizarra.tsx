import Link from "next/link";
import { rangoPesos } from "@/lib/format";
import type { Incluye, ServicioPublico } from "@/lib/tipos";

/** Texto y color de cada cartel. Los valores tienen que coincidir con los que acepta la API. */
export const INCLUYE: Record<Exclude<Incluye, null>, { texto: string; clase: string }> = {
  mano_obra: { texto: "Solo mano de obra", clase: "border-border-strong text-muted" },
  materiales: { texto: "Incluye materiales", clase: "border-success bg-success-soft text-success" },
  kit: { texto: "Incluye kit completo", clase: "border-primary bg-primary-soft text-primary" },
};

export function CartelIncluye({ incluye, className = "" }: { incluye: Incluye; className?: string }) {
  if (!incluye) return null;
  const c = INCLUYE[incluye];
  return <span className={`inline-block whitespace-nowrap rounded border px-1.5 py-0.5 align-middle text-xs font-semibold ${c.clase} ${className}`}>{c.texto}</span>;
}

/**
 * El tarifario como el pizarrón del taller: nombre ........ precio, agrupado
 * por categoría. Es la pieza distintiva del sitio; todo lo demás es sobrio.
 */
export function Pizarra({ servicios, conLinks = false }: { servicios: ServicioPublico[]; conLinks?: boolean }) {
  const grupos = new Map<string, ServicioPublico[]>();
  for (const s of servicios) grupos.set(s.categoria, [...(grupos.get(s.categoria) ?? []), s]);

  return (
    <div className="space-y-10">
      {[...grupos].map(([categoria, lista]) => (
        <section key={categoria} aria-labelledby={`cat-${categoria}`}>
          <h2 id={`cat-${categoria}`} className="mb-3 border-b-2 border-foreground pb-1 text-2xl font-bold sm:text-3xl">{categoria}</h2>
          <ul className="divide-y divide-border">
            {lista.map((s) => (
              <li key={s.id} className="py-3">
                <div className="linea-precio">
                  <span className="font-medium sm:text-lg">
                    {conLinks ? (
                      <Link href={`/turnos?s=${s.id}`} className="underline-offset-4 hover:text-primary hover:underline">{s.nombre}</Link>
                    ) : s.nombre}
                  </span>
                  <span className="guia" aria-hidden />
                  <span className="tabular whitespace-nowrap font-display text-xl font-bold sm:text-2xl">
                    {s.precioMax > s.precioMin ? (
                      <><span className="sr-only">de </span>{rangoPesos(s.precioMin, s.precioMax).replace(" a ", " – ")}</>
                    ) : rangoPesos(s.precioMin, s.precioMax)}
                  </span>
                </div>
                <CartelIncluye incluye={s.incluye} className="mt-1" />
                {s.descripcion && <p className="mt-1 whitespace-pre-line text-sm">{s.descripcion}</p>}
                <p className="text-sm text-muted">{s.tiempo} de trabajo{s.esEscaneo ? ". Si hacés el arreglo con nosotros, te lo descontamos." : ""}</p>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
