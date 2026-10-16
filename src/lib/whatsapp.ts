// Links wa.me: gratis, abren el WhatsApp de quien toca con el texto armado.
// El número del taller viene de la configuración (API), nunca escrito acá.

export function linkWhatsApp(numero: string | null | undefined, texto: string): string | null {
  const n = (numero ?? "").replace(/\D/g, "");
  if (n.length < 10) return null;
  return `https://wa.me/${n}?text=${encodeURIComponent(texto)}`;
}
