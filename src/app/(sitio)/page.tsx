import { DatosEstructurados } from "@/components/datos-estructurados";
import { sitioDelBuild } from "@/lib/sitio-build";
import { Inicio } from "./components/inicio";

export default async function Page() {
  const inicial = await sitioDelBuild();
  return (
    <>
      <DatosEstructurados sitio={inicial} />
      <Inicio inicial={inicial} />
    </>
  );
}
