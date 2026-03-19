"use client";

import { useState } from "react";
import { StockTable } from "@/components/inventory/stock-table";
import { QuickPurchaseDialog } from "@/components/inventory/quick-purchase-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Download, Upload } from "lucide-react";
import { useAppStore } from "@/lib/store";

export function StockTab() {
  const { batteryStock } = useAppStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [isQuickPurchaseOpen, setIsQuickPurchaseOpen] = useState(false);

  const filteredStock = batteryStock.filter(
    (item) =>
      item.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalUnits = batteryStock.reduce((sum, item) => sum + item.quantity, 0);
  const totalValue = batteryStock.reduce(
    (sum, item) => sum + item.quantity * item.purchasePrice,
    0
  );
  const lowStockItems = batteryStock.filter((item) => item.quantity <= item.minStock);

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por modelo o marca..."
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

      {/* Stock Table */}
      <StockTable data={filteredStock} />

      {/* Quick Purchase Dialog */}
      <QuickPurchaseDialog
        open={isQuickPurchaseOpen}
        onOpenChange={setIsQuickPurchaseOpen}
      />
    </div>
  );
}
