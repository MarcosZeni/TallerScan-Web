import type { Metadata } from "next";
import { Suspense } from "react";
import { Cargando } from "@/components/ui/aviso";
import { MiTurno } from "./components/mi-turno";

export const metadata: Metadata = { title: "Mi turno", robots: { index: false } };

export default function Page() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-2xl px-4"><Cargando /></div>}>
      <MiTurno />
    </Suspense>
  );
}
