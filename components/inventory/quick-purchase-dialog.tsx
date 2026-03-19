"use client";

import { useState } from "react";
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
import { getCurrentMoment } from "@/lib/helpers";
import { Plus, X } from "lucide-react";

interface PurchaseRow {
  id: number;
  modelo: string;
  cantidad: string;
  costo: string;
}

interface QuickPurchaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickPurchaseDialog({ open, onOpenChange }: QuickPurchaseDialogProps) {
  const addBatteryStock = useAvexStore((state) => state.addBatteryStock);
  const addPurchase = useAvexStore((state) => state.addPurchase);
  const [rows, setRows] = useState<PurchaseRow[]>([
    { id: Date.now(), modelo: BATTERY_MODELS[0], cantidad: "", costo: "" },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addRow = () => {
    setRows([...rows, { id: Date.now(), modelo: BATTERY_MODELS[0], cantidad: "", costo: "" }]);
  };

  const removeRow = (id: number) => {
    if (rows.length > 1) {
      setRows(rows.filter((r) => r.id !== id));
    }
  };

  const updateRow = (id: number, field: keyof PurchaseRow, value: string) => {
    setRows(rows.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const momento = getCurrentMoment();
      let totalCompra = 0;
      let detallesHtml = "";
      let hasValidRows = false;

      for (const row of rows) {
        const cantidad = parseInt(row.cantidad) || 0;
        const costo = parseFloat(row.costo) || 0;

        if (cantidad > 0 && costo >= 0) {
          addBatteryStock(row.modelo, cantidad, costo);
          const subtotal = cantidad * costo;
          totalCompra += subtotal;
          detallesHtml += `<li><strong>${cantidad}x</strong> ${row.modelo} (Costo c/u: $${costo}) - Sub: $${subtotal}</li>`;
          hasValidRows = true;
        }
      }

      if (hasValidRows) {
        addPurchase({
          fechaVisual: momento.fechaLegible,
          fechaInput: momento.fechaInput,
          totalCompra,
          detallesHtml,
          tipo: "Rapida",
        });

        toast.success("Stock ingresado correctamente");
        setRows([{ id: Date.now(), modelo: BATTERY_MODELS[0], cantidad: "", costo: "" }]);
        onOpenChange(false);
      } else {
        toast.warning("Verifica que las cantidades sean mayores a 0");
      }
    } catch (error) {
      toast.error("Error al guardar la compra");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader className="avex-bg-dark text-white -mx-6 -mt-6 px-6 py-4 rounded-t-lg border-b-4 border-primary">
          <DialogTitle className="text-primary font-bold">Ingresar Compra de Stock</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-4">
            Podes cargar varias baterias de una misma boleta/compra en este listado.
          </p>

          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {rows.map((row) => (
              <div
                key={row.id}
                className="grid grid-cols-12 gap-3 items-end p-3 bg-muted/50 rounded-lg border"
              >
                <div className="col-span-12 md:col-span-5">
                  <Label className="text-sm font-bold">Modelo</Label>
                  <Select
                    value={row.modelo}
                    onValueChange={(v) => updateRow(row.id, "modelo", v)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BATTERY_MODELS.map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-4 md:col-span-3">
                  <Label className="text-sm font-bold">Cant.</Label>
                  <Input
                    type="number"
                    value={row.cantidad}
                    onChange={(e) => updateRow(row.id, "cantidad", e.target.value)}
                    placeholder="0"
                    className="mt-1 text-center font-bold"
                  />
                </div>

                <div className="col-span-5 md:col-span-3">
                  <Label className="text-sm font-bold">Costo c/u ($)</Label>
                  <Input
                    type="number"
                    value={row.costo}
                    onChange={(e) => updateRow(row.id, "costo", e.target.value)}
                    placeholder="0"
                    className="mt-1 text-right font-bold"
                  />
                </div>

                <div className="col-span-3 md:col-span-1">
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => removeRow(row.id)}
                    disabled={rows.length === 1}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={addRow}
            className="w-full mt-4 border-2 border-dashed font-bold"
          >
            <Plus className="h-4 w-4 mr-2" />
            AGREGAR OTRA BATERIA A LA LISTA
          </Button>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? "Guardando..." : "Guardar Compra en Stock"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
