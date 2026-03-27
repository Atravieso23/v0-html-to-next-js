"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useAvexStore } from "@/lib/store";
import {
  INSURANCE_PROVIDERS,
  SERVICE_TYPES,
  type Service,
  type ServiceStatus,
} from "@/lib/types";
import { getCurrentMoment, geocodeAddress } from "@/lib/helpers";

const STATUS_OPTIONS: ServiceStatus[] = [
  "Pendiente",
  "En camino",
  "En el lugar",
  "Programado",
  "Cancelado",
];

interface EditServiceDialogProps {
  service: Service | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditServiceDialog({ service, open, onOpenChange }: EditServiceDialogProps) {
  const updateService = useAvexStore((state) => state.updateService);
  const riders = useAvexStore((state) => state.riders);
  const [formData, setFormData] = useState<Partial<Service>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (service) {
      setFormData({ ...service });
    }
  }, [service]);

  const handleSubmit = async () => {
    if (!service) return;

    setIsSubmitting(true);

    try {
      const updates: Partial<Service> = {
        aseguradora: formData.aseguradora,
        cliente: formData.cliente,
        celular: formData.celular,
        marca: formData.marca,
        modelo: formData.modelo,
        patente: formData.patente?.toUpperCase(),
        direccion: formData.direccion,
        tipo: formData.tipo,
        monto: formData.monto,
        rider: formData.rider,
        notas: formData.notas,
        estado: formData.estado,
      };

      // Handle status changes
      if (formData.estado === "Cancelado" || formData.estado === "Finalizado") {
        updates.fechaFinInput = getCurrentMoment().fechaInput;
        if (formData.estado === "Cancelado") {
          updates.cobro = "Cancelado";
        }
      }

      // Geocode if address changed
      if (formData.direccion !== service.direccion) {
        const coords = await geocodeAddress(formData.direccion || "");
        if (coords) {
          updates.lat = coords.lat;
          updates.lng = coords.lng;
        }
      }

      updateService(service.id, updates);
      toast.success("Servicio actualizado correctamente");
      onOpenChange(false);
    } catch (error) {
      toast.error("Error al actualizar el servicio");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!service) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="bg-blue-600 text-white -mx-6 -mt-6 px-6 py-4 rounded-t-lg">
          <DialogTitle className="font-bold">Editar Servicio</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Aseguradora */}
          <div>
            <Label className="text-sm text-muted-foreground font-bold">Aseguradora / Origen</Label>
            <Select
              value={formData.aseguradora}
              onValueChange={(v) => setFormData((p) => ({ ...p, aseguradora: v as Service["aseguradora"] }))}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INSURANCE_PROVIDERS.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p === "Avex" ? "Particular (AVEX)" : p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm text-muted-foreground font-bold">Cliente</Label>
              <Input
                value={formData.cliente || ""}
                onChange={(e) => setFormData((p) => ({ ...p, cliente: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground font-bold">Celular</Label>
              <Input
                value={formData.celular || ""}
                onChange={(e) => setFormData((p) => ({ ...p, celular: e.target.value }))}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-sm text-muted-foreground font-bold">Marca</Label>
              <Input
                value={formData.marca || ""}
                onChange={(e) => setFormData((p) => ({ ...p, marca: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground font-bold">Modelo</Label>
              <Input
                value={formData.modelo || ""}
                onChange={(e) => setFormData((p) => ({ ...p, modelo: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground font-bold">Patente</Label>
              <Input
                value={formData.patente || ""}
                onChange={(e) => setFormData((p) => ({ ...p, patente: e.target.value.toUpperCase() }))}
                className="mt-1 uppercase"
              />
            </div>
          </div>

          <div>
            <Label className="text-sm text-muted-foreground font-bold">Direccion</Label>
            <Input
              value={formData.direccion || ""}
              onChange={(e) => setFormData((p) => ({ ...p, direccion: e.target.value }))}
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-sm text-muted-foreground font-bold">Servicio</Label>
              <Select
                value={formData.tipo}
                onValueChange={(v) => setFormData((p) => ({ ...p, tipo: v as Service["tipo"] }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground font-bold">Monto ($)</Label>
              <Input
                type="number"
                value={formData.monto || ""}
                onChange={(e) => setFormData((p) => ({ ...p, monto: parseFloat(e.target.value) || 0 }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground font-bold">Rider</Label>
              <Select
                value={formData.rider}
                onValueChange={(v) => setFormData((p) => ({ ...p, rider: v as Service["rider"] }))}
              >
                <SelectTrigger className="mt-1 border-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {riders.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-sm text-muted-foreground font-bold">Notas para el Rider</Label>
            <Textarea
              value={formData.notas || ""}
              onChange={(e) => setFormData((p) => ({ ...p, notas: e.target.value }))}
              rows={2}
              className="mt-1"
            />
          </div>

          <div className="p-3 bg-muted rounded-lg border border-destructive">
            <Label className="text-sm text-destructive font-bold">Modificar Estado del Viaje</Label>
            <Select
              value={formData.estado}
              onValueChange={(v) => setFormData((p) => ({ ...p, estado: v as ServiceStatus }))}
            >
              <SelectTrigger className="mt-1 border-destructive">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s === "Cancelado" ? "Cancelado / Falsa Alarma" : s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
            {isSubmitting ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
