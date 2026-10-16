import type { ComponentProps, ReactNode } from "react";

const control =
  "block w-full min-h-11 rounded-md border-2 border-border bg-surface px-3 py-2 text-base text-foreground placeholder:text-muted/70 focus:border-primary focus:outline-none aria-invalid:border-danger";

/** Etiqueta siempre visible arriba del campo, ayuda abajo, error en rojo con texto. */
export function Field({ label, htmlFor, ayuda, error, children }: {
  label: string;
  htmlFor: string;
  ayuda?: ReactNode;
  error?: string | null;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label htmlFor={htmlFor} className="block font-semibold">{label}</label>
      {children}
      {error ? <p className="text-sm font-medium text-danger">{error}</p> : ayuda ? <p className="text-sm text-muted">{ayuda}</p> : null}
    </div>
  );
}

export function Input({ className = "", ...props }: ComponentProps<"input">) {
  return <input className={`${control} ${className}`} {...props} />;
}

export function Select({ className = "", ...props }: ComponentProps<"select">) {
  return <select className={`${control} ${className}`} {...props} />;
}

export function Textarea({ className = "", ...props }: ComponentProps<"textarea">) {
  return <textarea className={`${control} min-h-24 ${className}`} {...props} />;
}
