"use client";

import { StockTable } from "@/components/inventory/stock-table";
import { SalesForm } from "@/components/inventory/sales-form";

export function SalesTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      <div className="lg:col-span-5">
        <StockTable />
      </div>
      <div className="lg:col-span-7">
        <SalesForm />
      </div>
    </div>
  );
}
