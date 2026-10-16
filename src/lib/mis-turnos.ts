// Códigos de los turnos pedidos desde este navegador, para que /mi-turno los
// muestre sin tener que buscar el email. Solo comodidad: el link del email
// funciona igual en cualquier dispositivo.

const CLAVE = "ts_mis_turnos";

export type Guardado = { id: number; codigo: string; guardado: number };

export function misTurnos(): Guardado[] {
  try {
    return JSON.parse(localStorage.getItem(CLAVE) ?? "[]") as Guardado[];
  } catch {
    return [];
  }
}

export function guardarCodigo(id: number, codigo: string) {
  try {
    const lista = [{ id, codigo, guardado: Date.now() }, ...misTurnos().filter((t) => t.id !== id)].slice(0, 10);
    localStorage.setItem(CLAVE, JSON.stringify(lista));
  } catch {
    /* sin almacenamiento */
  }
}
