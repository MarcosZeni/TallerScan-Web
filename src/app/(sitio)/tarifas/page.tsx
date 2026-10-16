import type { Metadata } from "next";
import { sitioDelBuild } from "@/lib/sitio-build";
import { Tarifas } from "./components/tarifas";

export const metadata: Metadata = {
  title: "Precios de mano de obra",
  description: "Tarifario de mano de obra: service, frenos, distribución, embrague, tren delantero y escaneo computarizado.",
};

export default async function Page() {
  return <Tarifas inicial={await sitioDelBuild()} />;
}
