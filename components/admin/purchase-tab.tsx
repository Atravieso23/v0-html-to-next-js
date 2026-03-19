"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useAvexStore } from "@/lib/store";
import { BATTERY_MODELS } from "@/lib/types";
import { getCurrentMoment, calculateAdvancedPurchase, inputToVisualDate } from "@/lib/helpers";

export function PurchaseTab() {
  const addBatteryStock = useAvexStore((state) => state.addBatteryStock);
  const addPurchase = useAvexStore((state) => state.addPurchase);
  const updatePrices = useAvexStore((state) => state.updatePrices);
  const preciosBase = useAvexStore((state) => state.config.preciosBase);

  const [formData, setFormData] = useState({
    proveedor: "",
    factura: "",
    fecha: "",
    modelo: BATTERY_MODELS[0],
    modeloNuevo: "",
    cantidad: "1",
    montoUnitarioSinIva: "0",
    dtoPorcentaje: "0",
    dtoComercialPorcentaje: "0",
    iibbPorcentaje: "0",
    bonifEfectivoPorcentaje: "0",
    loteManual: "",
  });

  const [calculated, setCalculated] = useState({
    dtoValor: 0,
    subtotal1: 0,
    dtoComercialValor: 0,
    subtotal2: 0,
    ivaValor: 0,
    iibbValor: 0,
    totalUnitario: 0,
    costoFinalConIva: 0,
    totalLote: 0,
    costoFinalSinImpuestos: 0,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNewModel, setShowNewModel] = useState(false);

  // Recalculate on form changes
  useEffect(() => {
    const result = calculateAdvancedPurchase({
      cantidad: parseFloat(formData.cantidad) || 0,
      montoUnitarioSinIva: parseFloat(formData.montoUnitarioSinIva) || 0,
      dtoPorcentaje: parseFloat(formData.dtoPorcentaje) || 0,
      dtoComercialPorcentaje: parseFloat(formData.dtoComercialPorcentaje) || 0,
      iibbPorcentaje: parseFloat(formData.iibbPorcentaje) || 0,
      bonifEfectivoPorcentaje: parseFloat(formData.bonifEfectivoPorcentaje) || 0,
    });
    setCalculated(result);
  }, [formData]);

  const handleSubmit = async () => {
    const modelo = showNewModel ? formData.modeloNuevo : formData.modelo;
    const cantidad = parseFloat(formData.cantidad) || 0;

    if (!modelo || cantidad <= 0 || calculated.costoFinalConIva <= 0) {
      toast.warning("Faltan datos importantes o el costo es 0");
      return;
    }

    setIsSubmitting(true);

    try {
      const momento = formData.fecha
        ? {
            fechaInput: formData.fecha,
            fechaLegible: inputToVisualDate(formData.fecha),
          }
        : getCurrentMoment();

      // Add stock
      addBatteryStock(
        modelo,
        cantidad,
        calculated.costoFinalConIva,
        formData.loteManual || undefined
      );

      // If new model, add to prices
      if (showNewModel && !preciosBase[modelo]) {
        updatePrices({ [modelo]: 0 });
      }

      // Add purchase record
      addPurchase({
        fechaVisual: momento.fechaLegible,
        fechaInput: momento.fechaInput,
        proveedor: formData.proveedor,
        factura: formData.factura,
        modelo,
        cantidad,
        costoUnitario: calculated.costoFinalConIva,
        totalCompra: calculated.totalLote,
        montoSinIva: parseFloat(formData.montoUnitarioSinIva) || 0,
        dtoPorcentaje: parseFloat(formData.dtoPorcentaje) || 0,
        dtoComercialPorcentaje: parseFloat(formData.dtoComercialPorcentaje) || 0,
        iibbPorcentaje: parseFloat(formData.iibbPorcentaje) || 0,
        bonifEfectivoPorcentaje: parseFloat(formData.bonifEfectivoPorcentaje) || 0,
        costoSinImpuestos: calculated.costoFinalSinImpuestos,
        detallesHtml: `<li><strong>${cantidad}x</strong> ${modelo} (Costo Final c/u: $${calculated.costoFinalConIva.toFixed(2)}) - Lote: ${formData.loteManual || "Auto"} - Fac: ${formData.factura || "N/A"} - Prov: ${formData.proveedor || "N/A"}</li>`,
        tipo: "Avanzada",
      });

      toast.success("Compra avanzada registrada correctamente");

      // Reset form
      setFormData({
        proveedor: "",
        factura: "",
        fecha: "",
        modelo: BATTERY_MODELS[0],
        modeloNuevo: "",
        cantidad: "1",
        montoUnitarioSinIva: "0",
        dtoPorcentaje: "0",
        dtoComercialPorcentaje: "0",
        iibbPorcentaje: "0",
        bonifEfectivoPorcentaje: "0",
        loteManual: "",
      });
      setShowNewModel(false);
    } catch (error) {
      toast.error("Error al guardar la compra");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-4 md:p-6 border-0 avex-border-yellow shadow-sm">
      <h4 className="font-bold text-xl mb-1">Ingresar Compra Detallada</h4>
      <p className="text-sm text-muted-foreground mb-4">
        Completa los datos de la factura. Los campos grises se calculan solos.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <Label className="text-sm font-bold">Proveedor</Label>
          <Input
            value={formData.proveedor}
            onChange={(e) => setFormData((p) => ({ ...p, proveedor: e.target.value }))}
            className="mt-1"
          />
        </div>

        <div>
          <Label className="text-sm font-bold">Num Factura</Label>
          <Input
            value={formData.factura}
            onChange={(e) => setFormData((p) => ({ ...p, factura: e.target.value }))}
            className="mt-1"
          />
        </div>

        <div>
          <Label className="text-sm font-bold">Fecha</Label>
          <Input
            type="date"
            value={formData.fecha}
            onChange={(e) => setFormData((p) => ({ ...p, fecha: e.target.value }))}
            className="mt-1"
          />
        </div>

        <div>
          <Label className="text-sm font-bold">Articulo</Label>
          <Select
            value={showNewModel ? "OTRA" : formData.modelo}
            onValueChange={(v) => {
              if (v === "OTRA") {
                setShowNewModel(true);
              } else {
                setShowNewModel(false);
                setFormData((p) => ({ ...p, modelo: v }));
              }
            }}
          >
            <SelectTrigger className="mt-1 border-foreground/20 font-bold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BATTERY_MODELS.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
              <SelectItem value="OTRA" className="font-bold text-blue-600">
                + Cargar Otra Nueva...
              </SelectItem>
            </SelectContent>
          </Select>
          {showNewModel && (
            <Input
              value={formData.modeloNuevo}
              onChange={(e) => setFormData((p) => ({ ...p, modeloNuevo: e.target.value }))}
              placeholder="Nombre nueva bateria..."
              className="mt-2 border-blue-500"
            />
          )}
        </div>
      </div>

      {/* Calculation Grid */}
      <div className="mt-6 p-4 bg-muted/50 rounded-lg border shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div>
            <Label className="text-sm font-bold">Cantidad</Label>
            <Input
              type="number"
              value={formData.cantidad}
              onChange={(e) => setFormData((p) => ({ ...p, cantidad: e.target.value }))}
              className="mt-1 font-bold text-blue-600"
            />
          </div>

          <div>
            <Label className="text-sm font-bold">Monto un. s/IVA</Label>
            <Input
              type="number"
              value={formData.montoUnitarioSinIva}
              onChange={(e) => setFormData((p) => ({ ...p, montoUnitarioSinIva: e.target.value }))}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-sm font-bold">DTO %</Label>
            <Input
              type="number"
              value={formData.dtoPorcentaje}
              onChange={(e) => setFormData((p) => ({ ...p, dtoPorcentaje: e.target.value }))}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-sm text-muted-foreground font-bold">DTO $</Label>
            <Input
              value={calculated.dtoValor.toFixed(2)}
              readOnly
              className="mt-1 bg-muted text-muted-foreground cursor-not-allowed"
            />
          </div>

          <div className="col-span-2">
            <Label className="text-sm text-muted-foreground font-bold">Subtotal</Label>
            <Input
              value={calculated.subtotal1.toFixed(2)}
              readOnly
              className="mt-1 bg-muted text-muted-foreground cursor-not-allowed"
            />
          </div>

          <div>
            <Label className="text-sm font-bold">Dto Com. %</Label>
            <Input
              type="number"
              value={formData.dtoComercialPorcentaje}
              onChange={(e) => setFormData((p) => ({ ...p, dtoComercialPorcentaje: e.target.value }))}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-sm text-muted-foreground font-bold">Dto Com. $</Label>
            <Input
              value={calculated.dtoComercialValor.toFixed(2)}
              readOnly
              className="mt-1 bg-muted text-muted-foreground cursor-not-allowed"
            />
          </div>

          <div className="col-span-2">
            <Label className="text-sm text-muted-foreground font-bold">Subtotal 2</Label>
            <Input
              value={calculated.subtotal2.toFixed(2)}
              readOnly
              className="mt-1 bg-muted text-muted-foreground cursor-not-allowed"
            />
          </div>

          <div className="col-span-2">
            <Label className="text-sm text-muted-foreground font-bold">IVA 21% ($)</Label>
            <Input
              value={calculated.ivaValor.toFixed(2)}
              readOnly
              className="mt-1 bg-muted text-muted-foreground cursor-not-allowed"
            />
          </div>

          <div>
            <Label className="text-sm font-bold">IIBB %</Label>
            <Input
              type="number"
              value={formData.iibbPorcentaje}
              onChange={(e) => setFormData((p) => ({ ...p, iibbPorcentaje: e.target.value }))}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-sm text-muted-foreground font-bold">IIBB $</Label>
            <Input
              value={calculated.iibbValor.toFixed(2)}
              readOnly
              className="mt-1 bg-muted text-muted-foreground cursor-not-allowed"
            />
          </div>

          <div className="col-span-2">
            <Label className="text-sm text-muted-foreground font-bold">Total unitario</Label>
            <Input
              value={calculated.totalUnitario.toFixed(2)}
              readOnly
              className="mt-1 bg-muted text-muted-foreground cursor-not-allowed"
            />
          </div>

          <div className="col-span-2">
            <Label className="text-sm font-bold text-green-600">Bonif. Pago Efvo %</Label>
            <Input
              type="number"
              value={formData.bonifEfectivoPorcentaje}
              onChange={(e) => setFormData((p) => ({ ...p, bonifEfectivoPorcentaje: e.target.value }))}
              className="mt-1 text-green-600 font-bold"
            />
          </div>

          <div className="col-span-2 md:col-span-4">
            <Label className="text-sm font-bold">Lote a asignar (Opcional)</Label>
            <Input
              value={formData.loteManual}
              onChange={(e) => setFormData((p) => ({ ...p, loteManual: e.target.value }))}
              placeholder="Ej: LOTE-809 (Se autogenera si esta vacio)"
              className="mt-1 border-blue-500 font-bold"
            />
          </div>
        </div>

        <hr className="my-4" />

        {/* Final Results */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className="text-sm font-bold text-green-600">CO un. Final [c/ IVA]</Label>
            <Input
              value={`$${calculated.costoFinalConIva.toFixed(2)}`}
              readOnly
              className="mt-1 bg-green-100 dark:bg-green-900/30 text-green-600 font-bold text-xl cursor-not-allowed"
            />
          </div>

          <div>
            <Label className="text-sm font-bold text-green-600">TOTAL LOTE [c/ IVA]</Label>
            <Input
              value={`$${calculated.totalLote.toFixed(2)}`}
              readOnly
              className="mt-1 bg-green-100 dark:bg-green-900/30 text-green-600 font-bold text-xl cursor-not-allowed"
            />
          </div>

          <div>
            <Label className="text-sm font-bold text-destructive">CO un. Final [s/ IMP]</Label>
            <Input
              value={`$${calculated.costoFinalSinImpuestos.toFixed(2)}`}
              readOnly
              className="mt-1 bg-red-100 dark:bg-red-900/30 text-destructive font-bold text-xl cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full mt-6 btn-avex text-lg py-6 shadow-md border-2 border-foreground"
      >
        {isSubmitting ? "Guardando..." : "GUARDAR Y ACTUALIZAR STOCK"}
      </Button>
    </Card>
  );
}
