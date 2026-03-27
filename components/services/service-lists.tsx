"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { useAvexStore } from "@/lib/store";
import type { Service, ServiceStatus } from "@/lib/types";
import { getCurrentMoment, getGoogleMapsUrl, getWhatsAppUrl, inputToVisualDate } from "@/lib/helpers";
import {
  MoreVertical,
  Navigation,
  MapPin,
  CheckCircle,
  Phone,
  MessageCircle,
  Calendar,
  Clock,
  Play,
  Trash2,
  Edit,
} from "lucide-react";
import { EditServiceDialog } from "./edit-service-dialog";
import { CloseServiceDialog } from "./close-service-dialog";

function ServiceCard({
  service,
  onEdit,
  onClose,
  onDelete,
}: {
  service: Service;
  onEdit: () => void;
  onClose: () => void;
  onDelete: () => void;
}) {
  const updateService = useAvexStore((state) => state.updateService);
  const riderColors = useAvexStore((state) => state.riderColors);
  const riderColor = riderColors[service.rider] || "#666";

  const getStatusBadge = (estado: ServiceStatus) => {
    const variants: Record<ServiceStatus, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      Pendiente: { variant: "secondary", label: "Pendiente" },
      "En camino": { variant: "default", label: "En camino" },
      "En el lugar": { variant: "default", label: "En el lugar" },
      Programado: { variant: "outline", label: "Programado" },
      Finalizado: { variant: "default", label: "Finalizado" },
      Cancelado: { variant: "destructive", label: "Cancelado" },
    };
    return variants[estado] || variants.Pendiente;
  };

  const handleStatusChange = (newStatus: ServiceStatus) => {
    const momento = getCurrentMoment();
    const updates: Partial<Service> = { estado: newStatus };

    if (newStatus === "En camino") {
      updates.tiempos = { ...service.tiempos, camino: momento.completa };
    } else if (newStatus === "En el lugar") {
      updates.tiempos = { ...service.tiempos, llegada: momento.completa };
    }

    updateService(service.id, updates);
    toast.success(`Estado actualizado a: ${newStatus}`);
  };

  const badge = getStatusBadge(service.estado);
  const autoText = [service.marca, service.modelo].filter(Boolean).join(" ") || "Auto sin registrar";

  return (
    <Card
      className="p-4 border-0 border-l-4 shadow-sm transition-colors hover:bg-muted/50"
      style={{ borderLeftColor: riderColor }}
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-bold text-lg truncate">{service.cliente || "Sin nombre"}</span>
            <Badge variant={badge.variant} className="text-xs">
              {badge.label}
            </Badge>
          </div>

          <div className="text-sm text-muted-foreground space-y-1">
            <p className="flex items-center gap-1">
              <span className="font-medium">{autoText}</span>
              {service.patente && (
                <span className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                  {service.patente}
                </span>
              )}
            </p>
            <p className="flex items-center gap-1 truncate">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{service.direccion}</span>
            </p>
            <div className="flex items-center gap-3 text-xs">
              <span className="font-bold text-primary">{service.tipo}</span>
              <span className="font-bold text-green-600">${service.monto}</span>
              <span
                className="font-bold px-2 py-0.5 rounded text-white"
                style={{ backgroundColor: riderColor }}
              >
                {service.rider}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {service.estado === "Pendiente" && (
                <DropdownMenuItem onClick={() => handleStatusChange("En camino")}>
                  <Navigation className="h-4 w-4 mr-2" />
                  En camino
                </DropdownMenuItem>
              )}
              {service.estado === "En camino" && (
                <DropdownMenuItem onClick={() => handleStatusChange("En el lugar")}>
                  <MapPin className="h-4 w-4 mr-2" />
                  En el lugar
                </DropdownMenuItem>
              )}
              {service.estado !== "Finalizado" && service.estado !== "Cancelado" && (
                <DropdownMenuItem onClick={onClose}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Finalizar
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => window.open(getGoogleMapsUrl(service.direccion), "_blank")}
              >
                <MapPin className="h-4 w-4 mr-2" />
                Ver en Maps
              </DropdownMenuItem>
              {service.celular && (
                <>
                  <DropdownMenuItem
                    onClick={() => window.open(`tel:${service.celular}`, "_blank")}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Llamar
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      window.open(
                        getWhatsAppUrl(
                          service.celular!,
                          `Hola ${service.cliente}, somos de AVEX. El tecnico ya esta asignado a tu servicio.`
                        ),
                        "_blank"
                      )
                    }
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    WhatsApp
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <span className="text-xs text-muted-foreground">
            {service.tiempos.creado?.split(" - ")[1] || ""}
          </span>
        </div>
      </div>

      {service.notas && (
        <div className="mt-3 pt-3 border-t text-sm text-muted-foreground bg-muted/30 p-2 rounded">
          <strong>Notas:</strong> {service.notas}
        </div>
      )}
    </Card>
  );
}

function ScheduledServiceCard({
  service,
  onActivate,
  onDelete,
}: {
  service: Service;
  onActivate: () => void;
  onDelete: () => void;
}) {
  const riderColors = useAvexStore((state) => state.riderColors);
  const riderColor = riderColors[service.rider] || "#666";

  return (
    <Card className="p-3 border-0 border-l-4 border-l-muted-foreground/50 shadow-sm bg-muted/30">
      <div className="flex justify-between items-center gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="font-bold">
              {inputToVisualDate(service.fechaProgramada || "")}
            </span>
            <Clock className="h-4 w-4 text-muted-foreground ml-2" />
            <span className="font-bold">{service.horaProgramada}</span>
            <span
              className="text-xs font-bold px-2 py-0.5 rounded text-white ml-2"
              style={{ backgroundColor: riderColor }}
            >
              {service.rider}
            </span>
          </div>
          <p className="text-sm text-muted-foreground truncate mt-1">
            {service.cliente} - {service.direccion}
          </p>
        </div>

        <div className="flex gap-2">
          <Button size="sm" onClick={onActivate} className="btn-avex">
            <Play className="h-4 w-4 mr-1" />
            Activar
          </Button>
          <Button size="icon" variant="ghost" onClick={onDelete}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

export function ServiceLists() {
  const servicios = useAvexStore((state) => state.servicios);
  const updateService = useAvexStore((state) => state.updateService);
  const deleteService = useAvexStore((state) => state.deleteService);

  // Memoize filtered lists to prevent infinite re-renders
  const activeServices = useMemo(
    () =>
      Object.values(servicios).filter(
        (s) =>
          s.estado !== "Finalizado" &&
          s.estado !== "Cancelado" &&
          s.estado !== "Programado"
      ),
    [servicios]
  );

  const scheduledServices = useMemo(
    () => Object.values(servicios).filter((s) => s.estado === "Programado"),
    [servicios]
  );

  const [editingService, setEditingService] = useState<Service | null>(null);
  const [closingService, setClosingService] = useState<Service | null>(null);
  const [deletingServiceId, setDeletingServiceId] = useState<string | null>(null);

  const handleActivateScheduled = (service: Service) => {
    updateService(service.id, { estado: "Pendiente" });
    toast.success("Viaje activado correctamente");
  };

  const handleDelete = () => {
    if (deletingServiceId) {
      deleteService(deletingServiceId);
      toast.success("Servicio eliminado");
      setDeletingServiceId(null);
    }
  };

  return (
    <>
      {/* Servicios Programados */}
      <div className="mt-6">
        <h5 className="font-bold text-lg border-b-2 pb-2 mb-3 flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Servicios Programados
        </h5>
        <div className="flex flex-col gap-2 bg-card p-3 rounded-lg border shadow-sm min-h-[50px]">
          {scheduledServices.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-2">
              No hay viajes programados
            </p>
          ) : (
            scheduledServices.map((service) => (
              <ScheduledServiceCard
                key={service.id}
                service={service}
                onActivate={() => handleActivateScheduled(service)}
                onDelete={() => setDeletingServiceId(service.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* Servicios Activos */}
      <div className="mt-6">
        <h5 className="font-bold text-lg border-b-2 pb-2 mb-3 flex items-center gap-2">
          <Navigation className="h-5 w-5" />
          Servicios Activos (En la calle)
        </h5>
        <div className="flex flex-col gap-3">
          {activeServices.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-4 bg-card rounded-lg border">
              No hay servicios activos
            </p>
          ) : (
            activeServices.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onEdit={() => setEditingService(service)}
                onClose={() => setClosingService(service)}
                onDelete={() => setDeletingServiceId(service.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* Dialogs */}
      <EditServiceDialog
        service={editingService}
        open={!!editingService}
        onOpenChange={(open) => !open && setEditingService(null)}
      />

      <CloseServiceDialog
        service={closingService}
        open={!!closingService}
        onOpenChange={(open) => !open && setClosingService(null)}
      />

      <AlertDialog open={!!deletingServiceId} onOpenChange={(open) => !open && setDeletingServiceId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar servicio</AlertDialogTitle>
            <AlertDialogDescription>
              Estas seguro de que queres eliminar este servicio? Esta accion no se puede deshacer.
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
