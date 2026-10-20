import type { Metadata } from "next";
import { sitioDelBuild } from "@/lib/sitio-build";
import { Privacidad } from "./components/privacidad";

export const metadata: Metadata = {
  title: "Privacidad",
  description: "Qué datos guardamos cuando pedís un turno, para qué, por cuánto tiempo y cómo pedir que los borremos.",
};

export default async function Page() {
  return <Privacidad inicial={await sitioDelBuild()} />;
}
