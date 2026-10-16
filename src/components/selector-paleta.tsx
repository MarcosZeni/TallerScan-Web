"use client";

import { useState, useSyncExternalStore } from "react";

// Comparador de paletas para elegir el fondo del sitio. Solo aparece si se
// compiló con NEXT_PUBLIC_MOSTRAR_PALETAS=1 (desarrollo). La elección se guarda
// en este navegador; la paleta por defecto de todos sale de NEXT_PUBLIC_PALETA.

export const PALETAS = [
  { id: "blanco", nombre: "Blanco" },
  { id: "cemento", nombre: "Cemento" },
  { id: "plano", nombre: "Azul de plano" },
  { id: "franjas", nombre: "Franjas azul noche" },
  { id: "oscuro", nombre: "Oscuro de taller" },
] as const;

export const PALETA_POR_DEFECTO = process.env.NEXT_PUBLIC_PALETA || "blanco";
export const CLAVE_PALETA = "ts_paleta";

/**
 * Script que corre ANTES de pintar (va en el <head>): pone data-paleta en
 * <html> con la elección guardada o la de por defecto. Sin esto la página
 * aparecería un instante con otra paleta.
 */
export const scriptPaleta = `(function(){try{var p=${process.env.NEXT_PUBLIC_MOSTRAR_PALETAS === "1" ? `localStorage.getItem("${CLAVE_PALETA}")||` : ""}"${PALETA_POR_DEFECTO}";if(p!=="blanco")document.documentElement.dataset.paleta=p}catch(e){}})();`;

const leer = () => document.documentElement.dataset.paleta || "blanco";
const suscribir = (cb: () => void) => {
  const obs = new MutationObserver(cb);
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-paleta"] });
  return () => obs.disconnect();
};

/** Cambia la paleta de la página (el atributo de <html>) y la recuerda en este navegador. */
function aplicarPaleta(id: string) {
  const html = document.documentElement;
  if (id === "blanco") delete html.dataset.paleta;
  else html.dataset.paleta = id;
  try {
    localStorage.setItem(CLAVE_PALETA, id);
  } catch {
    /* sin almacenamiento: vale para esta pestaña */
  }
}

export function SelectorPaleta() {
  const actual = useSyncExternalStore(suscribir, leer, () => PALETA_POR_DEFECTO);
  const [abierto, setAbierto] = useState(false);
  if (process.env.NEXT_PUBLIC_MOSTRAR_PALETAS !== "1") return null;

  const elegir = aplicarPaleta;

  return (
    <div className="fixed bottom-20 left-3 z-50 sm:bottom-4">
      {abierto && (
        <div className="mb-2 w-56 rounded-md border-2 border-border bg-surface p-2 text-foreground shadow-lg">
          <p className="px-2 pb-1 text-sm font-semibold text-muted">Paleta (solo en desarrollo)</p>
          {PALETAS.map((p) => (
            <button key={p.id} type="button" onClick={() => elegir(p.id)} aria-pressed={actual === p.id}
              className={`block w-full rounded px-2 py-2 text-left font-medium ${actual === p.id ? "bg-primary text-on-primary" : "hover:bg-primary-soft"}`}>
              {p.nombre}
            </button>
          ))}
        </div>
      )}
      <button type="button" onClick={() => setAbierto(!abierto)}
        className="min-h-11 rounded-full border-2 border-foreground bg-accent px-4 font-semibold text-on-accent shadow-lg">
        {abierto ? "Cerrar" : `Paleta: ${PALETAS.find((p) => p.id === actual)?.nombre ?? actual}`}
      </button>
    </div>
  );
}
