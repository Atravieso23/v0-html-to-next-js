"use client";

import { useState, useMemo } from "react";
import { QuickPurchaseDialog } from "@/components/inventory/quick-purchase-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Download, Upload, Package, AlertTriangle } from "lucide-react";
import { useAvexStore } from "@/lib/store";
import { BATTERY_MODELS } from "@/lib/types";

export function StockTab() {
  const inventario = useAvexStore((state) => state.inventario);
  const [searchTerm, setSearchTerm] = useState("");
  const [isQuickPurchaseOpen, setIsQuickPurchaseOpen] = useState(false);

  // Process inventory data
  const stockData = useMemo(() => {
    return BATTERY_MODELS.map((modelo) => {
      const bat = inventario[modelo];
      const totalQuantity = bat?.lotes?.reduce((sum, lote) => sum + lote.cantidad, 0) || 0;
      const avgCost = bat?.lotes?.length
        ? bat.lotes.reduce((sum, lote) => sum + lote.costo * lote.cantidad, 0) / totalQuantity || 0
        : 0;

      return {
        modelo,
        quantity: totalQuantity,
        avgCost: Math.round(avgCost),
        lotes: bat?.lotes || [],
      };
    });
  }, [inventario]);

  const filteredStock = stockData.filter((item) =>
    item.modelo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalUnits = stockData.reduce((sum, item) => sum + item.quantity, 0);
  const totalValue = stockData.reduce(
    (sum, item) => sum + item.quantity * item.avgCost,
    0
  );
  const lowStockItems = stockData.filter((item) => item.quantity <= 2 && item.quantity > 0);
  const outOfStockItems = stockData.filter((item) => item.quantity === 0);

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Unidades
            </CardTitle>
          </CardHeader>
          <CardContent className="py-0 pb-3">
            <p className="text-2xl font-bold">{totalUnits}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Valor del Stock
            </CardTitle>
          </CardHeader>
          <CardContent className="py-0 pb-3">
            <p className="text-2xl font-bold">
              ${totalValue.toLocaleString("es-AR")}
            </p>
          </CardContent>
        </Card>
        <Card className={lowStockItems.length > 0 ? "border-amber-500" : ""}>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Stock Bajo
            </CardTitle>
          </CardHeader>
          <CardContent className="py-0 pb-3">
            <p className={`text-2xl font-bold ${lowStockItems.length > 0 ? "text-amber-500" : ""}`}>
              {lowStockItems.length} items
            </p>
          </CardContent>
        </Card>
        <Card className={outOfStockItems.length > 0 ? "border-destructive" : ""}>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sin Stock
            </CardTitle>
          </CardHeader>
          <CardContent className="py-0 pb-3">
            <p className={`text-2xl font-bold ${outOfStockItems.length > 0 ? "text-destructive" : ""}`}>
              {outOfStockItems.length} items
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por modelo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
            <Upload className="h-4 w-4 mr-2" />
            Importar
          </Button>
          <Button
            size="sm"
            className="flex-1 sm:flex-none"
            onClick={() => setIsQuickPurchaseOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Compra Rapida
          </Button>
        </div>
      </div>

      {/* Stock Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredStock.map((item) => (
          <Card
            key={item.modelo}
            className={`${
              item.quantity === 0
                ? "border-destructive/50 bg-destructive/5"
                : item.quantity <= 2
                ? "border-amber-500/50 bg-amber-50 dark:bg-amber-950/20"
                : ""
            }`}
          >
            <CardContent className="pt-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-lg">{item.modelo}</h3>
                  <p className="text-sm text-muted-foreground">
                    {item.lotes.length} lote(s)
                  </p>
                </div>
                <Package className="h-5 w-5 text-muted-foreground" />
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold">{item.quantity}</p>
                  <p className="text-xs text-muted-foreground">unidades</p>
                </div>
                <div className="text-right">
                  {item.avgCost > 0 && (
                    <>
                      <p className="text-sm font-medium">
                        ${item.avgCost.toLocaleString("es-AR")}
                      </p>
                      <p className="text-xs text-muted-foreground">costo prom.</p>
                    </>
                  )}
                </div>
              </div>

              {item.quantity === 0 && (
                <Badge variant="destructive" className="mt-3 w-full justify-center">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Sin Stock
                </Badge>
              )}
              {item.quantity > 0 && item.quantity <= 2 && (
                <Badge variant="secondary" className="mt-3 w-full justify-center bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Stock Bajo
                </Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Purchase Dialog */}
      <QuickPurchaseDialog
        open={isQuickPurchaseOpen}
        onOpenChange={setIsQuickPurchaseOpen}
      />
    </div>
  );
}
