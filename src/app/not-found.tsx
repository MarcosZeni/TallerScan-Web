import { Marca } from "@/components/marca";
import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <Marca />
      <h1 className="mt-8 text-4xl font-bold">Esta página no existe</h1>
      <p className="mt-3 text-muted">Puede que el link esté mal copiado.</p>
      <div className="mt-6 flex gap-3">
        <ButtonLink href="/" variante="primario">Ir al inicio</ButtonLink>
        <ButtonLink href="/turnos" variante="secundario">Pedir turno</ButtonLink>
      </div>
    </div>
  );
}
