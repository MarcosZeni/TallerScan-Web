"use client";

import { useEffect, useRef, useState } from "react";
import { Aviso, Cargando } from "@/components/ui/aviso";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { api, mensajeDe } from "@/lib/api";
import { achicarFoto, urlFoto } from "@/lib/fotos";
import { siVencio } from "@/lib/sesion";
import type { Foto } from "@/lib/tipos";

const MAXIMO = 20;

/**
 * Fotos de la página "Nosotros". Las ve y edita cualquier admin (Luca las sube
 * sin ser dueño). Cada foto se achica en el navegador antes de subir.
 */
export function FotosTaller() {
  const [fotos, setFotos] = useState<Foto[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [texto, setTexto] = useState("");
  const [borrando, setBorrando] = useState<number | null>(null);
  const entrada = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api<Foto[]>("/api/v1/admin/fotos").then(setFotos).catch((e) => { if (!siVencio(e)) setError(mensajeDe(e)); });
  }, []);

  /** Corre una acción dejando el mensaje de error o de listo. */
  async function correr(accion: () => Promise<void>, listo?: string) {
    setOcupado(true);
    setError(null);
    setOk(null);
    try {
      await accion();
      if (listo) setOk(listo);
    } catch (e) {
      if (!siVencio(e)) setError(mensajeDe(e));
    } finally {
      setOcupado(false);
    }
  }

  async function subir(archivo: File) {
    await correr(async () => {
      const { blob, ancho, alto } = await achicarFoto(archivo);
      const fd = new FormData();
      fd.set("archivo", blob, "foto.jpg");
      fd.set("ancho", String(ancho));
      fd.set("alto", String(alto));
      fd.set("texto", texto);
      setFotos(await api<Foto[]>("/api/v1/admin/fotos", { method: "POST", body: fd }));
      setTexto("");
    }, "Foto subida. Ya se ve en la página Nosotros.");
    // Se vacía el campo para poder elegir la misma foto de nuevo si hizo falta.
    if (entrada.current) entrada.current.value = "";
  }

  const mover = (i: number, d: -1 | 1) => correr(async () => {
    if (!fotos) return;
    const ids = fotos.map((f) => f.id);
    [ids[i], ids[i + d]] = [ids[i + d], ids[i]];
    setFotos(await api<Foto[]>("/api/v1/admin/fotos/orden", { method: "PUT", json: { ids } }));
  });

  const borrar = (id: number) => correr(async () => {
    await api(`/api/v1/admin/fotos/${id}`, { method: "DELETE" });
    setFotos((fs) => (fs ?? []).filter((f) => f.id !== id));
    setBorrando(null);
  }, "Foto borrada.");

  const guardarTexto = (id: number, t: string) => correr(async () => {
    setFotos(await api<Foto[]>(`/api/v1/admin/fotos/${id}`, { method: "PUT", json: { texto: t } }));
  }, "Texto guardado.");

  const lleno = (fotos?.length ?? 0) >= MAXIMO;

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold">Fotos del taller</h2>
      <p className="text-muted">Se ven en la página &quot;Nosotros&quot;. Se achican solas antes de subir, así que podés elegir de la galería o sacar una con la cámara. Hasta {MAXIMO} fotos.</p>

      {error && <Aviso tipo="error">{error}</Aviso>}
      {ok && <Aviso tipo="ok">{ok}</Aviso>}

      <div className="space-y-3 rounded-md border-2 border-border bg-surface p-4">
        <Field label="Texto de la foto (opcional)" htmlFor="foto-texto" ayuda="Una frase corta. Escribila antes de elegir la foto; después se puede cambiar.">
          <Input id="foto-texto" maxLength={80} value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Ej.: El taller por dentro" disabled={ocupado} />
        </Field>
        <Field label="Elegir foto" htmlFor="foto-archivo" ayuda={lleno ? `Ya hay ${MAXIMO} fotos: borrá alguna para subir otra.` : "Al elegirla se sube sola."}>
          <Input
            id="foto-archivo"
            ref={entrada}
            type="file"
            accept="image/*"
            disabled={ocupado || lleno}
            className="py-1.5"
            onChange={(e) => { const a = e.target.files?.[0]; if (a) void subir(a); }}
          />
        </Field>
        {ocupado && <p className="text-muted" aria-live="polite">Procesando…</p>}
      </div>

      {!fotos && !error ? <Cargando /> : fotos && fotos.length === 0 ? (
        <p className="text-muted">Todavía no hay fotos. La página Nosotros muestra solo el texto.</p>
      ) : (
        <ul className="space-y-4">
          {fotos?.map((f, i) => (
            <FilaFoto
              key={f.id}
              foto={f}
              primera={i === 0}
              ultima={i === fotos.length - 1}
              ocupado={ocupado}
              confirmando={borrando === f.id}
              onMover={(d) => mover(i, d)}
              onGuardarTexto={(t) => guardarTexto(f.id, t)}
              onPedirBorrar={() => setBorrando(f.id)}
              onCancelarBorrar={() => setBorrando(null)}
              onBorrar={() => borrar(f.id)}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function FilaFoto({ foto, primera, ultima, ocupado, confirmando, onMover, onGuardarTexto, onPedirBorrar, onCancelarBorrar, onBorrar }: {
  foto: Foto;
  primera: boolean;
  ultima: boolean;
  ocupado: boolean;
  confirmando: boolean;
  onMover: (d: -1 | 1) => void;
  onGuardarTexto: (t: string) => void;
  onPedirBorrar: () => void;
  onCancelarBorrar: () => void;
  onBorrar: () => void;
}) {
  const [t, setT] = useState(foto.texto ?? "");
  return (
    <li className="rounded-md border-2 border-border bg-surface p-3">
      <div className="flex gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element -- export estático: sin optimizador de imágenes */}
        <img src={urlFoto(foto.id)} alt={foto.texto ?? ""} width={foto.ancho} height={foto.alto} loading="lazy" className="h-24 w-24 shrink-0 rounded-md object-cover" />
        <div className="min-w-0 flex-1">
          <Field label="Texto" htmlFor={`ft-${foto.id}`}>
            <Input id={`ft-${foto.id}`} maxLength={80} value={t} onChange={(e) => setT(e.target.value)} />
          </Field>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button variante="primario" disabled={ocupado || t.trim() === (foto.texto ?? "")} onClick={() => onGuardarTexto(t)}>Guardar texto</Button>
        <Button variante="secundario" disabled={ocupado || primera} onClick={() => onMover(-1)} aria-label="Subir esta foto en la lista">Subir</Button>
        <Button variante="secundario" disabled={ocupado || ultima} onClick={() => onMover(1)} aria-label="Bajar esta foto en la lista">Bajar</Button>
        <Button variante="fantasma" disabled={ocupado} onClick={onPedirBorrar}>Borrar</Button>
      </div>
      {confirmando && (
        <div className="mt-3">
          <Aviso tipo="atencion" titulo="¿Borrar esta foto?">Deja de verse en la página Nosotros.
            <div className="mt-3 flex gap-3">
              <Button variante="peligro" disabled={ocupado} onClick={onBorrar}>Sí, borrar</Button>
              <Button variante="fantasma" onClick={onCancelarBorrar}>No</Button>
            </div>
          </Aviso>
        </div>
      )}
    </li>
  );
}
