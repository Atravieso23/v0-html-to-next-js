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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { useAvexStore, selectTotalStock } from "@/lib/store";
import { CAR_BRANDS, type RiderName, type SalePaymentMethod, type Warranty } from "@/lib/types";
import { getCurrentMoment, calculateSalePrice } from "@/lib/helpers";

export function SalesForm() {
  const inventario = useAvexStore((state) => state.inventario);
  const config = useAvexStore((state) => state.config);
  const batteryModels = useAvexStore((state) => state.batteryModels);
  const riders = useAvexStore((state) => state.riders);
  const decrementBatteryStock = useAvexStore((state) => state.decrementBatteryStock);
  const addSale = useAvexStore((state) => state.addSale);
  const addWarranty = useAvexStore((state) => state.addWarranty);

  const [mesesGarantia, setMesesGarantia] = useState(6);

  const [formData, setFormData] = useState({
    cliente: "",
    celular: "",
    marca: "",
    modelo: "",
    patente: "",
    bateria: "",
    precioBase: "",
    metodoPago: "efectivo" as SalePaymentMethod,
    rider: "" as RiderName | "",
    direccion: "",
  });

  const [loteInfo, setLoteInfo] = useState<{ id: string | number; costo: number } | null>(null);
  const [totalCobrar, setTotalCobrar] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get available batteries with stock
  const availableBatteries = batteryModels.filter((modelo) => {
    const bat = inventario[modelo];
    return bat?.lotes?.some((l) => l.cantidad > 0);
  });

  // Update lot info when battery changes
  useEffect(() => {
    if (formData.bateria && inventario[formData.bateria]) {
      const bat = inventario[formData.bateria];
      if (bat.lotes && bat.lotes.length > 0) {
        const lote = bat.lotes[0];
        setLoteInfo({ id: lote.id, costo: lote.costo });
      }

      // Set base price from catalog
      const catalogPrice = config.preciosBase[formData.bateria];
      if (catalogPrice) {
        setFormData((p) => ({ ...p, precioBase: catalogPrice.toString() }));
      }
    } else {
      setLoteInfo(null);
    }
  }, [formData.bateria, inventario, config.preciosBase]);

  // Calculate total
  useEffect(() => {
    const base = parseFloat(formData.precioBase) || 0;
    const total = calculateSalePrice(base, formData.metodoPago, config.recargos);
    setTotalCobrar(total);
  }, [formData.precioBase, formData.metodoPago, config.recargos]);

  const handleSubmit = async () => {
    if (!formData.bateria || !formData.precioBase || !formData.rider) {
      toast.warning("Faltan datos obligatorios (Bateria, Precio o Rider)");
      return;
    }
    if (!formData.direccion.trim()) {
      toast.warning("La dirección de entrega es obligatoria");
      return;
    }

    setIsSubmitting(true);

    try {
      // Decrement stock
      const loteUsed = decrementBatteryStock(formData.bateria);
      if (!loteUsed) {
        toast.error("No hay stock disponible para este modelo");
        return;
      }

      const momento = getCurrentMoment();
      const paymentLabels: Record<SalePaymentMethod, string> = {
        efectivo: "Efectivo",
        tarjeta1: `1 Pago Tarjeta (+${config.recargos.tarjeta1}%)`,
        tarjeta3: `3 Cuotas Tarjeta (+${config.recargos.tarjeta3}%)`,
      };

      addSale({
        id: `venta-${Date.now()}`,
        fechaVisual: momento.fechaLegible,
        fechaInput: momento.fechaInput,
        cliente: formData.cliente || "Cliente Mostrador",
        celular: formData.celular || undefined,
        autoMarca: formData.marca.toLowerCase(),
        autoModelo: formData.modelo.toLowerCase(),
        autoTexto: `${formData.marca} ${formData.modelo}`.trim(),
        patente: formData.patente.toUpperCase(),
        modeloBat: formData.bateria,
        loteUsado: loteUsed.id,
        costoLote: loteUsed.costo,
        metodoPago: paymentLabels[formData.metodoPago],
        rider: formData.rider as RiderName,
        total: totalCobrar,
        direccion: formData.direccion.trim(),
        estado: "Pendiente",
        tiempos: { creado: momento.completa },
      });

      // Generar garantía automáticamente
      const vencDate = new Date(momento.fechaInput);
      vencDate.setMonth(vencDate.getMonth() + mesesGarantia);
      const fechaVenc = vencDate.toISOString().split("T")[0];
      const [vy, vm, vd] = fechaVenc.split("-");
      const warranty: Warranty = {
        id: `w-${Date.now()}`,
        fechaVenta: momento.fechaInput,
        fechaVentaVisual: momento.fechaLegible,
        fechaVencimiento: fechaVenc,
        fechaVencimientoVisual: `${vd}/${vm}/${vy}`,
        cliente: formData.cliente || "Cliente Mostrador",
        celular: formData.celular || undefined,
        patente: formData.patente ? formData.patente.toUpperCase() : undefined,
        autoTexto: `${formData.marca} ${formData.modelo}`.trim(),
        modeloBat: formData.bateria,
        mesesGarantia,
        estado: "Vigente",
      };
      addWarranty(warranty);

      toast.success(`Venta registrada! Se desconto 1 unidad de ${formData.bateria}`);

      // Reset form
      setFormData({
        cliente: "",
        celular: "",
        marca: "",
        modelo: "",
        patente: "",
        bateria: "",
        precioBase: "",
        metodoPago: "efectivo",
        rider: "",
        direccion: "",
      });
      setLoteInfo(null);
    } catch (error) {
      toast.error("Error al registrar la venta");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableModels = CAR_BRANDS[formData.marca] || [];

  return (
    <Card className="p-4 md:p-6 border-0 avex-border-yellow shadow-sm">
      <h4 className="font-bold text-xl mb-1">Registrar Venta</h4>
      <hr className="opacity-25 mb-4" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="text-sm text-muted-foreground font-bold">Cliente</Label>
          <Input
            value={formData.cliente}
            onChange={(e) => setFormData((p) => ({ ...p, cliente: e.target.value }))}
            className="mt-1"
          />
        </div>

        <div>
          <Label className="text-sm text-muted-foreground font-bold">Celular</Label>
          <Input
            value={formData.celular}
            onChange={(e) => setFormData((p) => ({ ...p, celular: e.target.value }))}
            className="mt-1"
          />
        </div>

        <div>
          <Label className="text-sm text-muted-foreground font-bold">Marca Auto</Label>
          <Input
            value={formData.marca}
            onChange={(e) => setFormData((p) => ({ ...p, marca: e.target.value, modelo: "" }))}
            placeholder="Seleccioná o escribí la marca..."
            className="mt-1"
            list="marcas-list-sales"
          />
          <datalist id="marcas-list-sales">
            {Object.keys(CAR_BRANDS).map((brand) => (
              <option key={brand} value={brand} />
            ))}
          </datalist>
        </div>

        <div>
          <Label className="text-sm text-muted-foreground font-bold">Modelo Auto</Label>
          <Input
            value={formData.modelo}
            onChange={(e) => setFormData((p) => ({ ...p, modelo: e.target.value }))}
            placeholder="Seleccioná o escribí el modelo..."
            className="mt-1"
            list="modelos-list-sales"
          />
          <datalist id="modelos-list-sales">
            {availableModels.map((model) => (
              <option key={model} value={model} />
            ))}
          </datalist>
        </div>

        <div className="md:col-span-2">
          <Label className="text-sm text-muted-foreground font-bold">Patente</Label>
          <Input
            value={formData.patente}
            onChange={(e) => setFormData((p) => ({ ...p, patente: e.target.value.toUpperCase() }))}
            placeholder="Ej: AB123CD"
            className="mt-1 uppercase"
          />
        </div>

        {/* Battery Selection */}
        <div className="md:col-span-2">
          <Label className="font-bold">
            Bateria a colocar <span className="text-destructive">*</span>
          </Label>
          <Select
            value={formData.bateria}
            onValueChange={(v) => setFormData((p) => ({ ...p, bateria: v }))}
          >
            <SelectTrigger className="mt-1 border-foreground/20">
              <SelectValue placeholder="Seleccionar modelo en stock..." />
            </SelectTrigger>
            <SelectContent>
              {availableBatteries.length === 0 ? (
                <SelectItem value="none" disabled>
                  No hay stock disponible
                </SelectItem>
              ) : (
                availableBatteries.map((modelo) => {
                  const total = inventario[modelo]?.lotes?.reduce((s, l) => s + l.cantidad, 0) || 0;
                  return (
                    <SelectItem key={modelo} value={modelo}>
                      {modelo} (Stock: {total})
                    </SelectItem>
                  );
                })
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Lot Info */}
        {loteInfo && (
          <div className="md:col-span-2">
            <Alert className="border-0 bg-primary/10">
              <AlertDescription className="font-bold">
                Lote a entregar: <strong>#{loteInfo.id}</strong> (Costo: ${loteInfo.costo})
              </AlertDescription>
            </Alert>
          </div>
        )}

        <div>
          <Label className="text-sm text-muted-foreground font-bold">Precio Efectivo ($)</Label>
          <Input
            type="number"
            value={formData.precioBase}
            onChange={(e) => setFormData((p) => ({ ...p, precioBase: e.target.value }))}
            className="mt-1 bg-muted/50"
          />
          <span className="text-xs text-muted-foreground">Tomado del catalogo</span>
        </div>

        <div>
          <Label className="text-sm text-muted-foreground font-bold">Metodo de Pago</Label>
          <Select
            value={formData.metodoPago}
            onValueChange={(v) => setFormData((p) => ({ ...p, metodoPago: v as SalePaymentMethod }))}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="efectivo">Efectivo</SelectItem>
              <SelectItem value="tarjeta1">1 Pago Tarjeta (+{config.recargos.tarjeta1}%)</SelectItem>
              <SelectItem value="tarjeta3">3 Cuotas Tarjeta (+{config.recargos.tarjeta3}%)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Garantía */}
        <div>
          <Label className="text-sm text-muted-foreground font-bold">Garantía (meses)</Label>
          <Select
            value={mesesGarantia.toString()}
            onValueChange={(v) => setMesesGarantia(parseInt(v))}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">3 meses</SelectItem>
              <SelectItem value="6">6 meses</SelectItem>
              <SelectItem value="12">12 meses</SelectItem>
              <SelectItem value="24">24 meses</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Total */}
        <div className="md:col-span-2">
          <div className="flex justify-between items-center avex-bg-dark text-white p-4 rounded-lg shadow-sm">
            <span className="font-bold tracking-wide">TOTAL A COBRAR:</span>
            <span className="text-3xl font-bold text-green-400">${totalCobrar}</span>
          </div>
        </div>

        {/* Dirección de entrega */}
        <div className="md:col-span-2">
          <Label className="font-bold">
            Dirección de entrega <span className="text-destructive">*</span>
          </Label>
          <Input
            value={formData.direccion}
            onChange={(e) => setFormData((p) => ({ ...p, direccion: e.target.value }))}
            placeholder="Ej: Av. Corrientes 1234, CABA"
            className="mt-1"
          />
        </div>

        {/* Rider */}
        <div className="md:col-span-2">
          <Select
            value={formData.rider}
            onValueChange={(v) => setFormData((p) => ({ ...p, rider: v as RiderName }))}
          >
            <SelectTrigger className="border-2 border-primary">
              <SelectValue placeholder="Rider que instala..." />
            </SelectTrigger>
            <SelectContent>
              {riders.map((rider) => (
                <SelectItem key={rider.nombre} value={rider.nombre}>
                  {rider.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={isSubmitting || !formData.bateria}
        className="w-full mt-6 btn-avex text-lg py-6 shadow-md"
      >
        {isSubmitting ? "Registrando..." : "CONFIRMAR VENTA"}
      </Button>
    </Card>
  );
}
