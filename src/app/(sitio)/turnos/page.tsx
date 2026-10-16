import type { Metadata } from "next";
import { Suspense } from "react";
import { Cargando } from "@/components/ui/aviso";
import { sitioDelBuild } from "@/lib/sitio-build";
import { PedirTurno } from "./components/pedir-turno";

export const metadata: Metadata = { title: "Pedir turno" };

export default async function Page() {
  const inicial = await sitioDelBuild();
  // useSearchParams (?s=servicio) necesita Suspense en un sitio estático.
  return (
    <Suspense fallback={<div className="mx-auto max-w-3xl px-4"><Cargando /></div>}>
      <PedirTurno inicial={inicial} />
    </Suspense>
  );
}
