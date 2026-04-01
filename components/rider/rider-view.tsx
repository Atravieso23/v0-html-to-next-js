"use client";

import { useState } from "react";
import { useAvexStore } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import type { RiderName, Service, BatterySale } from "@/lib/types";
import { getCurrentMoment, getGoogleMapsUrl, getWhatsAppUrl } from "@/lib/helpers";
import {
  Navigation, MapPin, Phone, MessageCircle, CheckCircle,
  Clock, Car, Battery, Zap, AlertCircle, LogOut, LayoutList, TableProperties,
} from "lucide-react";
import { toast } from "sonner";
import { CloseServiceDialog } from "@/components/services/close-service-dialog";
import { CloseBatterySaleDialog } from "@/components/services/close-battery-sale-dialog";
import { QueueBoard } from "@/components/admin/queue-board";

// ─── Pantalla de selección de rider ───────────────────────────────────────────

function RiderLoginScreen({ onSelect }: { onSelect: (rider: RiderName) => void }) {
  const riders = useAvexStore((state) => state.riders);
  const riderColors = useAvexStore((state) => state.riderColors);
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center px-6">

      {/* Logo */}
      <div className="flex items-center gap-3 mb-10">
        <div className="w-12 h-12 bg-yellow-400 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-200">
          <Zap className="h-6 w-6 text-black" />
        </div>
        <div>
          <p className="text-2xl font-black text-slate-900 leading-none">AVEX</p>
          <p className="text-xs text-slate-400 font-medium tracking-wide">App Rider</p>
        </div>
      </div>

      <div className="w-full max-w-sm">
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">

          {/* Header */}
          <div className="bg-[#1C2333] px-5 py-4 text-center">
            <p className="text-white font-black text-sm tracking-wide">¿QUIÉN SOS?</p>
            <p className="text-slate-400 text-xs mt-0.5">Seleccioná tu nombre para ver tus viajes</p>
          </div>

          <div className="p-4 space-y-2.5">
            {riders.map((rider) => {
              const color = rider.color || riderColors[rider.nombre] || "#888";
              return (
                <button
                  key={rider.nombre}
                  onClick={() => onSelect(rider.nombre)}
                  className="w-full flex items-center gap-4 px-4 py-4 rounded-xl border-2 border-slate-200 bg-slate-50 hover:border-opacity-100 active:scale-[0.98] transition-all duration-150 group"
                  style={{ ["--hover-color" as string]: color }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = color;
                    (e.currentTarget as HTMLElement).style.backgroundColor = color + "10";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "";
                    (e.currentTarget as HTMLElement).style.backgroundColor = "";
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white font-black text-lg"
                    style={{ backgroundColor: color }}
                  >
                    {rider.nombre[0]}
                  </div>
                  <div className="text-left">
                    <p className="font-black text-slate-900 text-base leading-none">{rider.nombre}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Rider AVEX</p>
                  </div>
                  <div className="ml-auto text-slate-300 group-hover:translate-x-1 transition-transform">
                    <Navigation className="h-4 w-4" />
                  </div>
                </button>
              );
            })}
          </div>

          <div className="px-4 pb-4">
            <p className="text-center text-[10px] text-slate-300 font-medium">
              Solo verás los viajes asignados a vos
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Card de servicio activo ───────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; barBg: string; barText: string; pulse: boolean }> = {
  "Pendiente":   { label: "NUEVO VIAJE",  barBg: "bg-yellow-400", barText: "text-black",   pulse: true },
  "En camino":   { label: "EN CAMINO",    barBg: "bg-blue-500",   barText: "text-white",   pulse: false },
  "En el lugar": { label: "EN EL LUGAR",  barBg: "bg-green-500",  barText: "text-white",   pulse: false },
  "Programado":  { label: "PROGRAMADO",   barBg: "bg-slate-200",  barText: "text-slate-700", pulse: false },
};

function ActiveServiceCard({ service, onStatusChange, onClose }: {
  service: Service;
  onStatusChange: (status: Service["estado"]) => void;
  onClose: () => void;
}) {
  const autoText = [service.marca, service.modelo].filter(Boolean).join(" ") || "Vehículo sin registrar";
  const status = STATUS_CONFIG[service.estado] ?? STATUS_CONFIG["Pendiente"];
  const isNew    = service.estado === "Pendiente";
  const isOnWay  = service.estado === "En camino";
  const isOnSite = service.estado === "En el lugar";

  return (
    <div className={`bg-white border-2 rounded-2xl overflow-hidden mb-3 shadow-sm ${
      isNew ? "border-yellow-400 shadow-yellow-100 shadow-md" : "border-slate-200"
    }`}>

      {/* Barra de estado */}
      <div className={`px-4 py-2 flex items-center justify-between ${status.barBg}`}>
        <div className="flex items-center gap-2">
          {status.pulse && <span className="w-2 h-2 rounded-full bg-black animate-pulse" />}
          <span className={`font-black text-xs tracking-widest ${status.barText}`}>{status.label}</span>
        </div>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-black/10 ${status.barText}`}>
          {service.tipo}
        </span>
      </div>

      <div className="p-4 space-y-3">

        {/* Cliente + monto */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-black text-lg text-slate-900 leading-tight">{service.cliente || "Sin nombre"}</h3>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <Car className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="text-sm text-slate-500">{autoText}</span>
              {service.patente && (
                <span className="bg-slate-900 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded tracking-widest">
                  {service.patente}
                </span>
              )}
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">A cobrar</p>
            <p className="text-2xl font-black text-slate-900 leading-none">
              ${service.monto.toLocaleString("es-AR")}
            </p>
          </div>
        </div>

        {/* Dirección */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 flex items-start gap-2">
          <MapPin className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
          <span className="text-sm text-slate-700 font-medium leading-snug">{service.direccion}</span>
        </div>

        {/* Notas */}
        {service.notas && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-3 py-2 flex items-start gap-2">
            <AlertCircle className="h-3.5 w-3.5 text-yellow-600 mt-0.5 shrink-0" />
            <p className="text-xs text-yellow-800 font-medium">{service.notas}</p>
          </div>
        )}

        {/* Programado info */}
        {service.esProgramado && service.fechaProgramada && (
          <div className="bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-slate-500 shrink-0" />
            <p className="text-xs text-slate-600 font-medium">
              Programado para: {service.fechaProgramada} a las {service.horaProgramada}
            </p>
          </div>
        )}

        {/* Botones */}
        <div className="space-y-2 pt-1">
          {/* Maps */}
          <button
            onClick={() => window.open(getGoogleMapsUrl(service.direccion), "_blank")}
            className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 text-white font-bold text-sm rounded-xl hover:bg-slate-800 active:scale-[0.98] transition-all"
          >
            <Navigation className="h-4 w-4" />
            ABRIR EN MAPS
          </button>

          {/* Llamar + WhatsApp */}
          {service.celular && (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => window.open(`tel:${service.celular}`, "_blank")}
                className="flex items-center justify-center gap-2 py-2.5 bg-white border-2 border-slate-200 text-slate-700 font-bold text-sm rounded-xl hover:border-slate-400 active:scale-[0.98] transition-all"
              >
                <Phone className="h-4 w-4" />
                Llamar
              </button>
              <button
                onClick={() => window.open(
                  getWhatsAppUrl(service.celular!, `Hola ${service.cliente}, soy de AVEX. Estoy en camino para el servicio de ${service.tipo}.`),
                  "_blank"
                )}
                className="flex items-center justify-center gap-2 py-2.5 bg-green-50 border-2 border-green-200 text-green-700 font-bold text-sm rounded-xl hover:border-green-400 active:scale-[0.98] transition-all"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </button>
            </div>
          )}

          {/* Cambio de estado */}
          <div className="pt-1 border-t border-slate-100">
            {isNew && (
              <button
                onClick={() => onStatusChange("En camino")}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-yellow-400 text-black font-black text-sm rounded-xl hover:bg-yellow-300 active:scale-[0.98] transition-all shadow-md shadow-yellow-200"
              >
                <Navigation className="h-4 w-4" />
                SALIR EN CAMINO
              </button>
            )}
            {isOnWay && (
              <button
                onClick={() => onStatusChange("En el lugar")}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-500 text-white font-black text-sm rounded-xl hover:bg-blue-400 active:scale-[0.98] transition-all shadow-md shadow-blue-200"
              >
                <MapPin className="h-4 w-4" />
                LLEGUÉ AL LUGAR
              </button>
            )}
            {isOnSite && (
              <button
                onClick={onClose}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-green-500 text-white font-black text-sm rounded-xl hover:bg-green-400 active:scale-[0.98] transition-all shadow-md shadow-green-200"
              >
                <CheckCircle className="h-4 w-4" />
                FINALIZAR Y COBRAR
              </button>
            )}
          </div>
        </div>

        {/* Timestamp */}
        <div className="flex items-center gap-1 text-[10px] text-slate-400 pt-1 border-t border-slate-100">
          <Clock className="h-3 w-3" />
          Asignado: {service.tiempos?.creado || "—"}
        </div>
      </div>
    </div>
  );
}

// ─── Card de venta de batería activa ─────────────────────────────────────────

const SALE_STATUS_CONFIG: Record<string, { label: string; barBg: string; barText: string; pulse: boolean }> = {
  "Pendiente":   { label: "NUEVA ENTREGA",  barBg: "bg-blue-500",   barText: "text-white", pulse: true },
  "En camino":   { label: "EN CAMINO",      barBg: "bg-blue-700",   barText: "text-white", pulse: false },
  "En el lugar": { label: "EN EL LUGAR",    barBg: "bg-green-500",  barText: "text-white", pulse: false },
};

function ActiveBatterySaleCard({ sale, onStatusChange, onClose }: {
  sale: BatterySale;
  onStatusChange: (status: BatterySale["estado"]) => void;
  onClose: () => void;
}) {
  const status = SALE_STATUS_CONFIG[sale.estado] ?? SALE_STATUS_CONFIG["Pendiente"];
  const isNew    = sale.estado === "Pendiente";
  const isOnWay  = sale.estado === "En camino";
  const isOnSite = sale.estado === "En el lugar";

  return (
    <div className="bg-white border-2 border-blue-400 rounded-2xl overflow-hidden mb-3 shadow-sm shadow-blue-100">

      {/* Barra de estado */}
      <div className={`px-4 py-2 flex items-center justify-between ${status.barBg}`}>
        <div className="flex items-center gap-2">
          {status.pulse && <span className="w-2 h-2 rounded-full bg-white animate-pulse" />}
          <Battery className="h-3.5 w-3.5 text-white" />
          <span className={`font-black text-xs tracking-widest ${status.barText}`}>{status.label}</span>
        </div>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-black/20 text-white">
          VENTA BATERÍA
        </span>
      </div>

      <div className="p-4 space-y-3">

        {/* Cliente + monto */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-black text-lg text-slate-900 leading-tight">{sale.cliente || "Sin nombre"}</h3>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <Battery className="h-3.5 w-3.5 text-blue-400 shrink-0" />
              <span className="text-sm text-slate-500">{sale.modeloBat}</span>
              {sale.autoTexto && (
                <span className="text-xs text-slate-400">· {sale.autoTexto}</span>
              )}
              {sale.patente && (
                <span className="bg-slate-900 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded tracking-widest">
                  {sale.patente}
                </span>
              )}
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Total</p>
            <p className="text-2xl font-black text-slate-900 leading-none">
              ${sale.total.toLocaleString("es-AR")}
            </p>
            <p className="text-[10px] text-blue-500 font-bold">{sale.metodoPago}</p>
          </div>
        </div>

        {/* Dirección */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-3 py-2.5 flex items-start gap-2">
          <MapPin className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
          <span className="text-sm text-slate-700 font-medium leading-snug">{sale.direccion}</span>
        </div>

        {/* Botones */}
        <div className="space-y-2 pt-1">
          <button
            onClick={() => window.open(getGoogleMapsUrl(sale.direccion), "_blank")}
            className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 text-white font-bold text-sm rounded-xl hover:bg-slate-800 active:scale-[0.98] transition-all"
          >
            <Navigation className="h-4 w-4" />
            ABRIR EN MAPS
          </button>

          {sale.celular && (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => window.open(`tel:${sale.celular}`, "_blank")}
                className="flex items-center justify-center gap-2 py-2.5 bg-white border-2 border-slate-200 text-slate-700 font-bold text-sm rounded-xl hover:border-slate-400 active:scale-[0.98] transition-all"
              >
                <Phone className="h-4 w-4" />
                Llamar
              </button>
              <button
                onClick={() => window.open(
                  getWhatsAppUrl(sale.celular!, `Hola ${sale.cliente}, soy de AVEX. Estoy en camino para entregar la batería.`),
                  "_blank"
                )}
                className="flex items-center justify-center gap-2 py-2.5 bg-green-50 border-2 border-green-200 text-green-700 font-bold text-sm rounded-xl hover:border-green-400 active:scale-[0.98] transition-all"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </button>
            </div>
          )}

          <div className="pt-1 border-t border-slate-100">
            {isNew && (
              <button
                onClick={() => onStatusChange("En camino")}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-500 text-white font-black text-sm rounded-xl hover:bg-blue-400 active:scale-[0.98] transition-all shadow-md shadow-blue-200"
              >
                <Navigation className="h-4 w-4" />
                SALIR EN CAMINO
              </button>
            )}
            {isOnWay && (
              <button
                onClick={() => onStatusChange("En el lugar")}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-700 text-white font-black text-sm rounded-xl hover:bg-blue-600 active:scale-[0.98] transition-all shadow-md shadow-blue-300"
              >
                <MapPin className="h-4 w-4" />
                LLEGUÉ AL LUGAR
              </button>
            )}
            {isOnSite && (
              <button
                onClick={onClose}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-green-500 text-white font-black text-sm rounded-xl hover:bg-green-400 active:scale-[0.98] transition-all shadow-md shadow-green-200"
              >
                <CheckCircle className="h-4 w-4" />
                CONFIRMAR ENTREGA
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 text-[10px] text-slate-400 pt-1 border-t border-slate-100">
          <Clock className="h-3 w-3" />
          Asignada: {sale.tiempos?.creado || "—"}
        </div>
      </div>
    </div>
  );
}

// ─── Card de servicio finalizado ──────────────────────────────────────────────

function CompletedServiceCard({ service }: { service: Service }) {
  const autoText = [service.marca, service.modelo].filter(Boolean).join(" ") || "Vehículo sin registrar";
  const isCanceled = service.estado === "Cancelado" || service.cobro === "Cancelado";
  const didntPay  = service.cobro === "No pagó";

  return (
    <div className={`bg-white border rounded-xl px-4 py-3 mb-2 flex items-center justify-between ${
      isCanceled ? "border-slate-200 opacity-60" : didntPay ? "border-red-200" : "border-green-200"
    }`}>
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full shrink-0 ${
          isCanceled ? "bg-slate-300" : didntPay ? "bg-red-400" : "bg-green-400"
        }`} />
        <div>
          <p className="font-bold text-sm text-slate-800">{autoText}</p>
          <p className="text-[10px] text-slate-400 truncate max-w-[180px]">{service.direccion}</p>
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className={`font-black text-sm ${
          isCanceled ? "text-slate-400" : didntPay ? "text-red-500" : "text-green-600"
        }`}>
          ${service.monto.toLocaleString("es-AR")}
        </p>
        <p className="text-[10px] text-slate-400">{isCanceled ? "Cancelado" : service.cobro}</p>
      </div>
    </div>
  );
}

// ─── Card de batería ──────────────────────────────────────────────────────────

function BatterySaleCard({ sale }: { sale: { modeloBat: string; autoTexto: string; metodoPago: string; total: number } }) {
  return (
    <div className="bg-white border border-blue-100 rounded-xl px-4 py-3 mb-2 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Battery className="h-4 w-4 text-blue-500 shrink-0" />
        <div>
          <p className="font-bold text-sm text-slate-800">{sale.modeloBat}</p>
          <p className="text-[10px] text-slate-400">{sale.autoTexto}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-black text-sm text-slate-800">${sale.total?.toLocaleString("es-AR") ?? "—"}</p>
        <p className="text-[10px] text-slate-400">{sale.metodoPago}</p>
      </div>
    </div>
  );
}

// ─── Panel del rider ──────────────────────────────────────────────────────────

function RiderPanel({ rider, onLogout }: { rider: RiderName; onLogout?: () => void }) {
  const services    = useAvexStore(useShallow((state) => Object.values(state.servicios).filter((s) => s.rider === rider)));
  const updateService = useAvexStore((state) => state.updateService);
  const updateBatterySaleById = useAvexStore((state) => state.updateBatterySaleById);
  const historiales = useAvexStore((state) => state.historiales);
  const riderColors = useAvexStore((state) => state.riderColors);
  const [closingService, setClosingService] = useState<Service | null>(null);
  const [closingSale, setClosingSale] = useState<BatterySale | null>(null);
  const color = riderColors[rider];
  const today = getCurrentMoment().fechaInput;

  const activeServices = services.filter(
    (s) =>
      s.estado !== "Finalizado" &&
      s.estado !== "Cancelado" &&
      s.estado !== "Programado" &&
      s.estado !== "Pausado"
  );
  const completedToday = services.filter(
    (s) => (s.estado === "Finalizado" || s.estado === "Cancelado") && s.fechaFinInput === today
  );

  const riderSalesToday = historiales.ventas.filter((v) => v.rider === rider && v.fechaInput === today);
  const activeSales = riderSalesToday.filter(
    (v) => v.estado !== "Finalizado" && v.estado !== "Cancelado"
  );
  const completedSalesToday = riderSalesToday.filter(
    (v) => v.estado === "Finalizado" || v.estado === "Cancelado"
  );

  const totalServicios = completedToday
    .filter((s) => s.cobro !== "Cancelado" && s.cobro !== "No pagó")
    .reduce((sum, s) => sum + (s.monto || 0), 0);
  const totalBaterias = completedSalesToday
    .filter((v) => v.estado === "Finalizado")
    .reduce((sum, v) => sum + (v.total || 0), 0);

  const handleStatusChange = (service: Service, newStatus: Service["estado"]) => {
    const momento = getCurrentMoment();
    const updates: Partial<Service> = { estado: newStatus };
    if (newStatus === "En camino")   updates.tiempos = { ...service.tiempos, camino: momento.completa };
    if (newStatus === "En el lugar") updates.tiempos = { ...service.tiempos, llegada: momento.completa };
    updateService(service.id, updates);
    toast.success(`Estado: ${newStatus}`);
  };

  const handleSaleStatusChange = (sale: BatterySale, newStatus: BatterySale["estado"]) => {
    const momento = getCurrentMoment();
    const updates: Partial<BatterySale> = { estado: newStatus };
    if (newStatus === "En camino")   updates.tiempos = { ...sale.tiempos, camino: momento.completa };
    if (newStatus === "En el lugar") updates.tiempos = { ...sale.tiempos, llegada: momento.completa };
    updateBatterySaleById(sale.id, updates);
    toast.success(`Entrega: ${newStatus}`);
  };

  return (
    <div className="min-h-screen bg-slate-100">

      {/* Header fijo */}
      <div className="sticky top-0 z-20 bg-[#1C2333] px-4 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white text-base shrink-0"
            style={{ backgroundColor: color }}>
            {rider[0]}
          </div>
          <div>
            <p className="text-white font-black text-sm leading-none">{rider}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              <p className="text-slate-400 text-[10px]">
                {activeServices.length > 0
                  ? `${activeServices.length} viaje${activeServices.length > 1 ? "s" : ""} activo${activeServices.length > 1 ? "s" : ""}`
                  : "Sin viajes activos"}
              </p>
            </div>
          </div>
        </div>
        {onLogout && (
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            Salir
          </button>
        )}
      </div>

      <div className="max-w-lg mx-auto px-4 pt-4 pb-10 space-y-4">

        {/* Resumen del día */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white border border-slate-200 rounded-xl p-3 text-center shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1">Viajes hoy</p>
            <p className="text-2xl font-black text-slate-900">{completedToday.length}</p>
          </div>
          <div className="bg-white border border-yellow-200 rounded-xl p-3 text-center shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wide text-yellow-600 mb-1">Servicios $</p>
            <p className="text-xl font-black text-slate-900">${totalServicios.toLocaleString("es-AR")}</p>
          </div>
          <div className="bg-white border border-blue-100 rounded-xl p-3 text-center shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wide text-blue-500 mb-1">Baterías $</p>
            <p className="text-xl font-black text-slate-900">${totalBaterias.toLocaleString("es-AR")}</p>
          </div>
        </div>

        {/* Entregas de batería activas */}
        {activeSales.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Battery className="h-4 w-4 text-blue-500" />
              <h3 className="font-black text-xs uppercase tracking-widest text-slate-500">Entregas de Batería</h3>
              <span className="bg-blue-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
                {activeSales.length}
              </span>
            </div>
            {activeSales.map((sale) => (
              <ActiveBatterySaleCard
                key={sale.id}
                sale={sale}
                onStatusChange={(status) => handleSaleStatusChange(sale, status)}
                onClose={() => setClosingSale(sale)}
              />
            ))}
          </div>
        )}

        {/* Viajes activos */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Car className="h-4 w-4 text-slate-500" />
            <h3 className="font-black text-xs uppercase tracking-widest text-slate-500">Viajes Activos</h3>
            {activeServices.length > 0 && (
              <span className="bg-yellow-400 text-black text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
                {activeServices.length}
              </span>
            )}
          </div>

          {activeServices.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center shadow-sm">
              <Zap className="h-8 w-8 text-slate-200 mx-auto mb-2" />
              <p className="font-bold text-slate-400">Sin viajes activos</p>
              <p className="text-xs text-slate-300 mt-1">Los nuevos viajes aparecerán acá</p>
            </div>
          ) : (
            activeServices.map((service) => (
              <ActiveServiceCard
                key={service.id}
                service={service}
                onStatusChange={(status) => handleStatusChange(service, status)}
                onClose={() => setClosingService(service)}
              />
            ))
          )}
        </div>

        {/* Finalizados hoy */}
        {completedToday.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <h3 className="font-black text-xs uppercase tracking-widest text-slate-500">Finalizados Hoy</h3>
              <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {completedToday.length}
              </span>
            </div>
            {completedToday.map((service) => (
              <CompletedServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}

        {/* Baterías entregadas hoy */}
        {completedSalesToday.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Battery className="h-4 w-4 text-blue-500" />
              <h3 className="font-black text-xs uppercase tracking-widest text-slate-500">Baterías Entregadas Hoy</h3>
              <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {completedSalesToday.length}
              </span>
            </div>
            {completedSalesToday.map((sale) => (
              <BatterySaleCard key={sale.id} sale={sale} />
            ))}
          </div>
        )}
      </div>

      <CloseServiceDialog
        service={closingService}
        open={!!closingService}
        onOpenChange={(open) => !open && setClosingService(null)}
      />
      <CloseBatterySaleDialog
        sale={closingSale}
        open={!!closingSale}
        onOpenChange={(open) => !open && setClosingSale(null)}
      />
    </div>
  );
}

// ─── Vista admin de riders (desde el panel admin) ─────────────────────────────

function AdminRiderPanel({ rider }: { rider: RiderName }) {
  const services    = useAvexStore(useShallow((state) => Object.values(state.servicios).filter((s) => s.rider === rider)));
  const updateService = useAvexStore((state) => state.updateService);
  const updateBatterySaleById = useAvexStore((state) => state.updateBatterySaleById);
  const historiales = useAvexStore((state) => state.historiales);
  const [closingService, setClosingService] = useState<Service | null>(null);
  const [closingSale, setClosingSale] = useState<BatterySale | null>(null);
  const today = getCurrentMoment().fechaInput;

  const activeServices = services.filter(
    (s) =>
      s.estado !== "Finalizado" &&
      s.estado !== "Cancelado" &&
      s.estado !== "Programado" &&
      s.estado !== "Pausado"
  );
  const completedToday = services.filter(
    (s) => (s.estado === "Finalizado" || s.estado === "Cancelado") && s.fechaFinInput === today
  );

  const riderSalesToday = historiales.ventas.filter((v) => v.rider === rider && v.fechaInput === today);
  const activeSales = riderSalesToday.filter(
    (v) => v.estado !== "Finalizado" && v.estado !== "Cancelado"
  );
  const completedSalesToday = riderSalesToday.filter(
    (v) => v.estado === "Finalizado" || v.estado === "Cancelado"
  );

  const totalServicios = completedToday
    .filter((s) => s.cobro !== "Cancelado" && s.cobro !== "No pagó")
    .reduce((sum, s) => sum + (s.monto || 0), 0);
  const totalBaterias = completedSalesToday
    .filter((v) => v.estado === "Finalizado")
    .reduce((sum, v) => sum + (v.total || 0), 0);

  const handleStatusChange = (service: Service, newStatus: Service["estado"]) => {
    const momento = getCurrentMoment();
    const updates: Partial<Service> = { estado: newStatus };
    if (newStatus === "En camino")   updates.tiempos = { ...service.tiempos, camino: momento.completa };
    if (newStatus === "En el lugar") updates.tiempos = { ...service.tiempos, llegada: momento.completa };
    updateService(service.id, updates);
    toast.success(`Estado: ${newStatus}`);
  };

  const handleSaleStatusChange = (sale: BatterySale, newStatus: BatterySale["estado"]) => {
    const momento = getCurrentMoment();
    const updates: Partial<BatterySale> = { estado: newStatus };
    if (newStatus === "En camino")   updates.tiempos = { ...sale.tiempos, camino: momento.completa };
    if (newStatus === "En el lugar") updates.tiempos = { ...sale.tiempos, llegada: momento.completa };
    updateBatterySaleById(sale.id, updates);
    toast.success(`Entrega: ${newStatus}`);
  };

  return (
    <div className="space-y-4">
      {/* Resumen */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white border border-slate-200 rounded-xl p-3 text-center shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1">Viajes hoy</p>
          <p className="text-2xl font-black text-slate-900">{completedToday.length}</p>
        </div>
        <div className="bg-white border border-yellow-200 rounded-xl p-3 text-center shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wide text-yellow-600 mb-1">Servicios $</p>
          <p className="text-xl font-black text-slate-900">${totalServicios.toLocaleString("es-AR")}</p>
        </div>
        <div className="bg-white border border-blue-100 rounded-xl p-3 text-center shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wide text-blue-500 mb-1">Baterías $</p>
          <p className="text-xl font-black text-slate-900">${totalBaterias.toLocaleString("es-AR")}</p>
        </div>
      </div>

      {/* Entregas de batería activas */}
      {activeSales.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Battery className="h-4 w-4 text-blue-500" />
            <h3 className="font-black text-xs uppercase tracking-widest text-slate-500">Entregas de Batería</h3>
            <span className="bg-blue-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
              {activeSales.length}
            </span>
          </div>
          {activeSales.map((sale) => (
            <ActiveBatterySaleCard
              key={sale.id}
              sale={sale}
              onStatusChange={(status) => handleSaleStatusChange(sale, status)}
              onClose={() => setClosingSale(sale)}
            />
          ))}
        </div>
      )}

      {/* Activos */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Car className="h-4 w-4 text-slate-500" />
          <h3 className="font-black text-xs uppercase tracking-widest text-slate-500">Viajes Activos</h3>
          {activeServices.length > 0 && (
            <span className="bg-yellow-400 text-black text-[10px] font-black px-2 py-0.5 rounded-full">
              {activeServices.length}
            </span>
          )}
        </div>
        {activeServices.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center">
            <p className="font-bold text-slate-300 text-sm">Sin viajes activos</p>
          </div>
        ) : (
          activeServices.map((service) => (
            <ActiveServiceCard key={service.id} service={service}
              onStatusChange={(status) => handleStatusChange(service, status)}
              onClose={() => setClosingService(service)} />
          ))
        )}
      </div>

      {completedToday.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <h3 className="font-black text-xs uppercase tracking-widest text-slate-500">Finalizados Hoy</h3>
            <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">{completedToday.length}</span>
          </div>
          {completedToday.map((service) => <CompletedServiceCard key={service.id} service={service} />)}
        </div>
      )}

      {completedSalesToday.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Battery className="h-4 w-4 text-blue-500" />
            <h3 className="font-black text-xs uppercase tracking-widest text-slate-500">Baterías Entregadas Hoy</h3>
            <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">{completedSalesToday.length}</span>
          </div>
          {completedSalesToday.map((sale) => <BatterySaleCard key={sale.id} sale={sale} />)}
        </div>
      )}

      <CloseServiceDialog service={closingService} open={!!closingService}
        onOpenChange={(open) => !open && setClosingService(null)} />
      <CloseBatterySaleDialog sale={closingSale} open={!!closingSale}
        onOpenChange={(open) => !open && setClosingSale(null)} />
    </div>
  );
}

// ─── Componente principal exportado ──────────────────────────────────────────
// mode="rider"  → pantalla de login + vista individual (para /rider)
// mode="admin"  → tabs con todos los riders (para el panel admin)

export function RiderView({
  mode = "rider",
  preselectedRider,
  onLogout,
}: {
  mode?: "rider" | "admin";
  preselectedRider?: RiderName;
  onLogout?: () => void;
}) {
  const riders = useAvexStore((state) => state.riders);
  const riderColors = useAvexStore((state) => state.riderColors);
  const [selectedRider, setSelectedRider] = useState<RiderName | null>(preselectedRider ?? null);
  const [activeTab, setActiveTab] = useState<RiderName>(() => riders[0]?.nombre ?? "");
  const [adminView, setAdminView] = useState<"cola" | "detalle">("cola");

  // ── Modo rider: login + vista propia ──
  if (mode === "rider") {
    if (!selectedRider) {
      return <RiderLoginScreen onSelect={setSelectedRider} />;
    }
    return (
      <RiderPanel
        rider={selectedRider}
        onLogout={onLogout ?? (preselectedRider ? undefined : () => setSelectedRider(null))}
      />
    );
  }

  // ── Modo admin: toggle cola / detalle ──
  return (
    <div>
      {/* Toggle de vista */}
      <div className="flex items-center gap-2 mb-5">
        <button
          onClick={() => setAdminView("cola")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm font-bold transition-all duration-150 ${
            adminView === "cola"
              ? "bg-[#1C2333] border-[#1C2333] text-white shadow-md"
              : "bg-white border-slate-200 text-slate-400 hover:border-slate-300"
          }`}
        >
          <LayoutList className="h-4 w-4" />
          Vista Cola
        </button>
        <button
          onClick={() => setAdminView("detalle")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm font-bold transition-all duration-150 ${
            adminView === "detalle"
              ? "bg-[#1C2333] border-[#1C2333] text-white shadow-md"
              : "bg-white border-slate-200 text-slate-400 hover:border-slate-300"
          }`}
        >
          <TableProperties className="h-4 w-4" />
          Vista Detalle
        </button>
      </div>

      {adminView === "cola" ? (
        <QueueBoard />
      ) : (
        <div>
          {/* Selector de riders */}
          <div className="flex gap-2 mb-5">
            {riders.map((rider) => {
              const isActive = activeTab === rider.nombre;
              const color = rider.color || riderColors[rider.nombre] || "#888";
              return (
                <button key={rider.nombre} onClick={() => setActiveTab(rider.nombre)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm font-bold transition-all duration-150 ${
                    isActive ? "scale-[1.02] shadow-md" : "bg-white border-slate-200 text-slate-400 hover:border-slate-300"
                  }`}
                  style={isActive ? {
                    backgroundColor: color + "15",
                    borderColor: color,
                    color,
                    boxShadow: `0 4px 12px ${color}30`,
                  } : {}}
                >
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: isActive ? color : "#cbd5e1" }} />
                  {rider.nombre}
                </button>
              );
            })}
          </div>
          <AdminRiderPanel rider={activeTab} />
        </div>
      )}
    </div>
  );
}