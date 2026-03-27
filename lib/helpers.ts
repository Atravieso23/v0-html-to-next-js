// ============================================================================
// AVEX - Funciones de utilidad
// ============================================================================

import type { CurrentMoment, Service, DashboardStats, RiderName } from "./types";
import { RIDERS } from "./types";  // Used as default value only

/**
 * Obtiene el momento actual formateado
 */
export function getCurrentMoment(): CurrentMoment {
  const now = new Date();
  const dia = String(now.getDate()).padStart(2, "0");
  const mes = String(now.getMonth() + 1).padStart(2, "0");
  const anio = now.getFullYear();
  const horas = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");

  return {
    fechaInput: `${anio}-${mes}-${dia}`,
    fechaLegible: `${dia}/${mes}/${anio}`,
    hora: `${horas}:${min}`,
    completa: `${dia}/${mes}/${anio} - ${horas}:${min} hs`,
  };
}

/**
 * Genera un ID único basado en timestamp
 */
export function generateId(): string {
  return Date.now().toString();
}

/**
 * Formatea un número como moneda ARS
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formatea un número sin símbolo de moneda
 */
export function formatNumber(amount: number): string {
  return new Intl.NumberFormat("es-AR").format(amount);
}

/**
 * Convierte fecha de input a formato visual
 */
export function inputToVisualDate(inputDate: string): string {
  if (!inputDate) return "";
  const parts = inputDate.split("-");
  if (parts.length !== 3) return inputDate;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

/**
 * Convierte fecha visual a formato input
 */
export function visualToInputDate(visualDate: string): string {
  if (!visualDate) return "";
  const parts = visualDate.split("/");
  if (parts.length !== 3) return visualDate;
  return `${parts[2]}-${parts[1]}-${parts[0]}`;
}

/**
 * Extrae el mes de una fecha en formato input (YYYY-MM)
 */
export function getMonthFromInputDate(inputDate: string): string {
  return inputDate ? inputDate.substring(0, 7) : "";
}

/**
 * Limpia un número de teléfono dejando solo dígitos
 */
export function cleanPhoneNumber(phone: string): string {
  return phone.replace(/[^0-9]/g, "");
}

/**
 * Genera URL de WhatsApp
 */
export function getWhatsAppUrl(phone: string, message: string): string {
  const cleanPhone = cleanPhoneNumber(phone);
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/54${cleanPhone}?text=${encodedMessage}`;
}

/**
 * Genera URL de Google Maps para una dirección
 */
export function getGoogleMapsUrl(address: string, embedded = false): string {
  const encodedAddress = encodeURIComponent(`${address}, Buenos Aires, Argentina`);
  if (embedded) {
    return `https://maps.google.com/maps?q=${encodedAddress}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
}

/**
 * Geocodifica una dirección usando Nominatim
 */
export async function geocodeAddress(
  address: string
): Promise<{ lat: number; lng: number } | null> {
  try {
    const query = encodeURIComponent(`${address}, Buenos Aires, Argentina`);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`
    );
    const data = await response.json();

    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };
    }
    return null;
  } catch (error) {
    console.error("Error geocoding:", error);
    return null;
  }
}

/**
 * Calcula estadísticas del dashboard
 */
export function calculateDashboardStats(
  servicios: Record<string, Service>,
  ventas: { total: number; costoLote: number; rider: RiderName; fechaInput: string }[],
  filterMonth?: string,
  comisionRider = 10000,
  ridersList: string[] = RIDERS
): DashboardStats {
  const stats: DashboardStats = {
    ingresosServicios: 0,
    facturacionBaterias: 0,
    gananciaBaterias: 0,
    auxilios: 0,
    baterias: 0,
    riders: ridersList.reduce(
      (acc, rider) => {
        acc[rider] = { servicios: 0, baterias: 0 };
        return acc;
      },
      {} as Record<RiderName, { servicios: number; baterias: number }>
    ),
  };

  // Procesar servicios
  Object.values(servicios).forEach((s) => {
    if (s.estado === "Finalizado") {
      const monthMatch = !filterMonth || s.fechaFinInput?.startsWith(filterMonth);
      if (monthMatch) {
        if (s.cobro !== "No pagó") {
          stats.ingresosServicios += s.monto || 0;
        }
        stats.auxilios++;
        if (stats.riders[s.rider]) {
          stats.riders[s.rider].servicios++;
        }
      }
    }
  });

  // Procesar ventas de baterías
  ventas.forEach((v) => {
    const monthMatch = !filterMonth || v.fechaInput.startsWith(filterMonth);
    if (monthMatch) {
      stats.facturacionBaterias += v.total || 0;
      stats.gananciaBaterias += (v.total || 0) - (v.costoLote || 0) - comisionRider;
      stats.baterias++;
      if (stats.riders[v.rider]) {
        stats.riders[v.rider].baterias++;
      }
    }
  });

  return stats;
}

/**
 * Parsea texto de seguro para autocompletar formulario
 */
export function parseInsuranceText(text: string): Partial<{
  cliente: string;
  celular: string;
  direccion: string;
  marca: string;
  modelo: string;
  patente: string;
  tipoServicio: string;
}> {
  const result: ReturnType<typeof parseInsuranceText> = {};

  // Asegurado
  const matchAsegurado = text.match(/Asegurado:\s*(.+)/i);
  if (matchAsegurado) result.cliente = matchAsegurado[1].trim();

  // Teléfono
  const matchTelefono = text.match(/Tel(?:é|e)fono(?: del asegurado)?:\s*(.+)/i);
  if (matchTelefono) result.celular = matchTelefono[1].trim();

  // Dirección
  const matchDireccion = text.match(/Punto de encuentro:\s*(.+)/i);
  if (matchDireccion) result.direccion = matchDireccion[1].trim();

  // Patente
  const matchPatente = text.match(/Patente(?: del veh(?:í|i)culo a asistir)?:\s*([A-Za-z0-9]+)/i);
  if (matchPatente) result.patente = matchPatente[1].trim();

  // Vehículo
  const matchVehiculo = text.match(/Veh(?:í|i)culo a asistir:\s*(.+)/i);
  if (matchVehiculo) {
    const vehiculoCompleto = matchVehiculo[1].trim();
    const knownBrands = ["Chevrolet", "Fiat", "Ford", "Peugeot", "Renault", "Toyota", "Volkswagen"];
    const vehUpper = vehiculoCompleto.toUpperCase();

    for (const marca of knownBrands) {
      if (vehUpper.includes(marca.toUpperCase())) {
        result.marca = marca;
        result.modelo = vehiculoCompleto.replace(new RegExp(marca, "i"), "").trim();
        break;
      }
    }
    if (!result.marca) {
      result.modelo = vehiculoCompleto;
    }
  }

  // Tipo de servicio
  const textoLower = text.toLowerCase();
  if (textoLower.includes("cambio") && (textoLower.includes("rueda") || textoLower.includes("goma"))) {
    result.tipoServicio = "Cambio Rueda";
  } else if (textoLower.includes("inflado") || textoLower.includes("goma") || textoLower.includes("rueda")) {
    result.tipoServicio = "Inflado";
  } else if (
    textoLower.includes("arranque") ||
    textoLower.includes("batería") ||
    textoLower.includes("bateria") ||
    textoLower.includes("puente")
  ) {
    result.tipoServicio = "Arranque";
  } else if (textoLower.includes("cerrajería") || textoLower.includes("llave")) {
    result.tipoServicio = "Cerrajería";
  }

  return result;
}

/**
 * Calcula el precio de venta con recargo
 */
export function calculateSalePrice(
  basePrice: number,
  method: "efectivo" | "tarjeta1" | "tarjeta3",
  surcharges: { efectivo: number; tarjeta1: number; tarjeta3: number }
): number {
  const percentage = surcharges[method] || 0;
  return Math.round(basePrice + basePrice * (percentage / 100));
}

/**
 * Calcula los valores de una compra avanzada
 */
export function calculateAdvancedPurchase(values: {
  cantidad: number;
  montoUnitarioSinIva: number;
  dtoPorcentaje: number;
  dtoComercialPorcentaje: number;
  iibbPorcentaje: number;
  bonifEfectivoPorcentaje: number;
}): {
  dtoValor: number;
  subtotal1: number;
  dtoComercialValor: number;
  subtotal2: number;
  ivaValor: number;
  iibbValor: number;
  totalUnitario: number;
  costoFinalConIva: number;
  totalLote: number;
  costoFinalSinImpuestos: number;
} {
  const { cantidad, montoUnitarioSinIva, dtoPorcentaje, dtoComercialPorcentaje, iibbPorcentaje, bonifEfectivoPorcentaje } = values;

  // Descuento
  const dtoValor = -(montoUnitarioSinIva * (dtoPorcentaje / 100));
  const subtotal1 = montoUnitarioSinIva + dtoValor;

  // Descuento comercial
  const dtoComercialValor = -(subtotal1 * (dtoComercialPorcentaje / 100));
  const subtotal2 = subtotal1 + dtoComercialValor;

  // IVA
  const ivaValor = subtotal2 * 0.21;

  // IIBB
  const iibbValor = subtotal2 * (iibbPorcentaje / 100);

  // Total antes de bonificación
  const totalUnitario = subtotal2 + ivaValor + iibbValor;

  // Costo final con IVA (después de bonificación efectivo)
  const costoFinalConIva = totalUnitario * (1 - bonifEfectivoPorcentaje / 100);

  // Total del lote
  const totalLote = costoFinalConIva * cantidad;

  // Costo sin impuestos
  let costoFinalSinImpuestos = costoFinalConIva / 1.21;
  if (iibbPorcentaje > 0) {
    costoFinalSinImpuestos = costoFinalSinImpuestos / 1.03;
  }

  return {
    dtoValor,
    subtotal1,
    dtoComercialValor,
    subtotal2,
    ivaValor,
    iibbValor,
    totalUnitario,
    costoFinalConIva,
    totalLote,
    costoFinalSinImpuestos,
  };
}
