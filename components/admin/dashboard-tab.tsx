"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useAvexStore } from "@/lib/store";
import { calculateDashboardStats, formatCurrency, getCurrentMoment } from "@/lib/helpers";
import { RIDERS, type RiderName } from "@/lib/types";
import { Car, Battery, TrendingUp, DollarSign, AlertTriangle, Users, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";

export function DashboardTab() {
  const servicios = useAvexStore((state) => state.servicios);
  const historiales = useAvexStore((state) => state.historiales);
  const inventario = useAvexStore((state) => state.inventario);

  const [filterMonth, setFilterMonth] = useState(() => getCurrentMoment().fechaInput.substring(0, 7));

  // Calculate stats
  const stats = useMemo(
    () => calculateDashboardStats(servicios, historiales.ventas, filterMonth),
    [servicios, historiales.ventas, filterMonth]
  );

  // Calculate chart data
  const chartData = useMemo(() => {
    const [year, month] = filterMonth.split("-").map(Number);
    const numDays = new Date(year, month, 0).getDate();

    const data = Array.from({ length: numDays }, (_, i) => ({
      day: i + 1,
      servicios: 0,
      baterias: 0,
    }));

    // Count services by day
    Object.values(servicios).forEach((s) => {
      if (s.estado === "Finalizado" && s.fechaFinInput?.startsWith(filterMonth)) {
        const day = parseInt(s.fechaFinInput.split("-")[2]);
        if (day && day <= numDays) {
          data[day - 1].servicios++;
        }
      }
    });

    // Count sales by day
    historiales.ventas.forEach((v) => {
      if (v.fechaInput?.startsWith(filterMonth)) {
        const day = parseInt(v.fechaInput.split("-")[2]);
        if (day && day <= numDays) {
          data[day - 1].baterias++;
        }
      }
    });

    return data;
  }, [servicios, historiales.ventas, filterMonth]);

  // Low stock alerts
  const lowStockAlerts = useMemo(() => {
    const alerts: { modelo: string; stock: number }[] = [];
    Object.entries(inventario).forEach(([modelo, bat]) => {
      const total = bat.lotes?.reduce((sum, l) => sum + l.cantidad, 0) || 0;
      if (total <= 2) {
        alerts.push({ modelo, stock: total });
      }
    });
    return alerts.sort((a, b) => a.stock - b.stock);
  }, [inventario]);

  // Rider ranking
  const riderRanking = useMemo(() => {
    return RIDERS.map((rider) => ({
      rider,
      servicios: stats.riders[rider]?.servicios || 0,
      baterias: stats.riders[rider]?.baterias || 0,
      total: (stats.riders[rider]?.servicios || 0) + (stats.riders[rider]?.baterias || 0),
    })).sort((a, b) => b.total - a.total);
  }, [stats.riders]);

  const handleExportExcel = () => {
    toast.info("Funcionalidad de exportacion a Excel disponible con integracion de backend");
  };

  // Chart colors - computed in JS
  const servicesColor = "#111827";
  const batteriesColor = "#facc15";

  return (
    <div className="space-y-6">
      {/* Header with Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h4 className="font-bold text-2xl">Dashboard General</h4>
        <div className="flex items-center gap-3">
          <Label className="font-bold text-sm">Filtrar mes:</Label>
          <Input
            type="month"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="w-auto border-foreground/20"
          />
          <Button variant="outline" onClick={handleExportExcel} className="font-bold">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-0 shadow-sm bg-gradient-to-br from-card to-muted/50">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Ingresos Servicios</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.ingresosServicios)}</p>
              <p className="text-xs text-muted-foreground mt-1">+ {stats.auxilios} auxilios</p>
            </div>
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Car className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4 border-0 shadow-sm bg-gradient-to-br from-card to-muted/50">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Facturacion Baterias</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(stats.facturacionBaterias)}</p>
              <p className="text-xs text-muted-foreground mt-1">+ {stats.baterias} unidades</p>
            </div>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Battery className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4 border-0 shadow-sm bg-gradient-to-br from-card to-muted/50">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Ganancia Baterias</p>
              <p className="text-2xl font-bold text-purple-600">{formatCurrency(stats.gananciaBaterias)}</p>
              <p className="text-xs text-muted-foreground mt-1">Descontando costos</p>
            </div>
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4 border-0 shadow-sm avex-bg-dark text-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-300 font-medium">Total Bruto</p>
              <p className="text-2xl font-bold avex-text-yellow">
                {formatCurrency(stats.ingresosServicios + stats.facturacionBaterias)}
              </p>
              <p className="text-xs text-gray-400 mt-1">Servicios + Baterias</p>
            </div>
            <div className="p-2 bg-primary/20 rounded-lg">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>
      </div>

      {/* Chart and Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <Card className="lg:col-span-2 p-4 border-0 shadow-sm">
          <h5 className="font-bold mb-4">Evolucion del Mes</h5>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar dataKey="servicios" name="Auxilios" fill={servicesColor} radius={[4, 4, 0, 0]} />
                <Bar dataKey="baterias" name="Baterias" fill={batteriesColor} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Side Stats */}
        <div className="space-y-4">
          {/* Low Stock Alerts */}
          <Card className="p-4 border-0 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <h6 className="font-bold">Alertas de Stock</h6>
            </div>
            <div className="space-y-2 max-h-[150px] overflow-y-auto scrollbar-thin">
              {lowStockAlerts.length === 0 ? (
                <p className="text-sm text-muted-foreground">Niveles optimos.</p>
              ) : (
                lowStockAlerts.map((alert) => (
                  <div key={alert.modelo} className="flex justify-between items-center py-1 border-b last:border-0">
                    <span className="text-sm truncate pr-2">{alert.modelo}</span>
                    <Badge variant={alert.stock === 0 ? "destructive" : "secondary"} className="font-bold">
                      {alert.stock}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Rider Ranking */}
          <Card className="p-4 border-0 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-5 w-5 text-blue-500" />
              <h6 className="font-bold">Ranking Riders</h6>
            </div>
            <div className="space-y-3">
              {riderRanking.map((r) => (
                <div key={r.rider} className="flex justify-between items-center py-2 border-b last:border-0">
                  <span className="font-bold">{r.rider}</span>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="font-bold">
                      {r.servicios} <Car className="h-3 w-3 ml-1 inline" />
                    </Badge>
                    <Badge className="font-bold bg-cyan-500">
                      {r.baterias} <Battery className="h-3 w-3 ml-1 inline" />
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
