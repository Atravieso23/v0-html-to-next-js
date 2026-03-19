// ============================================================================
// AVEX - Sistema de Gestión Integral
// Definiciones de tipos TypeScript
// ============================================================================

// --- Riders ---
export type RiderName = "Andrés" | "Sergio" | "Abraham";

export const RIDERS: RiderName[] = ["Andrés", "Sergio", "Abraham"];

export const RIDER_COLORS: Record<RiderName, string> = {
  "Andrés": "#0dcaf0",
  "Sergio": "#fd7e14",
  "Abraham": "#198754",
};

// --- Aseguradoras ---
export type InsuranceProvider = "Avex" | "La Caja" | "Rapihogar" | "Nivel";

export const INSURANCE_PROVIDERS: InsuranceProvider[] = [
  "Avex",
  "La Caja",
  "Rapihogar",
  "Nivel",
];

// --- Tipos de Servicio ---
export type ServiceType = "Arranque" | "Inflado" | "Cambio Rueda" | "Cerrajería";

export const SERVICE_TYPES: ServiceType[] = [
  "Arranque",
  "Inflado",
  "Cambio Rueda",
  "Cerrajería",
];

// --- Estados de Servicio ---
export type ServiceStatus =
  | "Pendiente"
  | "En camino"
  | "En el lugar"
  | "Programado"
  | "Finalizado"
  | "Cancelado";

// --- Métodos de Pago ---
export type PaymentMethod =
  | "Efectivo"
  | "Mercado Pago"
  | "Transferencia"
  | "No pagó"
  | "Cancelado";

export type SalePaymentMethod = "efectivo" | "tarjeta1" | "tarjeta3";

// --- Servicios ---
export interface ServiceTimestamps {
  creado: string;
  camino?: string;
  llegada?: string;
  fin?: string;
}

export interface Service {
  id: string;
  aseguradora: InsuranceProvider;
  cliente: string;
  celular?: string;
  marca?: string;
  modelo?: string;
  patente?: string;
  direccion: string;
  tipo: ServiceType;
  monto: number;
  rider: RiderName;
  notas?: string;
  estado: ServiceStatus;
  cobro?: PaymentMethod;
  obs?: string;
  firma?: string;
  lat?: number;
  lng?: number;
  orden: number;
  tiempos: ServiceTimestamps;
  fechaVisual: string;
  fechaInput: string;
  fechaFinInput?: string;
  // Programado
  esProgramado?: boolean;
  fechaProgramada?: string;
  horaProgramada?: string;
}

// --- Inventario ---
export interface BatteryLot {
  id: number | string;
  cantidad: number;
  costo: number;
}

export interface BatteryInventory {
  loteCounter: number;
  lotes: BatteryLot[];
}

export type InventoryState = Record<string, BatteryInventory>;

// --- Ventas ---
export interface BatterySale {
  fechaVisual: string;
  fechaInput: string;
  cliente: string;
  autoMarca: string;
  autoModelo: string;
  autoTexto: string;
  patente: string;
  modeloBat: string;
  loteUsado: number | string;
  costoLote: number;
  metodoPago: string;
  rider: RiderName;
  total: number;
}

// --- Compras ---
export interface BatteryPurchase {
  fechaVisual: string;
  fechaInput: string;
  proveedor?: string;
  factura?: string;
  modelo?: string;
  cantidad?: number;
  costoUnitario?: number;
  totalCompra: number;
  montoSinIva?: number;
  dtoPorcentaje?: number;
  dtoComercialPorcentaje?: number;
  iibbPorcentaje?: number;
  bonifEfectivoPorcentaje?: number;
  costoSinImpuestos?: number;
  detallesHtml: string;
  tipo?: "Rapida" | "Avanzada";
}

// --- Historiales ---
export interface HistoryState {
  ventas: BatterySale[];
  compras: BatteryPurchase[];
}

// --- Configuración ---
export interface SurchargeConfig {
  efectivo: number;
  tarjeta1: number;
  tarjeta3: number;
}

export interface AppConfig {
  preciosBase: Record<string, number>;
  recargos: SurchargeConfig;
}

// --- Estado Global ---
export interface AppState {
  config: AppConfig;
  inventario: InventoryState;
  servicios: Record<string, Service>;
  historiales: HistoryState;
}

// --- Vistas ---
export type ViewType = "admin" | "rider";
export type AdminTab =
  | "servicios"
  | "mapa-operativo"
  | "compras-avanzado"
  | "ventas"
  | "resumen"
  | "historial-servicios"
  | "historial-baterias"
  | "catalogo"
  | "garantias";

// --- Momento Actual ---
export interface CurrentMoment {
  fechaInput: string;
  fechaLegible: string;
  hora: string;
  completa: string;
}

// --- Estadísticas Dashboard ---
export interface RiderStats {
  servicios: number;
  baterias: number;
}

export interface DashboardStats {
  ingresosServicios: number;
  facturacionBaterias: number;
  gananciaBaterias: number;
  auxilios: number;
  baterias: number;
  riders: Record<RiderName, RiderStats>;
}

// --- Catálogo de Autos ---
export const CAR_BRANDS: Record<string, string[]> = {
  Chevrolet: ["Onix", "Cruze", "Tracker", "S10", "Corsa", "Classic", "Spin"],
  Fiat: ["Cronos", "Argo", "Mobi", "Toro", "Palio", "Siena", "Fiorino", "Strada"],
  Ford: ["Fiesta", "Focus", "Ka", "Ranger", "EcoSport", "Territory", "Maverick"],
  Peugeot: ["208", "2008", "308", "Partner", "207", "408"],
  Renault: ["Sandero", "Logan", "Kangoo", "Clio", "Duster", "Kwid", "Oroch"],
  Toyota: ["Etios", "Yaris", "Corolla", "Hilux", "Corolla Cross", "SW4"],
  Volkswagen: ["Gol", "Polo", "Amarok", "Vento", "Suran", "Up!", "Nivus", "Taos", "Saveiro"],
};

// --- Catálogo de Baterías ---
export const BATTERY_MODELS: string[] = [
  "Varta VA38JD (12x38)",
  "Varta VA60DD (12x65)",
  "Varta VA45JD (12x45)",
  "Varta VA70ND (12x75)",
  "Varta VDA95MD (12x100)",
  "Varta VA90LD (12x100)",
  "Varta VDA75PD (12x85)",
  "Varta VA60DE (12x65)",
  "Willard UB325D (12x38)",
  "Willard UB425D (12x45)",
  "Willard UB450D (12x45)",
  "Willard UB550D (12x55)",
  "Willard UB670D (12x55)",
  "Willard UB620D (12x65)",
  "Willard UB730D (12x75)",
  "Willard UB740D (12x75)",
  "Willard UB840D (12x85)",
  "Willard UB930D (12x100)",
  "Willard UB1030D (12x100)",
  "Willard EFB UB730D (12x75)",
  "Willard EFB UB840D (12x85)",
  "Dynasty DYN68D (12x65)",
];
