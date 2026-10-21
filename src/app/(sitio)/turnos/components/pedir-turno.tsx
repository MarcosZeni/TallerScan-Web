"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Aviso, Cargando } from "@/components/ui/aviso";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { ApiError, api, mensajeDe } from "@/lib/api";
import { capturarOrigen, registrarVisita } from "@/lib/atribucion";
import { fechaCorta, fechaLarga, formatoPesos, hora, horaCorta, rangoPesos } from "@/lib/format";
import { useSitio } from "@/lib/sitio";
import type { Disponibilidad, Opcion, Sitio } from "@/lib/tipos";
import { SelectorOpciones } from "@/components/selector-opciones";
import { guardarCodigo } from "@/lib/mis-turnos";
import { useDatos } from "@/lib/use-datos";

type Paso = 1 | 2 | 3;

const CONOCIO = [
  ["", "Elegí una opción"],
  ["instagram", "Instagram"],
  ["facebook", "Facebook"],
  ["tiktok", "TikTok"],
  ["google", "Google"],
  ["recomendacion", "Me lo recomendaron"],
  ["paso", "Pasé por el taller"],
  ["otro", "Otro"],
] as const;

export function PedirTurno({ inicial }: { inicial: Sitio | null }) {
  const { sitio, error: errorSitio } = useSitio(inicial);
  const params = useSearchParams();

  const [paso, setPaso] = useState<Paso>(1);
  const [elegidos, setElegidos] = useState<number[]>(() => {
    const s = Number(params.get("s"));
    return Number.isInteger(s) && s > 0 ? [s] : [];
  });
  const [conOtro, setConOtro] = useState(false);
  const [otro, setOtro] = useState("");

  // Horarios: se piden al llegar al paso 2 (y se vuelven a pedir si vuelve: pueden haberse ocupado).
  const { datos: disp, error: errorDisp, recargar: recargarDisp } = useDatos<Disponibilidad>(paso >= 2 ? "/api/v1/disponibilidad" : null);
  const [tipoElegido, setTipo] = useState<"hoy" | "dia" | null>(null);
  // Si hoy no hay lugar, arranca en "Otro día" hasta que la persona elija.
  const tipo = tipoElegido ?? (disp && disp.hoy.bloques.length === 0 ? "dia" : "hoy");
  const [bloqueId, setBloqueId] = useState<number | null>(null);
  const [opciones, setOpciones] = useState<Opcion[]>([]);
  // Antes de la hora de reserva (8:30) los horarios de hoy se ven pero no se toman: hoy se
  // pide como un día más del turno express, por la mañana o por la tarde, y se confirma después.
  const solicitud = disp?.hoy.soloSolicitud === true;
  const tipoEnvio: "hoy" | "dia" = tipo === "hoy" && !solicitud ? "hoy" : "dia";

  const [datos, setDatos] = useState({ nombre: "", whatsapp: "", email: "", marca: "", modelo: "", anio: "", patente: "", descripcion: "", conocio: "" });
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<{ mensaje: string; campo?: string | null } | null>(null);
  const [listo, setListo] = useState<{ id: number; codigo: string } | null>(null);

  useEffect(() => registrarVisita("turnos"), []);

  const servicios = useMemo(() => sitio?.servicios ?? [], [sitio]);
  const seleccion = servicios.filter((s) => elegidos.includes(s.id));
  const totalMin = seleccion.reduce((a, s) => a + s.precioMin, 0);
  const totalMax = seleccion.reduce((a, s) => a + s.precioMax, 0);

  const grupos = useMemo(() => {
    const m = new Map<string, typeof servicios>();
    for (const s of servicios) m.set(s.categoria, [...(m.get(s.categoria) ?? []), s]);
    return [...m];
  }, [servicios]);

  const toggle = (id: number) => setElegidos((e) => (e.includes(id) ? e.filter((x) => x !== id) : [...e, id]));
  const set = (k: keyof typeof datos) => (e: { target: { value: string } }) => setDatos((d) => ({ ...d, [k]: e.target.value }));

  const paso1Ok = elegidos.length > 0 || (conOtro && otro.trim().length >= 2);
  const paso2Ok = tipoEnvio === "hoy" ? bloqueId !== null : opciones.length > 0;

  async function enviar(ev: React.FormEvent) {
    ev.preventDefault();
    setEnviando(true);
    setError(null);
    const { origen, campania } = capturarOrigen();
    try {
      const r = await api<{ id: number; codigo: string }>("/api/v1/turnos", {
        method: "POST",
        json: {
          tipo: tipoEnvio,
          bloqueId: tipoEnvio === "hoy" ? bloqueId : null,
          opciones: tipoEnvio === "dia" ? opciones : null,
          servicios: elegidos,
          otro: conOtro ? otro : null,
          ...datos,
          anio: Number(datos.anio) || null,
          conocio: datos.conocio || null,
          origen,
          campania,
        },
      });
      guardarCodigo(r.id, r.codigo);
      setListo(r);
      window.scrollTo({ top: 0 });
    } catch (e) {
      const campo = e instanceof ApiError ? e.campo : null;
      // Un horario que se ocupó mientras completaba: volver a elegir.
      if (e instanceof ApiError && (e.codigo === "horario_lleno" || e.codigo === "horario_no_disponible" || e.codigo === "hoy_solo_solicitud" || e.codigo === "hoy_cerrado")) {
        setBloqueId(null);
        setPaso(2);
        recargarDisp();
      }
      if (campo === "servicios" || campo === "otro") setPaso(1);
      setError({ mensaje: mensajeDe(e), campo });
    } finally {
      setEnviando(false);
    }
  }

  if (listo) {
    const cuando = tipoEnvio === "hoy"
      ? `hoy a las ${hora(disp?.hoy.bloques.find((b) => b.id === bloqueId)?.inicio)}`
      : null;
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="text-4xl font-bold">Pedido enviado</h1>
        <p className="mt-3 text-lg">
          {cuando ? <>Pediste turno para {cuando}. En unos minutos te confirmamos.</> : <>Recibimos los días que podés. Elegimos uno y te escribimos por WhatsApp con el día y la hora.</>}
        </p>
        <p className="mt-2 text-muted">Te mandamos un email a {datos.email} con el link para ver o cancelar el turno.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href={`/mi-turno?c=${encodeURIComponent(listo.codigo)}`} variante="primario">Ver mi turno</ButtonLink>
          <ButtonLink href="/" variante="fantasma">Volver al inicio</ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-4xl font-bold sm:text-5xl">Pedir turno</h1>
      <ol className="mt-4 flex gap-2 text-sm font-semibold" aria-label="Pasos">
        {["Qué necesitás", "Cuándo", "Tus datos"].map((t, i) => (
          <li key={t} aria-current={paso === i + 1 ? "step" : undefined}
            className={`flex-1 border-t-4 pt-1 ${paso >= i + 1 ? "border-primary text-foreground" : "border-border text-muted"}`}>
            {i + 1}. {t}
          </li>
        ))}
      </ol>

      {error && <div className="mt-6"><Aviso tipo="error">{error.mensaje}</Aviso></div>}

      {/* ---- Paso 1 -------------------------------------------------------- */}
      {paso === 1 && (
        <section className="mt-8">
          <h2 className="text-2xl font-bold">¿Qué necesita el auto?</h2>
          <p className="text-muted">Podés elegir más de uno. Precios de mano de obra, sin repuestos.</p>
          {!sitio && (errorSitio ? <Aviso tipo="error">No pudimos cargar los servicios. Recargá la página.</Aviso> : <Cargando />)}
          <div className="mt-4 space-y-6">
            {grupos.map(([cat, lista]) => (
              <fieldset key={cat}>
                <legend className="mb-2 font-display text-xl font-bold">{cat}</legend>
                <div className="space-y-2">
                  {lista.map((s) => (
                    <label key={s.id} className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-md border-2 px-3 py-2 ${elegidos.includes(s.id) ? "border-primary bg-primary-soft" : "border-border bg-surface"}`}>
                      <input type="checkbox" className="size-5 accent-[var(--color-primary)]" checked={elegidos.includes(s.id)} onChange={() => toggle(s.id)} />
                      <span className="flex-1">{s.nombre}</span>
                      <span className="tabular whitespace-nowrap font-semibold">{rangoPesos(s.precioMin, s.precioMax)}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}
            {sitio && (
              <div>
                <label className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-md border-2 px-3 py-2 ${conOtro ? "border-primary bg-primary-soft" : "border-border bg-surface"}`}>
                  <input type="checkbox" className="size-5 accent-[var(--color-primary)]" checked={conOtro} onChange={(e) => setConOtro(e.target.checked)} />
                  <span className="flex-1">Otro / no sé qué tiene</span>
                </label>
                {conOtro && (
                  <div className="mt-3">
                    <Field label="Contanos qué le pasa al auto" htmlFor="otro" error={error?.campo === "otro" ? error.mensaje : null}>
                      <Input id="otro" value={otro} onChange={(e) => setOtro(e.target.value)} maxLength={300} placeholder="Por ejemplo: hace ruido al frenar" />
                    </Field>
                  </div>
                )}
              </div>
            )}
          </div>
          <BarraPaso
            resumen={seleccion.length > 0 ? `Estimado: ${rangoPesos(totalMin, totalMax)}` : conOtro ? "Lo cotizamos al revisarlo" : "Elegí al menos uno"}
            siguiente={() => { setPaso(2); recargarDisp(); }} habilitado={paso1Ok} />
        </section>
      )}

      {/* ---- Paso 2 -------------------------------------------------------- */}
      {paso === 2 && (
        <section className="mt-8">
          <h2 className="text-2xl font-bold">¿Cuándo te queda bien?</h2>
          {errorDisp && <Aviso tipo="error">{errorDisp}</Aviso>}
          {!disp && !errorDisp && <Cargando texto="Buscando horarios…" />}
          {disp && (
            <>
              <div role="tablist" className="mt-4 grid grid-cols-2 gap-2">
                {(["hoy", "dia"] as const).map((t) => (
                  <button key={t} role="tab" aria-selected={tipo === t} onClick={() => setTipo(t)}
                    className={`min-h-12 rounded-md border-2 font-semibold ${tipo === t ? "border-primary bg-primary text-on-primary" : "border-border bg-surface"}`}>
                    {t === "hoy" ? "Hoy" : "Elegir días"}
                  </button>
                ))}
              </div>

              {tipo === "hoy" ? (
                <div className="mt-5">
                  {disp.hoy.estado === "sin_abrir" && (
                    <Aviso tipo="atencion" titulo="Los turnos del día se habilitan de 9 a 18 h">Según la disponibilidad del mecánico. Probá en un rato, o tocá &quot;Elegir días&quot; y marcá cuándo podés.</Aviso>
                  )}
                  {disp.hoy.estado === "cerrada" && <Aviso tipo="atencion" titulo="Hoy no hay turnos">Tocá &quot;Elegir días&quot; y marcá cuándo podés.</Aviso>}
                  {disp.hoy.estado === "abierta" && disp.hoy.bloques.length === 0 && (
                    <Aviso tipo="atencion" titulo="No quedan horarios libres hoy">Tocá &quot;Elegir días&quot; y marcá cuándo podés.</Aviso>
                  )}
                  {disp.hoy.bloques.length > 0 && solicitud && (
                    <>
                      <Aviso titulo={`Desde las ${horaCorta(disp.hoy.reservaDesde)} se pueden tomar directo.`}>
                        Ahora podés solicitarlo y el mecánico te confirma por WhatsApp.
                      </Aviso>
                      <p className="mb-3 mt-5 text-muted">Horarios de hoy, {fechaLarga(disp.hoy.fecha)} (todavía no se pueden tomar):</p>
                      <ul className="grid grid-cols-3 gap-2 sm:grid-cols-5" aria-label="Horarios de hoy, solo para ver">
                        {disp.hoy.bloques.map((b) => (
                          <li key={b.id} className="tabular flex min-h-12 items-center justify-center rounded-md border-2 border-border bg-background font-display text-xl font-bold text-muted">
                            {hora(b.inicio)}
                          </li>
                        ))}
                      </ul>
                      <p className="mb-3 mt-6 font-semibold">¿Te sirve hoy? Elegí mañana o tarde y lo solicitás:</p>
                      <SelectorOpciones disp={{ ...disp, dias: disp.dias.filter((d) => d.fecha === disp.hoy.fecha) }} valor={opciones} onChange={setOpciones} />
                      <p className="mt-4 text-muted">Si preferís otro día, tocá &quot;Elegir días&quot; y marcá cuándo podés.</p>
                    </>
                  )}
                  {disp.hoy.bloques.length > 0 && !solicitud && (
                    <>
                      <p className="mb-3 text-muted">Horarios libres para hoy, {fechaLarga(disp.hoy.fecha)}:</p>
                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                        {disp.hoy.bloques.map((b) => (
                          <button key={b.id} onClick={() => setBloqueId(b.id)} aria-pressed={bloqueId === b.id}
                            className={`tabular min-h-12 rounded-md border-2 font-display text-xl font-bold ${bloqueId === b.id ? "border-primary bg-primary text-on-primary" : "border-border bg-surface hover:border-primary"}`}>
                            {hora(b.inicio)}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="mt-5">
                  <p className="mb-3">Marcá los días y horarios en que podés traer el auto. Elegimos uno y te confirmamos por WhatsApp.</p>
                  <SelectorOpciones disp={disp} valor={opciones} onChange={setOpciones} />
                </div>
              )}
            </>
          )}
          <BarraPaso volver={() => setPaso(1)} siguiente={() => setPaso(3)} habilitado={paso2Ok} resumen={null} />
        </section>
      )}

      {/* ---- Paso 3 -------------------------------------------------------- */}
      {paso === 3 && (
        <form className="mt-8 space-y-5" onSubmit={enviar} noValidate>
          <h2 className="text-2xl font-bold">Tus datos y los del auto</h2>
          {(() => {
            const e = (c: string) => (error?.campo === c ? error.mensaje : null);
            return (
              <>
                <Field label="Nombre" htmlFor="nombre" error={e("nombre")}>
                  <Input id="nombre" autoComplete="name" value={datos.nombre} onChange={set("nombre")} aria-invalid={!!e("nombre")} required />
                </Field>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="WhatsApp" htmlFor="whatsapp" ayuda="Con característica, sin el 15. Ej.: 11 2233 4455" error={e("whatsapp")}>
                    <Input id="whatsapp" type="tel" inputMode="tel" autoComplete="tel" value={datos.whatsapp} onChange={set("whatsapp")} aria-invalid={!!e("whatsapp")} required />
                  </Field>
                  <Field label="Email" htmlFor="email" ayuda="Te mandamos la confirmación." error={e("email")}>
                    <Input id="email" type="email" inputMode="email" autoComplete="email" value={datos.email} onChange={set("email")} aria-invalid={!!e("email")} required />
                  </Field>
                </div>
                <div className="grid gap-5 sm:grid-cols-3">
                  <Field label="Marca" htmlFor="marca" error={e("marca")}>
                    <Input id="marca" value={datos.marca} onChange={set("marca")} placeholder="Fiat" aria-invalid={!!e("marca")} required />
                  </Field>
                  <Field label="Modelo" htmlFor="modelo" error={e("modelo")}>
                    <Input id="modelo" value={datos.modelo} onChange={set("modelo")} placeholder="Palio" aria-invalid={!!e("modelo")} required />
                  </Field>
                  <Field label="Año" htmlFor="anio" error={e("anio")}>
                    <Input id="anio" inputMode="numeric" maxLength={4} value={datos.anio} onChange={set("anio")} placeholder="2015" aria-invalid={!!e("anio")} required />
                  </Field>
                </div>
                <Field label="Patente" htmlFor="patente" error={e("patente")}>
                  <Input id="patente" autoCapitalize="characters" value={datos.patente} onChange={set("patente")} placeholder="AB123CD" className="uppercase" aria-invalid={!!e("patente")} required />
                </Field>
                <Field label="¿Qué le pasa al auto? (opcional)" htmlFor="descripcion" error={e("descripcion")}>
                  <Textarea id="descripcion" value={datos.descripcion} onChange={set("descripcion")} maxLength={1000} />
                </Field>
                <Field label="¿Cómo nos conociste? (opcional)" htmlFor="conocio">
                  <Select id="conocio" value={datos.conocio} onChange={set("conocio")}>
                    {CONOCIO.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
                  </Select>
                </Field>
              </>
            );
          })()}

          <div className="rounded-md border-2 border-border bg-surface p-4">
            <p className="font-semibold">Resumen</p>
            <p>{[...seleccion.map((s) => s.nombre), ...(conOtro && otro ? [`Otro: ${otro}`] : [])].join(", ")}</p>
            {seleccion.length > 0 && <p className="tabular">Mano de obra estimada: {rangoPesos(totalMin, totalMax)}</p>}
            <p className="text-muted">
              {tipoEnvio === "hoy"
                ? `Hoy a las ${hora(disp?.hoy.bloques.find((b) => b.id === bloqueId)?.inicio)}`
                : `Podés: ${opciones.map((o) => `${fechaCorta(o.fecha)} ${o.franja === "manana" ? "a la mañana" : "a la tarde"}`).join(", ")}`}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button variante="fantasma" onClick={() => { setPaso(2); recargarDisp(); }} className="-ml-4">Volver</Button>
            <Button type="submit" variante="accion" disabled={enviando} className="px-8 text-lg">
              {enviando ? "Enviando…" : "Pedir turno"}
            </Button>
          </div>
          <p className="text-sm text-muted">
            ¿Ya pediste uno? <Link href="/mi-turno" className="underline">Ver mi turno</Link>. El escaneo cuesta {formatoPesos(sitio?.escaneoPrecio || 20000)} y se descuenta si hacés el arreglo con nosotros.
          </p>
        </form>
      )}
    </div>
  );
}

function BarraPaso({ resumen, volver, siguiente, habilitado }: { resumen: string | null; volver?: () => void; siguiente: () => void; habilitado: boolean }) {
  return (
    <div className="sticky bottom-0 -mx-4 mt-8 flex items-center justify-between gap-3 border-t border-border bg-background/95 px-4 py-3 backdrop-blur">
      {volver ? <Button variante="fantasma" onClick={volver} className="-ml-4">Volver</Button> : <span className="tabular font-semibold">{resumen}</span>}
      <Button variante="primario" onClick={() => { siguiente(); window.scrollTo({ top: 0 }); }} disabled={!habilitado} className="px-8">Siguiente</Button>
    </div>
  );
}
