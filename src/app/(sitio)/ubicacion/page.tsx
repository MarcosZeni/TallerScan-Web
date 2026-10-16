import type { Metadata } from "next";
import { sitioDelBuild } from "@/lib/sitio-build";
import { Ubicacion } from "./components/ubicacion";

export const metadata: Metadata = { title: "Dónde estamos y horarios" };

export default async function Page() {
  return <Ubicacion inicial={await sitioDelBuild()} />;
}
