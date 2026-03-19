"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAvexStore, selectTotalStock } from "@/lib/store";
import { BATTERY_MODELS } from "@/lib/types";
import { Plus } from "lucide-react";
import { useState } from "react";
import { QuickPurchaseDialog } from "./quick-purchase-dialog";

export function StockTable() {
  const inventario = useAvexStore((state) => state.inventario);
  const [showQuickPurchase, setShowQuickPurchase] = useState(false);

  const stockData = BATTERY_MODELS.map((modelo) => {
    const bat = inventario[modelo];
    const total = bat?.lotes?.reduce((sum, l) => sum + l.cantidad, 0) || 0;
    const activeLot = bat?.lotes?.[0];

    return {
      modelo,
      total,
      loteActivo: activeLot ? `Lote #${activeLot.id} (${activeLot.cantidad})` : "Ninguno",
    };
  }).filter((item) => item.total > 0 || inventario[item.modelo]);

  return (
    <>
      <Card className="p-4 border-0 shadow-sm h-full">
        <div className="flex justify-between items-center mb-3">
          <h5 className="font-bold text-lg">Stock</h5>
          <Button size="sm" onClick={() => setShowQuickPurchase(true)} className="font-bold">
            <Plus className="h-4 w-4 mr-1" />
            Stock Rapido
          </Button>
        </div>

        <div className="overflow-auto max-h-[450px] scrollbar-thin">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-left">Modelo</TableHead>
                <TableHead className="text-center">Stock</TableHead>
                <TableHead className="text-center">Lote</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stockData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    No hay inventario cargado
                  </TableCell>
                </TableRow>
              ) : (
                stockData.map((item) => (
                  <TableRow key={item.modelo}>
                    <TableCell className="font-bold text-sm">{item.modelo}</TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={
                          item.total === 0
                            ? "destructive"
                            : item.total < 3
                              ? "secondary"
                              : "default"
                        }
                        className="text-sm font-bold shadow-sm"
                      >
                        {item.total}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center text-sm text-muted-foreground">
                      {item.loteActivo}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <QuickPurchaseDialog open={showQuickPurchase} onOpenChange={setShowQuickPurchase} />
    </>
  );
}
