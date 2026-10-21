// Lo que devuelve la API (ApiCore/Models/Contratos.cs). Fechas de día como
// "2026-10-16", horas como "09:00:00".

export type Taller = {
  direccion: string;
  localidad: string;
  mapaUrl: string;
  horarios: string[];
  whatsapp: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  emailContacto: string;
  /** Página "Nosotros": párrafos separados por una línea en blanco. */
  nosotros: string;
};

export type ServicioPublico = {
  id: number;
  categoria: string;
  nombre: string;
  tiempo: string;
  precioMin: number;
  precioMax: number;
  esEscaneo: boolean;
};

export type Rango = { desde: string; hasta: string };
export type Franjas = { manana: Rango; tarde: Rango };

export type Sitio = {
  taller: Taller;
  servicios: ServicioPublico[];
  franjas: Franjas;
  diasAnticipacion: number;
  escaneoPrecio: number;
};

export type Opcion = { fecha: string; franja: "manana" | "tarde" };

export type BloqueLibre = { id: number; inicio: string; fin: string; libres: number };

export type Disponibilidad = {
  hoy: { fecha: string; estado: "sin_abrir" | "abierta" | "cerrada"; bloques: BloqueLibre[] };
  dias: { fecha: string; manana: boolean; tarde: boolean }[];
  franjas: Franjas;
};

export type EstadoTurno = "pendiente" | "confirmado" | "rechazado" | "liberado" | "cancelado" | "realizado" | "archivado";

export type MiTurno = {
  id: number;
  tipo: "hoy" | "dia";
  estado: EstadoTurno;
  fecha: string;
  hora: string | null;
  franja: "manana" | "tarde" | null;
  servicios: string[];
  otro: string | null;
  precioMin: number;
  precioMax: number;
  marca: string;
  modelo: string;
  patente: string;
  puedeCancelar: boolean;
  opciones: Opcion[];
};

/** Un turno en la lista de "Mi turno" (búsqueda por patente + contacto). */
export type MiTurnoResumen = {
  id: number;
  codigo: string;
  tipo: "hoy" | "dia";
  estado: EstadoTurno;
  fecha: string;
  hora: string | null;
  franja: "manana" | "tarde" | null;
  servicios: string[];
  otro: string | null;
};

export type Usuario = {
  id: number;
  nombre: string;
  email: string;
  esAdmin: boolean;
  esMecanico: boolean;
  /** Permiso efectivo: el dueño lo tiene siempre. */
  editaTarifas: boolean;
  /** Único que edita socios y datos del taller. Se asigna por consola, no desde la web. */
  esDueno: boolean;
  telegramVinculado: boolean;
  estado: "activo" | "suspendido";
};

export type TurnoServicio = { servicioId: number; nombre: string; esEscaneo: boolean; precioMin: number; precioMax: number };

export type Turno = {
  id: number;
  tipo: "hoy" | "dia";
  estado: EstadoTurno;
  fecha: string;
  hora: string | null;
  franja: "manana" | "tarde" | null;
  nombre: string;
  whatsapp: string;
  email: string;
  marca: string;
  modelo: string;
  anio: number;
  patente: string;
  descripcion: string | null;
  otro: string | null;
  origen: string | null;
  campania: string | null;
  conocio: string | null;
  precioMin: number;
  precioMax: number;
  montoCobrado: number | null;
  parteMecanico: number | null;
  parteDesarrollador: number | null;
  descuentoEscaneo: number;
  creado: string;
  servicios: TurnoServicio[];
  whatsappLink: string;
  opciones: Opcion[];
};

export type BloquePanel = { id: number; inicio: string; fin: string; cupo: number; ocupados: number };

export type Jornada = { fecha: string; estado: "abierta" | "cerrada"; bloqueMinutos: number; bloques: BloquePanel[] };

export type Agenda = { jornada: Jornada | null; turnos: Turno[]; franjas: Franjas; corte: Rango };

export type AccionTurno = { turno: Turno; avisarCliente: string | null };

export type ServicioAdmin = {
  id: number;
  categoria: string;
  nombre: string;
  tiempo: string;
  baseMin: number;
  baseMax: number | null;
  precioFijo: number | null;
  esEscaneo: boolean;
  orden: number;
  activo: boolean;
  precioMin: number;
  precioMax: number;
};

export type Tramo = { hasta: number | null; porcentaje: number };
export type PreciosConfig = { tramos: Tramo[]; redondeo: number; escaneoParteMecanico: number };

export type TurnosConfig = {
  diasAnticipacion: number;
  diasSemana: number[];
  mananaDesde: string;
  mananaHasta: string;
  tardeDesde: string;
  tardeHasta: string;
  corteDesde: string;
  corteHasta: string;
  minutosAviso: number[];
  minutosLiberar: number;
  horaRecordatorio: string;
  diasGancho: number;
};

/** `precios` (tramos de ganancia) solo llega al dueño; para el resto viene null. */
export type ConfigCompleta = { taller: Taller; precios: PreciosConfig | null; turnos: TurnosConfig };

export type Conteo = { clave: string; cantidad: number };

export type Metricas = {
  desde: string;
  hasta: string;
  visitas: number;
  pedidos: number;
  confirmados: number;
  realizados: number;
  rechazados: number;
  liberados: number;
  cancelados: number;
  tasaContacto: number;
  tasaConfirmacion: number;
  tasaExito: number;
  tasaLiberados: number;
  ingresos: number;
  ticketPromedio: number;
  gananciaDesarrollador: number;
  parteMecanico: number;
  origenes: { origen: string; campania: string; visitas: number; pedidos: number; realizados: number; ingresos: number; gasto: number }[];
  servicios: { nombre: string; pedidos: number; realizados: number }[];
  escaneo: { realizados: number; convertidos: number; tasa: number; diasVentana: number };
  conocio: Conteo[];
  porDia: { fecha: string; visitas: number; pedidos: number }[];
};

export type Comprobante = { id: number; nombre: string; tipoMime: string; tamano: number; creado: string };

export type Movimiento = {
  id: number;
  fecha: string;
  tipo: "gasto" | "ingreso";
  categoria: string;
  descripcion: string;
  monto: number;
  campania: string | null;
  estado: "pendiente" | "pagado";
  pagadoEn: string | null;
  medioPago: string | null;
  turnoId: number | null;
  recurrenteId: number | null;
  cargadoPor: string | null;
  comprobantes: Comprobante[];
};

export type ResumenFinanzas = {
  saldoAcumulado: number;
  ingresosMes: number;
  gastosMes: number;
  pendientesMonto: number;
  pendientesCantidad: number;
  gananciaDesarrolladorMes: number;
  parteMecanicoMes: number;
  meses: { periodo: string; ingresos: number; gastos: number; resultado: number; acumulado: number }[];
  gastosPorCategoria: Conteo[];
};

export type Recurrente = { id: number; descripcion: string; categoria: string; monto: number; diaMes: number; activo: boolean; ultimoPeriodo: string | null };

export type Notificacion = {
  id: number;
  canal: "telegram" | "email";
  destino: string;
  asunto: string | null;
  estado: "pendiente" | "enviada" | "fallida" | "omitida";
  intentos: number;
  ultimoError: string | null;
  turnoId: number | null;
  creado: string;
};

/** Foto del taller (página "Nosotros"). La imagen se pide aparte: ver `urlFoto` en lib/fotos. */
export type Foto = { id: number; texto: string | null; ancho: number; alto: number };
