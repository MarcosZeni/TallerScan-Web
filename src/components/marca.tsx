import Link from "next/link";
import { SITE } from "@/lib/site";

/** Nombre del sitio como logotipo: condensada, gruesa, con la franja amarilla de seguridad. */
export function Marca({ href = "/", sobreBanda = false }: { href?: string; sobreBanda?: boolean }) {
  return (
    <Link href={href} className="group inline-flex items-center gap-2" aria-label={`${SITE.name}, inicio`}>
      <span aria-hidden className="block h-7 w-2 rounded-sm bg-accent" />
      <span className={`font-display text-2xl font-bold tracking-tight ${sobreBanda ? "text-on-banda group-hover:text-banda-enlace" : "text-foreground group-hover:text-primary"}`}>{SITE.name}</span>
    </Link>
  );
}
