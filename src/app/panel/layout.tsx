import type { Metadata } from "next";
import { SesionProvider } from "@/lib/sesion";
import { NavPanel } from "./components/nav-panel";

export const metadata: Metadata = { title: "Panel", robots: { index: false } };

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <SesionProvider>
      <div className="min-h-dvh pb-20 sm:pb-0">
        <NavPanel />
        <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
      </div>
    </SesionProvider>
  );
}
