"use client";

import { useState, useMemo, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
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
import type { RiderName } from "@/lib/types";
import { INSURANCE_PROVIDERS } from "@/lib/types";
import { Car, Battery, TrendingUp, DollarSign, AlertTriangle, Users, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";

// Colores fijos por aseguradora
const ASEGURADORA_COLORS: Record<string, string> = {
  Avex: "#facc15",
  "La Caja": "#111827",
  Rapihogar: "#3b82f6",
  Nivel: "#10b981",
};

const MONTH_NAMES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

export function DashboardTab() {
  const servicios = useAvexStore((state) => state.servicios);
  const historiales = useAvexStore((state) => state.historiales);
  const inventario = useAvexStore((state) => state.inventario);
  const comisionRider = useAvexStore((state) => state.config.comisionRider);
  const riders = useAvexStore((state) => state.riders);
  const riderColors = useAvexStore((state) => state.riderColors);

  const [filterMonth, setFilterMonth] = useState(() => getCurrentMoment().fechaInput.substring(0, 7));
  // Switch 1: false = General (Auxilios vs Baterías), true = Por Aseguradora
  const [viewByAseguradora, setViewByAseguradora] = useState(false);
  // Switch 2: false = Diaria, true = Mensual
  const [viewMonthly, setViewMonthly] = useState(false);
  // Leyenda interactiva: keys ocultas
  const [hiddenSeries, setHiddenSeries] = useState<Record<string, boolean>>({});

  const toggleSeries = useCallback((key: string) => {
    setHiddenSeries((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  // Calculate stats
  const stats = useMemo(
    () => calculateDashboardStats(servicios, historiales.ventas, filterMonth, comisionRider, riders),
    [servicios, historiales.ventas, filterMonth, comisionRider, riders]
  );

  // ── CHART DATA ──────────────────────────────────────────────────────────────
  const chartData = useMemo(() => {
    const [year, month] = filterMonth.split("-").map(Number);
    const yearPrefix = `${year}-`;

    if (viewMonthly) {
      // Vista mensual: 12 meses del año del mes filtrado
      if (!viewByAseguradora) {
        const data: { label: string; auxilios: number; baterias: number }[] =
          MONTH_NAMES.map((name) => ({ label: name, auxilios: 0, baterias: 0 }));

        const svcs = Object.values(servicios);
        svcs.forEach((s) => {
          if (s.estado === "Cancelado") return;
          if (s.fechaInput?.startsWith(yearPrefix)) {
            const m = parseInt(s.fechaInput.split("-")[1], 10) - 1;
            if (m >= 0 && m < 12) data[m].auxilios += 1;
          }
        });
        historiales.ventas.forEach((v) => {
          if (v.fechaInput?.startsWith(yearPrefix)) {
            const m = parseInt(v.fechaInput.split("-")[1], 10) - 1;
            if (m >= 0 && m < 12) data[m].baterias += 1;
          }
        });
        return data;
      } else {
        const data: { label: string; [k: string]: number | string }[] =
          MONTH_NAMES.map((name) => {
            const row: { label: string; [k: string]: number | string } = { label: name };
            INSURANCE_PROVIDERS.forEach((p) => { row[p] = 0; });
            return row;
          });

        Object.values(servicios).forEach((s) => {
          if (s.estado === "Cancelado") return;
          if (s.fechaInput?.startsWith(yearPrefix)) {
            const m = parseInt(s.fechaInput.split("-")[1], 10) - 1;
            if (m >= 0 && m < 12) {
              const cur = data[m][s.aseguradora];
              data[m][s.aseguradora] = (typeof cur === "number" ? cur : 0) + 1;
            }
          }
        });
        return data;
      }
    } else {
      // Vista diaria: días del mes filtrado
      const numDays = new Date(year, month, 0).getDate();

      if (!viewByAseguradora) {
        const data: { label: string; auxilios: number; baterias: number }[] =
          Array.from({ length: numDays }, (_, i) => ({ label: String(i + 1), auxilios: 0, baterias: 0 }));

        const svcs = Object.values(servicios);
        svcs.forEach((s) => {
          if (s.estado === "Cancelado") return;
          if (s.fechaInput?.startsWith(filterMonth)) {
            const day = parseInt(s.fechaInput.split("-")[2], 10);
            if (day >= 1 && day <= numDays) data[day - 1].auxilios += 1;
          }
        });
        historiales.ventas.forEach((v) => {
          if (v.fechaInput?.startsWith(filterMonth)) {
            const day = parseInt(v.fechaInput.split("-")[2], 10);
            if (day >= 1 && day <= numDays) data[day - 1].baterias += 1;
          }
        });
        return data;
      } else {
        const data: { label: string; [k: string]: number | string }[] =
          Array.from({ length: numDays }, (_, i) => {
            const row: { label: string; [k: string]: number | string } = { label: String(i + 1) };
            INSURANCE_PROVIDERS.forEach((p) => { row[p] = 0; });
            return row;
          });

        Object.values(servicios).forEach((s) => {
          if (s.estado === "Cancelado") return;
          if (s.fechaInput?.startsWith(filterMonth)) {
            const day = parseInt(s.fechaInput.split("-")[2], 10);
            if (day >= 1 && day <= numDays) {
              const cur = data[day - 1][s.aseguradora];
              data[day - 1][s.aseguradora] = (typeof cur === "number" ? cur : 0) + 1;
            }
          }
        });
        return data;
      }
    }
  }, [servicios, historiales.ventas, filterMonth, viewByAseguradora, viewMonthly]);

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
    return riders.map((rider) => ({
      rider,
      servicios: stats.riders[rider]?.servicios || 0,
      baterias: stats.riders[rider]?.baterias || 0,
      total: (stats.riders[rider]?.servicios || 0) + (stats.riders[rider]?.baterias || 0),
    })).sort((a, b) => b.total - a.total);
  }, [stats.riders, riders]);

  const handleExportExcel = async () => {
    try {
      const XLSX = await import("xlsx");
      const wb = XLSX.utils.book_new();
      const [year, month] = filterMonth.split("-");
      const monthLabel = `${month}/${year}`;

      // Hoja 1: Resumen
      const resumen = [
        ["AVEX - Resumen del mes", monthLabel],
        [],
        ["Métrica", "Valor"],
        ["Ingresos Servicios", stats.ingresosServicios],
        ["Facturación Baterías", stats.facturacionBaterias],
        ["Ganancia Baterías", stats.gananciaBaterias],
        ["Total Servicios", stats.auxilios],
        ["Total Baterías vendidas", stats.baterias],
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(resumen), "Resumen");

      // Hoja 2: Servicios del mes
      const svcsData = Object.values(servicios)
        .filter((s) => {
          const m = (s.fechaFinInput || s.fechaInput || "").substring(0, 7);
          return !filterMonth || m === filterMonth;
        })
        .map((s) => ({
          Fecha: s.fechaVisual,
          Cliente: s.cliente,
          Patente: s.patente || "",
          Tipo: s.tipo,
          Rider: s.rider,
          Monto: s.monto,
          Cobro: s.cobro || "",
          Estado: s.estado,
        }));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(svcsData), "Servicios");

      // Hoja 3: Ventas de baterías del mes
      const ventasData = historiales.ventas
        .filter((v) => !filterMonth || v.fechaInput.startsWith(filterMonth))
        .map((v) => ({
          Fecha: v.fechaVisual,
          Cliente: v.cliente,
          Patente: v.patente || "",
          Batería: v.modeloBat,
          Vehículo: v.autoTexto,
          Pago: v.metodoPago,
          Rider: v.rider,
          Total: v.total,
          "Costo Lote": v.costoLote,
        }));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(ventasData), "Ventas Baterías");

      // Hoja 4: Ranking riders
      const ridersData = riderRanking.map((r) => ({
        Rider: r.rider,
        Servicios: r.servicios,
        Baterías: r.baterias,
        Total: r.total,
      }));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(ridersData), "Riders");

      XLSX.writeFile(wb, `AVEX_${monthLabel.replace("/", "-")}.xlsx`);
      toast.success("Archivo Excel generado correctamente");
    } catch {
      toast.error("Error al generar el Excel");
    }
  };

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
          {/* Chart header + switches */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h5 className="font-bold">
              {viewByAseguradora ? "Auxilios por Aseguradora" : "Auxilios vs Baterías"} —{" "}
              {viewMonthly ? "Año" : "Mes"}
            </h5>
            <div className="flex items-center gap-4 flex-wrap">
              {/* Switch 1: Vista general / por aseguradora */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-medium">General</span>
                <Switch
                  checked={viewByAseguradora}
                  onCheckedChange={(v) => {
                    setViewByAseguradora(v);
                    setHiddenSeries({});
                  }}
                  className="data-[state=checked]:bg-amber-500"
                />
                <span className="text-xs text-muted-foreground font-medium">Aseguradora</span>
              </div>
              {/* Switch 2: Diario / Mensual */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-medium">Diario</span>
                <Switch
                  checked={viewMonthly}
                  onCheckedChange={(v) => {
                    setViewMonthly(v);
                    setHiddenSeries({});
                  }}
                  className="data-[state=checked]:bg-[#1C2333]"
                />
                <span className="text-xs text-muted-foreground font-medium">Mensual</span>
              </div>
            </div>
          </div>

          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barCategoryGap="25%" barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} width={28} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: 12,
                  }}
                />
                <Legend
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onClick={(e: any) => toggleSeries(e.dataKey as string)}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(value, entry: any) => (
                    <span
                      style={{
                        color: hiddenSeries[entry.dataKey] ? "#9ca3af" : undefined,
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: 12,
                        textDecoration: hiddenSeries[entry.dataKey] ? "line-through" : "none",
                      }}
                    >
                      {value}
                    </span>
                  )}
                />
                {viewByAseguradora ? (
                  INSURANCE_PROVIDERS.map((provider) => (
                    <Bar
                      key={provider}
                      dataKey={provider}
                      name={provider}
                      fill={ASEGURADORA_COLORS[provider] ?? "#6b7280"}
                      radius={[4, 4, 0, 0]}
                      hide={!!hiddenSeries[provider]}
                    />
                  ))
                ) : ([
                  <Bar
                    key="auxilios"
                    dataKey="auxilios"
                    name="Auxilios"
                    fill="#111827"
                    radius={[4, 4, 0, 0]}
                    hide={!!hiddenSeries["auxilios"]}
                  />,
                  <Bar
                    key="baterias"
                    dataKey="baterias"
                    name="Baterias"
                    fill="#facc15"
                    radius={[4, 4, 0, 0]}
                    hide={!!hiddenSeries["baterias"]}
                  />,
                ])}
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
