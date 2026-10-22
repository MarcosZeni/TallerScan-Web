import type { Metadata } from "next";
import { sitioDelBuild } from "@/lib/sitio-build";
import { Tarifas } from "./components/tarifas";

export const metadata: Metadata = {
  title: "Precios",
  description: "Precios publicados: service, frenos, distribución, embrague, tren delantero y escaneo computarizado.",
};

export default async function Page() {
  return <Tarifas inicial={await sitioDelBuild()} />;
}
