"use client";

import { SITE } from "@/lib/site";
import { useSitio } from "@/lib/sitio";
import type { Sitio } from "@/lib/tipos";

/**
 * Política de privacidad, corta y en criollo (Ley 25.326 de Protección de
 * Datos Personales). Lo único que cambia es el email de contacto, que sale de
 * Ajustes; el resto describe lo que el sistema hace de verdad: si cambia el
 * sistema, cambiar esta página.
 */
export function Privacidad({ inicial }: { inicial: Sitio | null }) {
  const { sitio } = useSitio(inicial);
  const email = sitio?.taller.emailContacto || "";
  const contacto = email ? <a className="underline underline-offset-4" href={`mailto:${email}`}>{email}</a> : <>el email de contacto que figura en &quot;Dónde estamos&quot;</>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-4xl font-bold sm:text-5xl">Privacidad</h1>
      <p className="mt-4 text-lg text-muted">Qué guardamos cuando usás {SITE.name}, para qué y cómo pedir que lo borremos.</p>
      {/* Sin nombrar proveedores (emails, CDN): es infraestructura nuestra de cara al cliente. */}

      <div className="mt-8 space-y-8 text-lg leading-relaxed">
        <section>
          <h2 className="text-2xl font-bold">Qué datos guardamos</h2>
          <p className="mt-2">Solo lo que cargás al pedir un turno: tu nombre, tu WhatsApp, tu email, la patente, marca, modelo y año del auto, y lo que nos cuentes del problema. Nada más. No pedimos documento ni dirección.</p>
        </section>
        <section>
          <h2 className="text-2xl font-bold">Para qué los usamos</h2>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Para atender el turno: el mecánico recibe tus datos para confirmarlo y escribirte por WhatsApp.</li>
            <li>Para mandarte la confirmación y los avisos del turno por email.</li>
            <li>Para reconocer el auto si volvés (por ejemplo, para descontarte el escaneo si después hacés el arreglo con nosotros).</li>
          </ul>
          <p className="mt-2">No vendemos ni cedemos tus datos a nadie.</p>
        </section>
        <section>
          <h2 className="text-2xl font-bold">Cuánto tiempo</h2>
          <p className="mt-2">Dos años desde el último turno. Después se borran. Si nos lo pedís antes, los borramos antes.</p>
        </section>
        <section>
          <h2 className="text-2xl font-bold">Tus derechos</h2>
          <p className="mt-2">Podés pedirnos ver, corregir o borrar tus datos cuando quieras: escribinos a {contacto} desde el mismo email o WhatsApp con el que pediste el turno, y lo hacemos en la semana.</p>
          <p className="mt-2">Esto está regulado por la Ley 25.326. La Agencia de Acceso a la Información Pública (<a className="underline underline-offset-4" href="https://www.argentina.gob.ar/aaip" target="_blank" rel="noopener noreferrer">argentina.gob.ar/aaip</a>) es el organismo de control y atiende reclamos.</p>
        </section>
        <section>
          <h2 className="text-2xl font-bold">Cookies y estadísticas</h2>
          <p className="mt-2">No usamos cookies de seguimiento ni herramientas de terceros para medir visitas. Contamos las visitas nosotros, sin identificarte, y desde dónde llegaste (por ejemplo, desde Instagram). Es una métrica interna, para saber qué nos trae clientes. Tu navegador guarda, solo en tu teléfono o computadora, los códigos de tus últimos turnos para que &quot;Mi turno&quot; los encuentre rápido; podés borrarlos limpiando los datos del sitio.</p>
        </section>
      </div>
    </div>
  );
}
