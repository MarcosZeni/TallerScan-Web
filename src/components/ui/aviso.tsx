import type { ReactNode } from "react";

type Tipo = "info" | "ok" | "atencion" | "error";

const estilos: Record<Tipo, string> = {
  info: "border-primary bg-primary-soft",
  ok: "border-success bg-success-soft",
  atencion: "border-warning bg-warning-soft",
  error: "border-danger bg-danger-soft",
};

/** Mensaje con borde a la izquierda. El texto dice qué pasa: el color solo refuerza. */
export function Aviso({ tipo = "info", titulo, children }: { tipo?: Tipo; titulo?: string; children?: ReactNode }) {
  return (
    <div role={tipo === "error" ? "alert" : "status"} className={`rounded-md border-l-4 px-4 py-3 ${estilos[tipo]}`}>
      {titulo && <p className="font-semibold">{titulo}</p>}
      {children && <div className={titulo ? "mt-1" : ""}>{children}</div>}
    </div>
  );
}

export function Cargando({ texto = "Cargando…" }: { texto?: string }) {
  return <p className="py-6 text-muted" aria-live="polite">{texto}</p>;
}

/** Estado del turno escrito con palabras; el color acompaña. */
export function Etiqueta({ children, tono = "neutro" }: { children: ReactNode; tono?: "neutro" | "ok" | "atencion" | "error" | "info" }) {
  const t = {
    neutro: "bg-background text-muted border-border",
    ok: "bg-success-soft text-success border-success/40",
    atencion: "bg-warning-soft text-warning border-warning/40",
    error: "bg-danger-soft text-danger border-danger/40",
    info: "bg-primary-soft text-primary border-primary/40",
  }[tono];
  return <span className={`inline-flex items-center rounded border px-2 py-0.5 text-sm font-semibold ${t}`}>{children}</span>;
}

export function tonoEstado(estado: string): "neutro" | "ok" | "atencion" | "error" | "info" {
  if (estado === "confirmado" || estado === "realizado") return "ok";
  if (estado === "pendiente") return "atencion";
  if (estado === "rechazado" || estado === "liberado" || estado === "cancelado") return "error";
  return "neutro";
}
