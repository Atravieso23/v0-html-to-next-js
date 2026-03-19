"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { useAvexStore, selectCompletedServices } from "@/lib/store";
import type { Service } from "@/lib/types";
import { getCurrentMoment, getGoogleMapsUrl } from "@/lib/helpers";
import {
  ChevronDown,
  ChevronUp,
  Trash2,
  Edit,
  MapPin,
  Calendar,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import { EditServiceDialog } from "@/components/services/edit-service-dialog";

function ServiceHistoryItem({
  service,
  onEdit,
  onDelete,
}: {
  service: Service;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const getBorderClass = () => {
    if (service.estado === "Cancelado" || service.cobro === "Cancelado") return "border-l-muted-foreground";
    if (service.cobro === "No pagó") return "border-l-destructive";
    return "border-l-green-500";
  };

  const getBadgeVariant = () => {
    if (service.estado === "Cancelado" || service.cobro === "Cancelado") return "secondary";
    if (service.cobro === "No pagó") return "destructive";
    return "default";
  };

  const autoText = [service.marca, service.modelo].filter(Boolean).join(" ") || "Auto sin registrar";

  return (
    <Card className={`border-0 border-l-4 ${getBorderClass()} shadow-sm mb-2 hover:bg-muted/30 transition-colors`}>
      <div className="p-3 flex justify-between items-center">
        <div className="flex-1 min-w-0 pr-2">
          <span className="text-muted-foreground text-sm font-bold mr-2">{service.fechaVisual}</span>
          <span className="font-bold">{autoText}</span>
          <span className="text-muted-foreground text-sm ml-2 truncate">- {service.direccion}</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={getBadgeVariant()} className="text-xs">
            {service.estado === "Cancelado" ? "Cancelado" : service.cobro || ""}
          </Badge>
          <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)} className="px-2">
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={onDelete} className="text-destructive h-8 w-8">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {expanded && (
        <div className="px-3 pb-3 pt-0 border-t bg-card">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm py-3">
            <div>
              <p><strong>Cliente:</strong> {service.cliente || "Desconocido"}</p>
              <p><strong>Vehiculo:</strong> {service.marca} {service.modelo} ({service.patente || ""})</p>
              <p><strong>Rider:</strong> {service.rider}</p>
              <p><strong>Aseguradora:</strong> <Badge variant="secondary">{service.aseguradora || "Avex"}</Badge></p>
              <p className="flex items-center gap-1">
                <strong>Direccion:</strong> {service.direccion}
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-2 h-6 px-2"
                  onClick={() => window.open(getGoogleMapsUrl(service.direccion), "_blank")}
                >
                  <MapPin className="h-3 w-3 mr-1" />
                  Maps
                </Button>
              </p>
              <p><strong>A cobrar:</strong> <span className="text-green-600 font-bold">${service.monto}</span></p>
              <p className={service.cobro === "No pagó" ? "text-destructive font-bold" : ""}>
                <strong>Obs:</strong> {service.obs || "Ninguna"}
              </p>
              {service.firma && (
                <div className="mt-2 pt-2 border-t">
                  <strong className="text-muted-foreground text-xs">Firma del Cliente:</strong>
                  <img src={service.firma} alt="Firma" className="border bg-white rounded mt-1 shadow-sm max-h-20" />
                </div>
              )}
            </div>
            <div className="text-muted-foreground text-right">
              <p>Creacion: <strong className="text-foreground">{service.tiempos?.creado}</strong></p>
              <p>En camino: <strong className="text-foreground">{service.tiempos?.camino || "-"}</strong></p>
              <p>Llegada: <strong className="text-foreground">{service.tiempos?.llegada || "-"}</strong></p>
              <p>Finalizacion: <strong className="text-foreground">{service.tiempos?.fin || "-"}</strong></p>
              <Button variant="outline" size="sm" onClick={onEdit} className="mt-4 font-bold">
                <Edit className="h-4 w-4 mr-1" />
                Editar
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

export function ServicesHistoryTab() {
  const completedServices = useAvexStore(selectCompletedServices);
  const deleteService = useAvexStore((state) => state.deleteService);
  
  const [filterMonth, setFilterMonth] = useState("");
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deletingServiceId, setDeletingServiceId] = useState<string | null>(null);

  const filteredServices = completedServices.filter((s) => {
    if (!filterMonth) return true;
    const serviceMonth = s.fechaFinInput?.substring(0, 7) || "";
    return serviceMonth === filterMonth;
  }).sort((a, b) => (b.orden || 0) - (a.orden || 0));

  const handleDelete = () => {
    if (deletingServiceId) {
      deleteService(deletingServiceId);
      toast.success("Servicio eliminado");
      setDeletingServiceId(null);
    }
  };

  const handleFilterToday = () => {
    const today = getCurrentMoment().fechaInput;
    // We'll show all from current month when clicking "Hoy"
    setFilterMonth(today.substring(0, 7));
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h4 className="font-bold text-xl">Historial de Servicios</h4>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleFilterToday} className="font-bold">
              <Calendar className="h-4 w-4 mr-1" />
              Hoy
            </Button>
            <Input
              type="month"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="w-auto"
              placeholder="Filtrar mes"
            />
            {filterMonth && (
              <Button variant="ghost" size="sm" onClick={() => setFilterMonth("")}>
                <Filter className="h-4 w-4 mr-1" />
                Limpiar
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-2 max-h-[600px] overflow-y-auto scrollbar-thin">
          {filteredServices.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground border-dashed">
              No hay servicios finalizados
            </Card>
          ) : (
            filteredServices.map((service) => (
              <ServiceHistoryItem
                key={service.id}
                service={service}
                onEdit={() => setEditingService(service)}
                onDelete={() => setDeletingServiceId(service.id)}
              />
            ))
          )}
        </div>
      </div>

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
              Esta accion eliminara permanentemente este servicio del historial.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function BatteriesHistoryTab() {
  const historiales = useAvexStore((state) => state.historiales);
  const deleteSale = useAvexStore((state) => state.deleteSale);
  const deletePurchase = useAvexStore((state) => state.deletePurchase);

  const [expandedSale, setExpandedSale] = useState<number | null>(null);
  const [expandedPurchase, setExpandedPurchase] = useState<number | null>(null);
  const [deletingItem, setDeletingItem] = useState<{ type: "sale" | "purchase"; index: number } | null>(null);

  const handleDelete = () => {
    if (!deletingItem) return;
    
    if (deletingItem.type === "sale") {
      deleteSale(deletingItem.index);
    } else {
      deletePurchase(deletingItem.index);
    }
    
    toast.success("Registro eliminado");
    setDeletingItem(null);
  };

  const reversedSales = [...historiales.ventas].reverse();
  const reversedPurchases = [...historiales.compras].reverse();

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales History */}
        <div>
          <h5 className="font-bold text-lg mb-3 flex items-center gap-2">
            Ventas de Baterias
            <Badge variant="secondary">{historiales.ventas.length}</Badge>
          </h5>
          <div className="space-y-2 max-h-[500px] overflow-y-auto scrollbar-thin">
            {reversedSales.length === 0 ? (
              <Card className="p-8 text-center text-muted-foreground border-dashed">
                No hay ventas registradas
              </Card>
            ) : (
              reversedSales.map((sale, idx) => {
                const realIndex = historiales.ventas.length - 1 - idx;
                return (
                  <Card key={idx} className="border-0 border-l-4 border-l-cyan-500 shadow-sm">
                    <div className="p-3 flex justify-between items-center">
                      <div className="flex-1 min-w-0">
                        <span className="text-muted-foreground text-sm font-bold mr-2">{sale.fechaVisual}</span>
                        <span className="font-bold">{sale.autoTexto}</span>
                        <Badge variant="outline" className="ml-2 text-xs">{sale.modeloBat}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">Lote #{sale.loteUsado}</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedSale(expandedSale === idx ? null : idx)}
                          className="px-2"
                        >
                          {expandedSale === idx ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletingItem({ type: "sale", index: realIndex })}
                          className="text-destructive h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {expandedSale === idx && (
                      <div className="px-3 pb-3 border-t text-sm">
                        <div className="grid grid-cols-2 gap-2 pt-2">
                          <p><strong>Cliente:</strong> {sale.cliente}</p>
                          <p><strong>Patente:</strong> <span className="uppercase font-bold text-blue-600">{sale.patente || "Sin registrar"}</span></p>
                          <p><strong>Costo Lote:</strong> ${sale.costoLote}</p>
                          <p><strong>Pago:</strong> <Badge variant="outline">{sale.metodoPago}</Badge></p>
                          <p><strong>Rider:</strong> {sale.rider}</p>
                          <p className="text-green-600 font-bold text-lg">Total: ${sale.total}</p>
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })
            )}
          </div>
        </div>

        {/* Purchases History */}
        <div>
          <h5 className="font-bold text-lg mb-3 flex items-center gap-2">
            Compras de Stock
            <Badge variant="secondary">{historiales.compras.length}</Badge>
          </h5>
          <div className="space-y-2 max-h-[500px] overflow-y-auto scrollbar-thin">
            {reversedPurchases.length === 0 ? (
              <Card className="p-8 text-center text-muted-foreground border-dashed">
                No hay compras registradas
              </Card>
            ) : (
              reversedPurchases.map((purchase, idx) => {
                const realIndex = historiales.compras.length - 1 - idx;
                return (
                  <Card key={idx} className="border-0 border-l-4 border-l-primary shadow-sm">
                    <div className="p-3 flex justify-between items-center">
                      <div>
                        <span className="text-muted-foreground text-sm font-bold mr-2">{purchase.fechaVisual}</span>
                        <span className="font-bold">Ingreso Mercaderia</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-destructive">-${purchase.totalCompra}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedPurchase(expandedPurchase === idx ? null : idx)}
                          className="px-2"
                        >
                          {expandedPurchase === idx ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletingItem({ type: "purchase", index: realIndex })}
                          className="text-destructive h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {expandedPurchase === idx && (
                      <div className="px-3 pb-3 border-t text-sm bg-muted/30">
                        <p className="font-bold pt-2 mb-1">Productos ingresados:</p>
                        <div
                          className="text-muted-foreground"
                          dangerouslySetInnerHTML={{ __html: purchase.detallesHtml || "Sin detalles" }}
                        />
                      </div>
                    )}
                  </Card>
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
              Esta accion eliminara este registro. El stock NO se modificara automaticamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
