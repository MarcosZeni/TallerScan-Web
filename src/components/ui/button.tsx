import Link from "next/link";
import type { ComponentProps } from "react";

type Variante = "accion" | "primario" | "secundario" | "fantasma" | "peligro" | "banda";

const base =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 py-2 text-base font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-55";

const variantes: Record<Variante, string> = {
  // Amarillo de seguridad: UNA por pantalla (pedir turno, guardar lo principal).
  accion: "bg-accent text-on-accent hover:bg-accent-hover",
  primario: "bg-primary text-on-primary hover:bg-primary-hover",
  secundario: "border-2 border-primary text-primary hover:bg-primary-soft",
  fantasma: "text-primary hover:bg-primary-soft",
  peligro: "border-2 border-danger text-danger hover:bg-danger-soft",
  // Secundario puesto sobre la banda (encabezado, portada): se lee en cualquier paleta.
  banda: "border-2 border-banda-enlace text-banda-enlace hover:bg-banda-hover",
};

export function Button({ variante = "primario", className = "", ...props }: ComponentProps<"button"> & { variante?: Variante }) {
  return <button type="button" className={`${base} ${variantes[variante]} ${className}`} {...props} />;
}

export function ButtonLink({ variante = "primario", className = "", ...props }: ComponentProps<typeof Link> & { variante?: Variante }) {
  return <Link className={`${base} ${variantes[variante]} ${className}`} {...props} />;
}

/** Link externo con forma de botón (WhatsApp, mapa). */
export function ButtonA({ variante = "primario", className = "", ...props }: ComponentProps<"a"> & { variante?: Variante }) {
  return <a className={`${base} ${variantes[variante]} ${className}`} target="_blank" rel="noopener noreferrer" {...props} />;
}
