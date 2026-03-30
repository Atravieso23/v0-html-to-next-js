"use client";

import { useState } from "react";
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
import { MapPin, Zap, Clipboard, Calendar, Clock } from "lucide-react";
import { toast } from "sonner";
import { useAvexStore } from "@/lib/store";
import {
  INSURANCE_PROVIDERS, SERVICE_TYPES, CAR_BRANDS,
  type InsuranceProvider, type ServiceType, type RiderName,
} from "@/lib/types";
import { getCurrentMoment, generateId, geocodeAddress, parseInsuranceText } from "@/lib/helpers";
import { PasteTextDialog } from "./paste-text-dialog";
import { MapPreviewDialog } from "./map-preview-dialog";

const SERVICE_ICONS: Record<string, string> = {
  Arranque: "⚡", Inflado: "🔧", "Cambio Rueda": "🔄", Cerrajería: "🔑",
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">
      {children}
    </p>
  );
}

function FieldLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <Label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 flex items-center gap-1 mb-1.5">
      {label}
      {required && <span className="text-amber-500 normal-case tracking-normal text-[9px]">*</span>}
    </Label>
  );
}

export function ServiceForm() {
  const addService = useAvexStore((state) => state.addService);
  const servicios = useAvexStore((state) => state.servicios);
  const riders = useAvexStore((state) => state.riders);
  const riderColors = useAvexStore((state) => state.riderColors);

  const [formData, setFormData] = useState({
    aseguradora: "Avex" as InsuranceProvider,
    cliente: "", celular: "", marca: "", modelo: "", patente: "",
    direccion: "", tipoServicio: "" as ServiceType | "", monto: "",
    riderAsignado: "" as RiderName | "", notas: "",
    esProgramado: false, fechaProgramada: "", horaProgramada: "",
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
      toast.warning("Completá fecha y hora para agendar."); return;
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
        id, aseguradora: formData.aseguradora, cliente: formData.cliente || "Sin nombre",
        celular: formData.celular, marca: formData.marca, modelo: formData.modelo,
        patente: formData.patente.toUpperCase(), direccion: formData.direccion,
        tipo: formData.tipoServicio as ServiceType, monto: parseFloat(formData.monto) || 0,
        rider: formData.riderAsignado as RiderName, notas: formData.notas,
        estado: formData.esProgramado ? "Programado" : "Pendiente",
        lat: coords?.lat, lng: coords?.lng, orden,
        tiempos: { creado: momento.completa },
        fechaVisual: momento.fechaLegible, fechaInput: momento.fechaInput,
        esProgramado: formData.esProgramado,
        fechaProgramada: formData.fechaProgramada, horaProgramada: formData.horaProgramada,
      });
      toast.success(formData.esProgramado ? "✓ Viaje programado" : `✓ Asignado a ${formData.riderAsignado}`);
      setFormData({
        aseguradora: "Avex", cliente: "", celular: "", marca: "", modelo: "", patente: "",
        direccion: "", tipoServicio: "", monto: "", riderAsignado: "", notas: "",
        esProgramado: false, fechaProgramada: "", horaProgramada: "",
      });
      setErrors({});
    } catch (error) {
      toast.error("Error al crear el servicio"); console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasteData = (text: string) => {
    const parsed = parseInsuranceText(text);
    setFormData((prev) => ({
      ...prev,
      cliente: parsed.cliente || prev.cliente, celular: parsed.celular || prev.celular,
      direccion: parsed.direccion || prev.direccion, marca: parsed.marca || prev.marca,
      modelo: parsed.modelo || prev.modelo, patente: parsed.patente || prev.patente,
      tipoServicio: (parsed.tipoServicio as ServiceType) || prev.tipoServicio,
    }));
    toast.success("✓ Datos autocompletados");
  };

  const inputClass = [
    "h-9 rounded-lg text-sm transition-colors",
    "bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400",
    "focus:bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20",
  ].join(" ");

  const selectTriggerClass = [
    "h-9 rounded-lg text-sm transition-colors",
    "bg-white border border-slate-200 text-slate-900",
    "focus:bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20",
    "data-[placeholder]:text-slate-400",
  ].join(" ");

  const selectedRiderColor = formData.riderAsignado ? riderColors[formData.riderAsignado] : null;

  return (
    <>
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">

        {/* Header */}
        <div className="bg-[#1C2333] px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-yellow-400 rounded-xl flex items-center justify-center shrink-0">
              <Zap className="h-4 w-4 text-black" />
            </div>
            <div>
              <p className="text-white font-black text-sm tracking-tight leading-none">NUEVO SERVICIO</p>
              <p className="text-slate-400 text-[10px] font-medium mt-0.5">Completá los datos y asigná al rider</p>
            </div>
          </div>
          <button
            onClick={() => setShowPasteDialog(true)}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors border border-white/10"
          >
            <Clipboard className="h-3 w-3" />
            Pegar texto
          </button>
        </div>

        <div className="p-4 space-y-3">

          {/* ── SECCIÓN 1: Datos del Cliente y Vehículo ── */}
          <div className="bg-slate-50/60 border border-slate-200 rounded-xl p-4 space-y-3">
            <SectionLabel>Datos del cliente y vehículo</SectionLabel>

            {/* Aseguradora — segmented control */}
            <div>
              <FieldLabel label="Aseguradora / Origen" />
              <div className="flex rounded-lg border border-slate-200 overflow-hidden divide-x divide-slate-200 bg-white">
                {INSURANCE_PROVIDERS.map((provider) => {
                  const isSelected = formData.aseguradora === provider;
                  return (
                    <button
                      key={provider}
                      type="button"
                      onClick={() => setFormData((p) => ({ ...p, aseguradora: provider }))}
                      className={`flex-1 py-2 text-xs font-semibold transition-colors duration-150 ${
                        isSelected
                          ? "bg-yellow-400 text-black"
                          : "bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                      }`}
                    >
                      {provider === "Avex" ? "⚡ AVEX" : provider}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cliente + Celular */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel label="Nombre del cliente" />
                <Input
                  value={formData.cliente}
                  onChange={(e) => setFormData((p) => ({ ...p, cliente: e.target.value }))}
                  placeholder="Nombre completo"
                  className={inputClass}
                />
              </div>
              <div>
                <FieldLabel label="Celular" />
                <Input
                  value={formData.celular}
                  onChange={(e) => setFormData((p) => ({ ...p, celular: e.target.value }))}
                  placeholder="11 1234-5678"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Marca (full width) */}
            <div>
              <FieldLabel label="Vehículo (marca)" />
              <Select
                value={formData.marca}
                onValueChange={(v) => setFormData((p) => ({ ...p, marca: v, modelo: "" }))}>
                <SelectTrigger className={selectTriggerClass}>
                  <SelectValue placeholder="Seleccioná la marca..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(CAR_BRANDS).map((brand) => (
                    <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Modelo + Patente */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel label="Modelo" />
                <Select
                  value={formData.modelo}
                  onValueChange={(v) => setFormData((p) => ({ ...p, modelo: v }))}
                  disabled={!formData.marca}>
                  <SelectTrigger className={`${selectTriggerClass} disabled:opacity-50`}>
                    <SelectValue placeholder={formData.marca ? "Seleccionar..." : "Elegí marca primero"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableModels.map((model) => (
                      <SelectItem key={model} value={model}>{model}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <FieldLabel label="Patente" />
                <Input
                  value={formData.patente}
                  onChange={(e) => setFormData((p) => ({ ...p, patente: e.target.value.toUpperCase() }))}
                  placeholder="AB123CD"
                  className={`${inputClass} uppercase font-mono tracking-widest`}
                />
              </div>
            </div>
          </div>

          {/* ── SECCIÓN 2: Detalles del Servicio ── */}
          <div className="bg-slate-50/60 border border-slate-200 rounded-xl p-4 space-y-3">
            <SectionLabel>Detalles del servicio</SectionLabel>

            {/* Tipo + Monto */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel label="Tipo de servicio" required />
                <Select
                  value={formData.tipoServicio}
                  onValueChange={(v) => {
                    setFormData((p) => ({ ...p, tipoServicio: v as ServiceType }));
                    setErrors((e) => ({ ...e, tipoServicio: false }));
                  }}>
                  <SelectTrigger className={`${selectTriggerClass} ${errors.tipoServicio ? "border-red-400 bg-red-50" : ""}`}>
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVICE_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        <span className="flex items-center gap-2">
                          <span>{SERVICE_ICONS[type]}</span>
                          {type}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.tipoServicio && <p className="text-[10px] text-red-500 mt-1">Requerido</p>}
              </div>

              <div>
                <FieldLabel label="Monto a cobrar" required />
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm pointer-events-none">$</span>
                  <Input
                    type="number"
                    value={formData.monto}
                    onChange={(e) => {
                      setFormData((p) => ({ ...p, monto: e.target.value }));
                      setErrors((e) => ({ ...e, monto: false }));
                    }}
                    placeholder="0"
                    className={`${inputClass} pl-7 font-bold ${errors.monto ? "border-red-400 bg-red-50" : ""}`}
                  />
                </div>
                {errors.monto && <p className="text-[10px] text-red-500 mt-1">Requerido</p>}
              </div>
            </div>

            {/* Dirección */}
            <div>
              <FieldLabel label="Dirección exacta" required />
              <div className="flex gap-2">
                <Input
                  value={formData.direccion}
                  onChange={(e) => {
                    setFormData((p) => ({ ...p, direccion: e.target.value }));
                    setErrors((e) => ({ ...e, direccion: false }));
                  }}
                  placeholder="Calle, número, localidad..."
                  className={`${inputClass} flex-1 ${errors.direccion ? "border-red-400 bg-red-50" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => formData.direccion && setShowMapDialog(true)}
                  disabled={!formData.direccion}
                  className="h-9 w-9 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-400 hover:border-yellow-400 hover:text-yellow-500 hover:bg-yellow-50 disabled:opacity-30 transition-colors shrink-0"
                >
                  <MapPin className="h-4 w-4" />
                </button>
              </div>
              {errors.direccion && <p className="text-[10px] text-red-500 mt-1">Requerido</p>}
            </div>
          </div>

          {/* ── SECCIÓN 3: Asignación ── */}
          <div className="bg-slate-50/60 border border-slate-200 rounded-xl p-4 space-y-3">
            <SectionLabel>Asignación</SectionLabel>

            {/* Rider + Notas */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel label="Rider asignado" required />
                <Select
                  value={formData.riderAsignado}
                  onValueChange={(v) => {
                    setFormData((p) => ({ ...p, riderAsignado: v as RiderName }));
                    setErrors((e) => ({ ...e, riderAsignado: false }));
                  }}>
                  <SelectTrigger
                    className={`${selectTriggerClass} ${errors.riderAsignado ? "border-red-400 bg-red-50" : ""}`}
                    style={selectedRiderColor ? {
                      borderColor: selectedRiderColor,
                      backgroundColor: selectedRiderColor + "12",
                      color: selectedRiderColor,
                      fontWeight: "700",
                    } : {}}
                  >
                    <SelectValue placeholder="Seleccionar rider..." />
                  </SelectTrigger>
                  <SelectContent>
                    {riders.map((rider) => {
                      const color = riderColors[rider];
                      return (
                        <SelectItem key={rider} value={rider}>
                          <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                            {rider}
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                {errors.riderAsignado && <p className="text-[10px] text-red-500 mt-1">Requerido</p>}
              </div>

              <div>
                <FieldLabel label="Notas para el rider" />
                <Textarea
                  value={formData.notas}
                  onChange={(e) => setFormData((p) => ({ ...p, notas: e.target.value }))}
                  placeholder="Instrucciones, referencias..."
                  rows={1}
                  className="bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm rounded-lg resize-none focus:bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 min-h-[36px]"
                />
              </div>
            </div>

            {/* Toggle programar */}
            <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg px-4 py-2.5">
              <Switch
                checked={formData.esProgramado}
                onCheckedChange={(checked) => setFormData((p) => ({ ...p, esProgramado: checked }))}
                className="data-[state=checked]:bg-amber-500"
              />
              <div>
                <p className="text-xs font-semibold text-slate-700">Agendar para más tarde</p>
                <p className="text-[10px] text-slate-400">Programá para una fecha y hora específica</p>
              </div>
            </div>

            {formData.esProgramado && (
              <div className="grid grid-cols-2 gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <div>
                  <FieldLabel label="Fecha" />
                  <Input
                    type="date"
                    value={formData.fechaProgramada}
                    onChange={(e) => setFormData((p) => ({ ...p, fechaProgramada: e.target.value }))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <FieldLabel label="Hora" />
                  <Input
                    type="time"
                    value={formData.horaProgramada}
                    onChange={(e) => setFormData((p) => ({ ...p, horaProgramada: e.target.value }))}
                    className={inputClass}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Botón submit */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`w-full py-3.5 rounded-xl font-black text-sm tracking-wide flex items-center justify-center gap-2.5 transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed ${
              formData.esProgramado
                ? "bg-[#1C2333] text-white hover:bg-slate-800 shadow-md"
                : "bg-yellow-400 text-black hover:bg-yellow-300 shadow-md shadow-yellow-200"
            }`}
          >
            {isSubmitting ? (
              <><span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />PROCESANDO...</>
            ) : formData.esProgramado ? (
              <><Calendar className="h-4 w-4" />AGENDAR VIAJE PROGRAMADO</>
            ) : (
              <><Zap className="h-4 w-4" />ASIGNAR VIAJE INMEDIATO</>
            )}
          </button>

        </div>
      </div>

      <PasteTextDialog open={showPasteDialog} onOpenChange={setShowPasteDialog} onPaste={handlePasteData} />
      <MapPreviewDialog open={showMapDialog} onOpenChange={setShowMapDialog} address={formData.direccion} />
    </>
  );
}
