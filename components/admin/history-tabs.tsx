"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAvexStore } from "@/lib/store";
import type { Service } from "@/lib/types";
import { getCurrentMoment, getGoogleMapsUrl, formatCurrency } from "@/lib/helpers";
import {
  Trash2, Edit, MapPin, Calendar, Search,
  Clock, Car, User, CreditCard, FileText,
  ChevronRight, X, Battery, TrendingUp,
  CheckCircle, XCircle, AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { EditServiceDialog } from "@/components/services/edit-service-dialog";

// ─── Helpers visuales ─────────────────────────────────────────────────────────

function getStatusStyle(service: Service) {
  if (service.estado === "Cancelado" || service.cobro === "Cancelado")
    return { dot: "bg-slate-400", border: "border-l-slate-300", badge: "bg-slate-100 text-slate-600", label: "Cancelado" };
  if (service.cobro === "No pagó")
    return { dot: "bg-red-400", border: "border-l-red-400", badge: "bg-red-50 text-red-600", label: "No pagó" };
  return { dot: "bg-green-400", border: "border-l-green-400", badge: "bg-green-50 text-green-700", label: service.cobro || "Pagado" };
}

function TimeRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
      <span className="text-xs text-slate-400 font-medium">{label}</span>
      <span className={`text-xs font-bold ${value ? "text-slate-800" : "text-slate-300"}`}>
        {value || "—"}
      </span>
    </div>
  );
}

// ─── Modal de detalle ─────────────────────────────────────────────────────────

function ServiceDetailModal({
  service,
  open,
  onClose,
  onEdit,
  onDelete,
}: {
  service: Service | null;
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const riderColors = useAvexStore((state) => state.riderColors);
  if (!service) return null;

  const status = getStatusStyle(service);
  const autoText = [service.marca, service.modelo].filter(Boolean).join(" ") || "Vehículo sin registrar";
  const riderColor = riderColors[service.rider] || "#888";

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg p-0 overflow-hidden bg-white border border-slate-200 rounded-2xl">

        {/* Header del modal */}
        <div className="bg-[#1C2333] px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${status.badge}`}>
                  {status.label}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">{service.tipo}</span>
              </div>
              <h2 className="text-white font-black text-lg leading-tight">
                {service.cliente || "Sin nombre"}
              </h2>
              <p className="text-slate-400 text-xs mt-0.5">{service.fechaVisual}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">Monto</p>
              <p className="text-2xl font-black text-yellow-400 leading-none">
                ${service.monto.toLocaleString("es-AR")}
              </p>
              {service.cobro && (
                <p className="text-[10px] text-slate-400 mt-0.5">{service.cobro}</p>
              )}
            </div>
          </div>
        </div>

        <div className="p-5 space-y-5 max-h-[60vh] overflow-y-auto">

          {/* Vehículo + cliente */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
              Cliente y vehículo
            </p>
            <div className="flex items-center gap-2">
              <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="text-sm text-slate-700 font-medium">{service.cliente || "Sin nombre"}</span>
              {service.celular && (
                <span className="text-xs text-slate-400 ml-auto">{service.celular}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Car className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="text-sm text-slate-700 font-medium">{autoText}</span>
              {service.patente && (
                <span className="bg-slate-900 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded tracking-widest ml-auto">
                  {service.patente}
                </span>
              )}
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="h-3.5 w-3.5 text-yellow-500 shrink-0 mt-0.5" />
              <span className="text-sm text-slate-700 font-medium flex-1">{service.direccion}</span>
              <button
                onClick={() => window.open(getGoogleMapsUrl(service.direccion), "_blank")}
                className="text-[10px] font-bold text-yellow-600 hover:text-yellow-700 shrink-0 ml-2 underline"
              >
                Ver mapa
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 shrink-0 flex items-center justify-center">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: riderColor }} />
              </span>
              <span className="text-sm text-slate-700 font-medium">{service.rider}</span>
              <Badge variant="outline" className="text-[10px] ml-auto">{service.aseguradora}</Badge>
            </div>
          </div>

          {/* Tiempos */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
              Tiempos del servicio
            </p>
            <TimeRow label="Creación" value={service.tiempos?.creado} />
            <TimeRow label="Salió en camino" value={service.tiempos?.camino} />
            <TimeRow label="Llegó al lugar" value={service.tiempos?.llegada} />
            <TimeRow label="Finalización" value={service.tiempos?.fin} />
          </div>

          {/* Pago */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
              Cobro
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-700">
                  {service.cobro || "Sin registrar"}
                </span>
              </div>
              <span className="text-xl font-black text-slate-900">
                ${service.monto.toLocaleString("es-AR")}
              </span>
            </div>
            {service.obs && (
              <div className="mt-3 pt-3 border-t border-slate-200 flex items-start gap-2">
                <FileText className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-600">{service.obs}</p>
              </div>
            )}
          </div>

          {/* Firma */}
          {service.firma && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
                Firma del cliente
              </p>
              <img src={service.firma} alt="Firma" className="border bg-white rounded-lg max-h-24 shadow-sm" />
            </div>
          )}
        </div>

        {/* Footer con acciones */}
        <div className="px-5 py-4 border-t border-slate-100 flex gap-2">
          <button
            onClick={onDelete}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-red-200 text-red-500 text-sm font-bold hover:bg-red-50 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Eliminar
          </button>
          <button
            onClick={onEdit}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#1C2333] text-white text-sm font-bold hover:bg-slate-800 transition-colors"
          >
            <Edit className="h-4 w-4" />
            Editar servicio
          </button>
        </div>

      </DialogContent>
    </Dialog>
  );
}

// ─── Fila de servicio en la lista ─────────────────────────────────────────────

function ServiceRow({ service, onClick }: { service: Service; onClick: () => void }) {
  const riderColors = useAvexStore((state) => state.riderColors);
  const status = getStatusStyle(service);
  const autoText = [service.marca, service.modelo].filter(Boolean).join(" ") || "Vehículo sin registrar";
  const riderColor = riderColors[service.rider] || "#888";

  return (
    <button
      onClick={onClick}
      className={`w-full bg-white border border-slate-200 border-l-4 ${status.border} rounded-xl px-4 py-3 flex items-center gap-3 hover:shadow-md hover:border-slate-300 active:scale-[0.99] transition-all text-left group`}
    >
      {/* Dot de estado */}
      <div className={`w-2 h-2 rounded-full shrink-0 ${status.dot}`} />

      {/* Info principal */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-black text-sm text-slate-900 truncate">{service.cliente || "Sin nombre"}</span>
          <span className="text-[10px] text-slate-400 shrink-0">{service.fechaVisual}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 truncate">{autoText}</span>
          {service.patente && (
            <span className="font-mono text-[10px] text-slate-400 shrink-0">{service.patente}</span>
          )}
        </div>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: riderColor }} />
          <span className="text-[10px] text-slate-400">{service.rider}</span>
          <span className="text-[10px] text-slate-300 mx-1">·</span>
          <span className="text-[10px] text-slate-400">{service.tipo}</span>
        </div>
      </div>

      {/* Monto + flecha */}
      <div className="text-right shrink-0 flex items-center gap-2">
        <div>
          <p className={`font-black text-sm ${
            status.label === "No pagó" ? "text-red-500" :
            status.label === "Cancelado" ? "text-slate-400" : "text-slate-900"
          }`}>
            ${service.monto.toLocaleString("es-AR")}
          </p>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${status.badge}`}>
            {status.label}
          </span>
        </div>
        <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
      </div>
    </button>
  );
}

// ─── Historial de servicios ───────────────────────────────────────────────────

export function ServicesHistoryTab() {
  const servicios = useAvexStore((state) => state.servicios);
  const deleteService = useAvexStore((state) => state.deleteService);

  const [filterMonth, setFilterMonth] = useState("");
  const [filterRider, setFilterRider] = useState("");
  const [searchText, setSearchText] = useState("");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deletingServiceId, setDeletingServiceId] = useState<string | null>(null);

  const completedServices = useMemo(() =>
    Object.values(servicios).filter(
      (s) => s.estado === "Finalizado" || s.estado === "Cancelado"
    ), [servicios]
  );

  const filtered = useMemo(() => {
    return completedServices
      .filter((s) => {
        if (filterMonth) {
          const month = s.fechaFinInput?.substring(0, 7) || s.fechaInput?.substring(0, 7) || "";
          if (month !== filterMonth) return false;
        }
        if (filterRider && s.rider !== filterRider) return false;
        if (searchText) {
          const q = searchText.toLowerCase();
          const haystack = [s.cliente, s.patente, s.direccion, s.marca, s.modelo].join(" ").toLowerCase();
          if (!haystack.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => (b.orden || 0) - (a.orden || 0));
  }, [completedServices, filterMonth, filterRider, searchText]);

  // Stats resumen
  const totalCobrado = filtered
    .filter((s) => s.cobro !== "Cancelado" && s.cobro !== "No pagó" && s.estado !== "Cancelado")
    .reduce((sum, s) => sum + (s.monto || 0), 0);
  const totalCancelados = filtered.filter((s) => s.estado === "Cancelado" || s.cobro === "Cancelado").length;
  const totalNoPago = filtered.filter((s) => s.cobro === "No pagó").length;

  const uniqueRiders = [...new Set(completedServices.map((s) => s.rider))];

  const handleDelete = () => {
    if (deletingServiceId) {
      deleteService(deletingServiceId);
      toast.success("Servicio eliminado");
      setDeletingServiceId(null);
      setSelectedService(null);
    }
  };

  const handleFilterToday = () => {
    setFilterMonth(getCurrentMoment().fechaInput.substring(0, 7));
  };

  return (
    <>
      <div className="space-y-4">

        {/* Header + stats */}
        <div className="bg-[#1C2333] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-white font-black text-lg leading-none">Historial de Servicios</h4>
              <p className="text-slate-400 text-xs mt-0.5">{filtered.length} registros encontrados</p>
            </div>
            <button
              onClick={handleFilterToday}
              className="flex items-center gap-1.5 bg-yellow-400 text-black text-xs font-black px-3 py-2 rounded-lg hover:bg-yellow-300 transition-colors"
            >
              <Calendar className="h-3.5 w-3.5" />
              Este mes
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">Total cobrado</p>
              <p className="text-lg font-black text-yellow-400">${totalCobrado.toLocaleString("es-AR")}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">Cancelados</p>
              <p className="text-lg font-black text-slate-300">{totalCancelados}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">No pagaron</p>
              <p className="text-lg font-black text-red-400">{totalNoPago}</p>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-2">
          {/* Búsqueda */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Buscar cliente, patente, dirección..."
              className="pl-8 h-9 bg-white border-slate-300 text-slate-800 placeholder:text-slate-400 text-sm rounded-lg focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
            />
          </div>

          {/* Mes */}
          <Input
            type="month"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="h-9 w-auto bg-white border-slate-300 text-slate-700 text-sm rounded-lg focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
          />

          {/* Rider */}
          <select
            value={filterRider}
            onChange={(e) => setFilterRider(e.target.value)}
            className="h-9 px-3 bg-white border border-slate-300 text-slate-700 text-sm rounded-lg focus:border-yellow-400 focus:outline-none"
          >
            <option value="">Todos los riders</option>
            {uniqueRiders.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>

          {/* Limpiar */}
          {(filterMonth || filterRider || searchText) && (
            <button
              onClick={() => { setFilterMonth(""); setFilterRider(""); setSearchText(""); }}
              className="h-9 px-3 flex items-center gap-1.5 bg-slate-100 border border-slate-300 text-slate-500 text-xs font-bold rounded-lg hover:bg-slate-200 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
              Limpiar
            </button>
          )}
        </div>

        {/* Lista */}
        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
          {filtered.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center">
              <Search className="h-8 w-8 text-slate-200 mx-auto mb-2" />
              <p className="font-bold text-slate-400">Sin resultados</p>
              <p className="text-xs text-slate-300 mt-1">Probá cambiando los filtros</p>
            </div>
          ) : (
            filtered.map((service) => (
              <ServiceRow
                key={service.id}
                service={service}
                onClick={() => setSelectedService(service)}
              />
            ))
          )}
        </div>
      </div>

      {/* Modal detalle */}
      <ServiceDetailModal
        service={selectedService}
        open={!!selectedService}
        onClose={() => setSelectedService(null)}
        onEdit={() => {
          setEditingService(selectedService);
          setSelectedService(null);
        }}
        onDelete={() => {
          if (selectedService) setDeletingServiceId(selectedService.id);
        }}
      />

      <EditServiceDialog
        service={editingService}
        open={!!editingService}
        onOpenChange={(open) => !open && setEditingService(null)}
      />

      <AlertDialog open={!!deletingServiceId} onOpenChange={(open) => !open && setDeletingServiceId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar servicio</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente este servicio del historial.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 text-white hover:bg-red-600">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ─── Historial de baterías (sin cambios mayores, solo estilo) ─────────────────

export function BatteriesHistoryTab() {
  const historiales = useAvexStore((state) => state.historiales);
  const deleteSale = useAvexStore((state) => state.deleteSale);
  const deletePurchase = useAvexStore((state) => state.deletePurchase);

  const [expandedSale, setExpandedSale] = useState<number | null>(null);
  const [expandedPurchase, setExpandedPurchase] = useState<number | null>(null);
  const [deletingItem, setDeletingItem] = useState<{ type: "sale" | "purchase"; index: number } | null>(null);
  const [searchSale, setSearchSale] = useState("");

  const handleDelete = () => {
    if (!deletingItem) return;
    if (deletingItem.type === "sale") deleteSale(deletingItem.index);
    else deletePurchase(deletingItem.index);
    toast.success("Registro eliminado");
    setDeletingItem(null);
  };

  const reversedSales = [...historiales.ventas].reverse().filter((s) => {
    if (!searchSale) return true;
    const q = searchSale.toLowerCase();
    return [s.cliente, s.patente, s.modeloBat, s.autoTexto].join(" ").toLowerCase().includes(q);
  });
  const reversedPurchases = [...historiales.compras].reverse();

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Ventas */}
        <div>
          <div className="bg-[#1C2333] rounded-2xl p-4 mb-3">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Battery className="h-4 w-4 text-yellow-400" />
                <h5 className="text-white font-black text-sm">Ventas de Baterías</h5>
              </div>
              <span className="bg-yellow-400 text-black text-[10px] font-black px-2 py-0.5 rounded-full">
                {historiales.ventas.length}
              </span>
            </div>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
              <input
                value={searchSale}
                onChange={(e) => setSearchSale(e.target.value)}
                placeholder="Buscar..."
                className="w-full pl-7 pr-3 py-1.5 bg-white/10 border border-white/10 text-white placeholder:text-slate-500 text-xs rounded-lg focus:outline-none focus:border-yellow-400"
              />
            </div>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {reversedSales.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center">
                <p className="font-bold text-slate-300 text-sm">Sin ventas registradas</p>
              </div>
            ) : (
              reversedSales.map((sale, idx) => {
                const realIndex = historiales.ventas.length - 1 - idx;
                const isOpen = expandedSale === idx;
                return (
                  <div key={idx} className="bg-white border border-slate-200 border-l-4 border-l-blue-400 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setExpandedSale(isOpen ? null : idx)}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left"
                    >
                      <Battery className="h-4 w-4 text-blue-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-slate-900 truncate">{sale.autoTexto}</p>
                        <p className="text-xs text-slate-400">{sale.modeloBat} · {sale.fechaVisual}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-black text-sm text-slate-900">${sale.total?.toLocaleString("es-AR")}</p>
                        <ChevronRight className={`h-3.5 w-3.5 text-slate-300 ml-auto transition-transform ${isOpen ? "rotate-90" : ""}`} />
                      </div>
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-3 pt-2 border-t border-slate-100 bg-slate-50">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mb-3">
                          <p><span className="text-slate-400">Cliente:</span> <span className="font-bold text-slate-700">{sale.cliente}</span></p>
                          <p><span className="text-slate-400">Patente:</span> <span className="font-mono font-bold text-slate-700 uppercase">{sale.patente || "—"}</span></p>
                          <p><span className="text-slate-400">Costo lote:</span> <span className="font-bold text-slate-700">${sale.costoLote}</span></p>
                          <p><span className="text-slate-400">Pago:</span> <span className="font-bold text-slate-700">{sale.metodoPago}</span></p>
                          <p><span className="text-slate-400">Rider:</span> <span className="font-bold text-slate-700">{sale.rider}</span></p>
                          <p><span className="text-slate-400">Lote:</span> <span className="font-bold text-slate-700">#{sale.loteUsado}</span></p>
                        </div>
                        <button
                          onClick={() => setDeletingItem({ type: "sale", index: realIndex })}
                          className="flex items-center gap-1.5 text-red-400 text-xs font-bold hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Compras */}
        <div>
          <div className="bg-[#1C2333] rounded-2xl p-4 mb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-yellow-400" />
                <h5 className="text-white font-black text-sm">Compras de Stock</h5>
              </div>
              <span className="bg-white/20 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                {historiales.compras.length}
              </span>
            </div>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {reversedPurchases.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center">
                <p className="font-bold text-slate-300 text-sm">Sin compras registradas</p>
              </div>
            ) : (
              reversedPurchases.map((purchase, idx) => {
                const realIndex = historiales.compras.length - 1 - idx;
                const isOpen = expandedPurchase === idx;
                return (
                  <div key={idx} className="bg-white border border-slate-200 border-l-4 border-l-yellow-400 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setExpandedPurchase(isOpen ? null : idx)}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left"
                    >
                      <TrendingUp className="h-4 w-4 text-yellow-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-slate-900">Ingreso de mercadería</p>
                        <p className="text-xs text-slate-400">{purchase.fechaVisual}</p>
                      </div>
                      <div className="text-right shrink-0 flex items-center gap-2">
                        <p className="font-black text-sm text-red-500">-${purchase.totalCompra?.toLocaleString("es-AR")}</p>
                        <ChevronRight className={`h-3.5 w-3.5 text-slate-300 transition-transform ${isOpen ? "rotate-90" : ""}`} />
                      </div>
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-3 pt-2 border-t border-slate-100 bg-slate-50">
                        <div
                          className="text-xs text-slate-600 mb-3"
                          dangerouslySetInnerHTML={{ __html: purchase.detallesHtml || "Sin detalles" }}
                        />
                        <button
                          onClick={() => setDeletingItem({ type: "purchase", index: realIndex })}
                          className="flex items-center gap-1.5 text-red-400 text-xs font-bold hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <AlertDialog open={!!deletingItem} onOpenChange={(open) => !open && setDeletingItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar registro</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará este registro. El stock NO se modificará automáticamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 text-white hover:bg-red-600">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}