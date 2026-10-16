import type { Metadata } from "next";
import { Suspense } from "react";
import { Ingresar } from "./components/ingresar";

export const metadata: Metadata = { title: "Ingresar", robots: { index: false } };

export default function Page() {
  return (
    <Suspense>
      <Ingresar />
    </Suspense>
  );
}
