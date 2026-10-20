import Image from "next/image";
import Link from "next/link";
import { SITE } from "@/lib/site";

/**
 * Logotipo: el símbolo (conector OBD con la llave y el pulso del escáner) y el
 * nombre en condensada gruesa. El nombre va como texto, no dentro de la imagen,
 * porque sale de NEXT_PUBLIC_SITE_NAME y así se mantiene editable.
 *
 * El símbolo es un PNG a 4x (112 px de alto) que se muestra a 28 px: nítido en
 * pantallas retina y pesa 26 KB. Original en `Logos/` del workspace.
 */
export function Marca({ href = "/", sobreBanda = false }: { href?: string; sobreBanda?: boolean }) {
  return (
    <Link href={href} className="group inline-flex items-center gap-2" aria-label={`${SITE.name}, inicio`}>
      <Image src="/marca/simbolo.png" alt="" width={202} height={112} priority className="h-7 w-auto" />
      <span className={`font-display text-2xl font-bold tracking-tight ${sobreBanda ? "text-on-banda group-hover:text-banda-enlace" : "text-foreground group-hover:text-primary"}`}>{SITE.name}</span>
    </Link>
  );
}
