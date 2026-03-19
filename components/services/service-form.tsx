"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
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
import { Switch } from "@/components/ui/switch";
import { Clipboard, MapPin } from "lucide-react";
import { toast } from "sonner";
import { useAvexStore } from "@/lib/store";
import {
  INSURANCE_PROVIDERS,
  SERVICE_TYPES,
  RIDERS,
  CAR_BRANDS,
  type InsuranceProvider,
  type ServiceType,
  type RiderName,
} from "@/lib/types";
import { getCurrentMoment, generateId, geocodeAddress, parseInsuranceText } from "@/lib/helpers";
import { PasteTextDialog } from "./paste-text-dialog";
import { MapPreviewDialog } from "./map-preview-dialog";

export function ServiceForm() {
  const addService = useAvexStore((state) => state.addService);
  const servicios = useAvexStore((state) => state.servicios);

  const [formData, setFormData] = useState({
    aseguradora: "Avex" as InsuranceProvider,
    cliente: "",
    celular: "",
    marca: "",
    modelo: "",
    patente: "",
    direccion: "",
    tipoServicio: "" as ServiceType | "",
    monto: "",
    riderAsignado: "" as RiderName | "",
    notas: "",
    esProgramado: false,
    fechaProgramada: "",
    horaProgramada: "",
  });

  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPasteDialog, setShowPasteDialog] = useState(false);
  const [showMapDialog, setShowMapDialog] = useState(false);

  const availableModels = CAR_BRANDS[formData.marca] || [];

  const handleSubmit = async () => {
    const newErrors: Record<string, boolean> = {};
    
    if (!formData.direccion) newErrors.direccion = true;
    if (!formData.tipoServicio) newErrors.tipoServicio = true;
    if (!formData.monto) newErrors.monto = true;
    if (!formData.riderAsignado) newErrors.riderAsignado = true;
    if (formData.esProgramado && (!formData.fechaProgramada || !formData.horaProgramada)) {
      toast.warning("Completa fecha y hora para agendar.");
      return;
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsSubmitting(true);

    try {
      const coords = await geocodeAddress(formData.direccion);
      const momento = getCurrentMoment();
      const id = generateId();
      const orden = Object.keys(servicios).length + 1;

      addService({
        id,
        aseguradora: formData.aseguradora,
        cliente: formData.cliente || "Sin nombre",
        celular: formData.celular,
        marca: formData.marca,
        modelo: formData.modelo,
        patente: formData.patente.toUpperCase(),
        direccion: formData.direccion,
        tipo: formData.tipoServicio as ServiceType,
        monto: parseFloat(formData.monto) || 0,
        rider: formData.riderAsignado as RiderName,
        notas: formData.notas,
        estado: formData.esProgramado ? "Programado" : "Pendiente",
        lat: coords?.lat,
        lng: coords?.lng,
        orden,
        tiempos: {
          creado: momento.completa,
        },
        fechaVisual: momento.fechaLegible,
        fechaInput: momento.fechaInput,
        esProgramado: formData.esProgramado,
        fechaProgramada: formData.fechaProgramada,
        horaProgramada: formData.horaProgramada,
      });

      toast.success(
        formData.esProgramado
          ? "Viaje programado correctamente"
          : `Viaje asignado a ${formData.riderAsignado}`
      );

      // Reset form
      setFormData({
        aseguradora: "Avex",
        cliente: "",
        celular: "",
        marca: "",
        modelo: "",
        patente: "",
        direccion: "",
        tipoServicio: "",
        monto: "",
        riderAsignado: "",
        notas: "",
        esProgramado: false,
        fechaProgramada: "",
        horaProgramada: "",
      });
    } catch (error) {
      toast.error("Error al crear el servicio");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasteData = (text: string) => {
    const parsed = parseInsuranceText(text);
    setFormData((prev) => ({
      ...prev,
      cliente: parsed.cliente || prev.cliente,
      celular: parsed.celular || prev.celular,
      direccion: parsed.direccion || prev.direccion,
      marca: parsed.marca || prev.marca,
      modelo: parsed.modelo || prev.modelo,
      patente: parsed.patente || prev.patente,
      tipoServicio: (parsed.tipoServicio as ServiceType) || prev.tipoServicio,
    }));
    toast.success("Datos autocompletados con exito");
  };

  return (
    <>
      <Card className="p-4 md:p-6 border-0 avex-border-yellow shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
          <h4 className="text-xl font-bold">Cargar Nuevo Servicio</h4>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPasteDialog(true)}
            className="font-bold"
          >
            <Clipboard className="h-4 w-4 mr-1" />
            Pegar texto del Seguro
          </Button>
        </div>

        <hr className="opacity-25 mb-4" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Aseguradora */}
          <div className="md:col-span-2 lg:col-span-4">
            <Label className="text-sm text-muted-foreground font-bold mb-2 block">
              Aseguradora u Origen
            </Label>
            <div className="flex flex-wrap gap-4 border p-3 rounded-lg bg-muted/50">
              {INSURANCE_PROVIDERS.map((provider) => (
                <label key={provider} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="aseguradora"
                    checked={formData.aseguradora === provider}
                    onChange={() => setFormData((p) => ({ ...p, aseguradora: provider }))}
                    className="accent-primary"
                  />
                  <span className="text-sm font-bold">
                    {provider === "Avex" ? "Particular (AVEX)" : provider}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Cliente */}
          <div>
            <Label className="text-sm text-muted-foreground font-bold">Nombre del cliente</Label>
            <Input
              value={formData.cliente}
              onChange={(e) => setFormData((p) => ({ ...p, cliente: e.target.value }))}
              className="bg-muted/50 mt-1"
            />
          </div>

          {/* Celular */}
          <div>
            <Label className="text-sm text-muted-foreground font-bold">Celular</Label>
            <Input
              value={formData.celular}
              onChange={(e) => setFormData((p) => ({ ...p, celular: e.target.value }))}
              placeholder="Ej: 11 1234-5678"
              className="bg-muted/50 mt-1"
            />
          </div>

          {/* Marca */}
          <div>
            <Label className="text-sm text-muted-foreground font-bold">Marca</Label>
            <Select
              value={formData.marca}
              onValueChange={(v) => setFormData((p) => ({ ...p, marca: v, modelo: "" }))}
            >
              <SelectTrigger className="bg-muted/50 mt-1">
                <SelectValue placeholder="Seleccionar..." />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(CAR_BRANDS).map((brand) => (
                  <SelectItem key={brand} value={brand}>
                    {brand}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Modelo */}
          <div>
            <Label className="text-sm text-muted-foreground font-bold">Modelo</Label>
            <Select
              value={formData.modelo}
              onValueChange={(v) => setFormData((p) => ({ ...p, modelo: v }))}
              disabled={!formData.marca}
            >
              <SelectTrigger className="bg-muted/50 mt-1">
                <SelectValue placeholder="Seleccionar..." />
              </SelectTrigger>
              <SelectContent>
                {availableModels.map((model) => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Patente */}
          <div>
            <Label className="text-sm text-muted-foreground font-bold">Patente</Label>
            <Input
              value={formData.patente}
              onChange={(e) => setFormData((p) => ({ ...p, patente: e.target.value.toUpperCase() }))}
              className="bg-muted/50 mt-1 uppercase"
            />
          </div>

          {/* Direccion */}
          <div className="md:col-span-2 lg:col-span-3">
            <Label className="text-sm text-muted-foreground font-bold">
              Direccion exacta <span className="text-destructive">*</span>
            </Label>
            <div className="flex gap-2 mt-1">
              <Input
                value={formData.direccion}
                onChange={(e) => {
                  setFormData((p) => ({ ...p, direccion: e.target.value }));
                  setErrors((e) => ({ ...e, direccion: false }));
                }}
                className={`flex-1 ${errors.direccion ? "border-destructive" : "border-foreground/20"}`}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => formData.direccion && setShowMapDialog(true)}
                disabled={!formData.direccion}
                className="px-3"
              >
                <MapPin className="h-4 w-4" />
              </Button>
            </div>
            {errors.direccion && (
              <span className="text-destructive text-sm font-bold">Requerido</span>
            )}
          </div>

          {/* Tipo de Servicio */}
          <div>
            <Label className="text-sm text-muted-foreground font-bold">
              Servicio <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.tipoServicio}
              onValueChange={(v) => {
                setFormData((p) => ({ ...p, tipoServicio: v as ServiceType }));
                setErrors((e) => ({ ...e, tipoServicio: false }));
              }}
            >
              <SelectTrigger className={`mt-1 ${errors.tipoServicio ? "border-destructive" : "border-foreground/20"}`}>
                <SelectValue placeholder="Elegir..." />
              </SelectTrigger>
              <SelectContent>
                {SERVICE_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.tipoServicio && (
              <span className="text-destructive text-sm font-bold">Requerido</span>
            )}
          </div>

          {/* Monto */}
          <div>
            <Label className="text-sm text-muted-foreground font-bold">
              Monto a cobrar ($) <span className="text-destructive">*</span>
            </Label>
            <Input
              type="number"
              value={formData.monto}
              onChange={(e) => {
                setFormData((p) => ({ ...p, monto: e.target.value }));
                setErrors((e) => ({ ...e, monto: false }));
              }}
              placeholder="0.00"
              className={`mt-1 ${errors.monto ? "border-destructive" : "border-foreground/20"}`}
            />
            {errors.monto && (
              <span className="text-destructive text-sm font-bold">Requerido</span>
            )}
          </div>

          {/* Rider */}
          <div>
            <Label className="text-sm font-bold">
              Rider Asignado <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.riderAsignado}
              onValueChange={(v) => {
                setFormData((p) => ({ ...p, riderAsignado: v as RiderName }));
                setErrors((e) => ({ ...e, riderAsignado: false }));
              }}
            >
              <SelectTrigger className={`mt-1 border-2 border-primary shadow-sm ${errors.riderAsignado ? "border-destructive" : ""}`}>
                <SelectValue placeholder="Seleccionar..." />
              </SelectTrigger>
              <SelectContent>
                {RIDERS.map((rider) => (
                  <SelectItem key={rider} value={rider}>
                    {rider}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.riderAsignado && (
              <span className="text-destructive text-sm font-bold">Asigna un Rider</span>
            )}
          </div>

          {/* Notas */}
          <div className="md:col-span-2 lg:col-span-4">
            <Label className="text-sm text-muted-foreground font-bold">
              Notas para el Rider (Opcional)
            </Label>
            <Textarea
              value={formData.notas}
              onChange={(e) => setFormData((p) => ({ ...p, notas: e.target.value }))}
              placeholder="Ej: Llamar al llegar al lugar, incluir link de ubicacion GPS..."
              rows={2}
              className="mt-1 border-foreground/20"
            />
          </div>

          {/* Programar */}
          <div className="md:col-span-2 lg:col-span-4">
            <div className="flex items-center gap-3 border p-3 rounded-lg bg-muted/50 shadow-sm">
              <Switch
                checked={formData.esProgramado}
                onCheckedChange={(checked) =>
                  setFormData((p) => ({ ...p, esProgramado: checked }))
                }
              />
              <Label className="font-bold cursor-pointer">
                Agendar viaje para mas tarde?
              </Label>
            </div>
          </div>

          {formData.esProgramado && (
            <>
              <div>
                <Label className="text-sm text-muted-foreground font-bold">Fecha a realizar</Label>
                <Input
                  type="date"
                  value={formData.fechaProgramada}
                  onChange={(e) => setFormData((p) => ({ ...p, fechaProgramada: e.target.value }))}
                  className="bg-muted/50 mt-1"
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground font-bold">Hora a realizar</Label>
                <Input
                  type="time"
                  value={formData.horaProgramada}
                  onChange={(e) => setFormData((p) => ({ ...p, horaProgramada: e.target.value }))}
                  className="bg-muted/50 mt-1"
                />
              </div>
            </>
          )}
        </div>

        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`w-full mt-6 text-lg py-6 shadow-md font-bold ${
            formData.esProgramado ? "bg-foreground hover:bg-foreground/90" : "btn-avex"
          }`}
        >
          {isSubmitting
            ? "Cargando..."
            : formData.esProgramado
              ? "AGENDAR VIAJE"
              : "ASIGNAR VIAJE INMEDIATO"}
        </Button>
      </Card>

      <PasteTextDialog
        open={showPasteDialog}
        onOpenChange={setShowPasteDialog}
        onPaste={handlePasteData}
      />

      <MapPreviewDialog
        open={showMapDialog}
        onOpenChange={setShowMapDialog}
        address={formData.direccion}
      />
    </>
  );
}
