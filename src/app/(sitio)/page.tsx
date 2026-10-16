import { sitioDelBuild } from "@/lib/sitio-build";
import { Inicio } from "./components/inicio";

export default async function Page() {
  return <Inicio inicial={await sitioDelBuild()} />;
}
