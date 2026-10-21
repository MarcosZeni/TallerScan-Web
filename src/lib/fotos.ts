import { apiUrl } from "./api";

/** URL de la imagen. El id nunca cambia de contenido, así que el navegador y Cloudflare la guardan para siempre. */
export const urlFoto = (id: number) => apiUrl(`/api/v1/fotos/${id}`);

const LADO_MAYOR = 1600;
const CALIDAD = 0.82;

export type FotoAchicada = { blob: Blob; ancho: number; alto: number };

/**
 * Achica la foto en el navegador antes de subirla: las del iPhone pesan varios
 * MB (y a veces son HEIC) y el servidor tiene poca RAM y el disco justo. Se
 * dibuja en un canvas y sale JPEG de 1600 px de lado mayor.
 *
 * La orientación del iPhone (la foto "parada" se guarda acostada con una marca
 * EXIF) se respeta pidiéndole al navegador que la aplique al decodificar.
 * Safari decodifica HEIC al dibujar, por eso funciona con la cámara del iPhone.
 */
export async function achicarFoto(archivo: File): Promise<FotoAchicada> {
  const origen = await decodificar(archivo);
  try {
    const escala = Math.min(1, LADO_MAYOR / Math.max(origen.ancho, origen.alto));
    const ancho = Math.max(1, Math.round(origen.ancho * escala));
    const alto = Math.max(1, Math.round(origen.alto * escala));
    const canvas = document.createElement("canvas");
    canvas.width = ancho;
    canvas.height = alto;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Tu navegador no pudo preparar la foto.");
    // Fondo blanco: un PNG con transparencia saldría negro en JPEG.
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, ancho, alto);
    ctx.drawImage(origen.fuente, 0, 0, ancho, alto);
    const blob = await new Promise<Blob | null>((listo) => canvas.toBlob(listo, "image/jpeg", CALIDAD));
    if (!blob) throw new Error("No pudimos achicar la foto. Probá con otra.");
    return { blob, ancho, alto };
  } finally {
    origen.liberar();
  }
}

type Origen = { fuente: CanvasImageSource; ancho: number; alto: number; liberar: () => void };

async function decodificar(archivo: File): Promise<Origen> {
  try {
    const bmp = await createImageBitmap(archivo, { imageOrientation: "from-image" });
    return { fuente: bmp, ancho: bmp.width, alto: bmp.height, liberar: () => bmp.close() };
  } catch {
    // Navegadores sin createImageBitmap con opciones: un <img> también aplica la orientación EXIF.
    const url = URL.createObjectURL(archivo);
    try {
      const img = new Image();
      img.src = url;
      await img.decode();
      return { fuente: img, ancho: img.naturalWidth, alto: img.naturalHeight, liberar: () => URL.revokeObjectURL(url) };
    } catch {
      URL.revokeObjectURL(url);
      throw new Error("No pudimos abrir esa foto. Probá con otra (JPG, PNG o la de la cámara).");
    }
  }
}
