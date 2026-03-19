"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAvexStore } from "@/lib/store";
import { BATTERY_MODELS } from "@/lib/types";
import { Save } from "lucide-react";

export function CatalogTab() {
  const config = useAvexStore((state) => state.config);
  const updatePrices = useAvexStore((state) => state.updatePrices);
  const updateSurcharges = useAvexStore((state) => state.updateSurcharges);

  const [prices, setPrices] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    BATTERY_MODELS.forEach((model) => {
      initial[model] = (config.preciosBase[model] || 0).toString();
    });
    return initial;
  });

  const [surcharges, setSurcharges] = useState({
    tarjeta1: config.recargos.tarjeta1.toString(),
    tarjeta3: config.recargos.tarjeta3.toString(),
  });

  const handleSavePrices = () => {
    const numericPrices: Record<string, number> = {};
    Object.entries(prices).forEach(([model, price]) => {
      numericPrices[model] = parseFloat(price) || 0;
    });
    updatePrices(numericPrices);
    toast.success("Precios base actualizados correctamente");
  };

  const handleSaveSurcharges = () => {
    updateSurcharges({
      tarjeta1: parseFloat(surcharges.tarjeta1) || 0,
      tarjeta3: parseFloat(surcharges.tarjeta3) || 0,
    });
    toast.success("Recargos actualizados correctamente");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Price Catalog */}
      <Card className="p-4 md:p-6 border-0 avex-border-yellow shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-bold text-xl">Precios Base (Efectivo)</h4>
          <Button onClick={handleSavePrices} className="btn-avex font-bold">
            <Save className="h-4 w-4 mr-2" />
            Guardar Precios
          </Button>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Define el precio de venta al publico en efectivo para cada modelo de bateria.
        </p>

        <div className="space-y-3 max-h-[500px] overflow-y-auto scrollbar-thin pr-2">
          {BATTERY_MODELS.map((model) => {
            const cleanId = model.replace(/[^a-zA-Z0-9]/g, "");
            return (
              <div
                key={model}
                className="flex justify-between items-center border-b pb-2"
              >
                <Label className="text-sm font-bold">{model}</Label>
                <div className="flex items-center gap-1 w-1/2">
                  <span className="text-green-600 font-bold text-sm">$</span>
                  <Input
                    type="number"
                    value={prices[model] || "0"}
                    onChange={(e) =>
                      setPrices((p) => ({ ...p, [model]: e.target.value }))
                    }
                    className="text-right font-bold"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Surcharges Config */}
      <div className="space-y-6">
        <Card className="p-4 md:p-6 border-0 border-l-4 border-l-blue-500 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-xl">Recargos por Tarjeta</h4>
            <Button onClick={handleSaveSurcharges} className="bg-blue-600 hover:bg-blue-700 font-bold">
              <Save className="h-4 w-4 mr-2" />
              Guardar
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            Estos porcentajes se aplican sobre el precio base cuando el cliente paga con tarjeta.
          </p>

          <div className="space-y-4">
            <div>
              <Label className="font-bold">Recargo 1 Pago Tarjeta (%)</Label>
              <Input
                type="number"
                value={surcharges.tarjeta1}
                onChange={(e) =>
                  setSurcharges((s) => ({ ...s, tarjeta1: e.target.value }))
                }
                className="mt-1 text-center font-bold text-lg"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Actualmente: {surcharges.tarjeta1}%
              </p>
            </div>

            <div>
              <Label className="font-bold">Recargo 3 Cuotas Tarjeta (%)</Label>
              <Input
                type="number"
                value={surcharges.tarjeta3}
                onChange={(e) =>
                  setSurcharges((s) => ({ ...s, tarjeta3: e.target.value }))
                }
                className="mt-1 text-center font-bold text-lg"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Actualmente: {surcharges.tarjeta3}%
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 md:p-6 border-0 shadow-sm bg-muted/50">
          <h5 className="font-bold mb-2">Como funcionan los precios</h5>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>El precio base es el valor de venta en efectivo</li>
            <li>Cuando el cliente paga con tarjeta, se suma el recargo correspondiente</li>
            <li>Ejemplo: Si una bateria cuesta $100.000 y el recargo de 1 pago es 10%, el total sera $110.000</li>
            <li>Los recargos de 3 cuotas suelen ser mas altos para cubrir los costos financieros</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
