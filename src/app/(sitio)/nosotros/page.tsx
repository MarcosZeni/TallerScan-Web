import type { Metadata } from "next";
import { sitioDelBuild } from "@/lib/sitio-build";
import { Nosotros } from "./components/nosotros";

export const metadata: Metadata = {
  title: "Nosotros",
  description: "Quiénes somos y cómo trabajamos: escaneo computarizado, precio publicado antes de empezar y turnos online.",
};

export default async function Page() {
  return <Nosotros inicial={await sitioDelBuild()} />;
}
