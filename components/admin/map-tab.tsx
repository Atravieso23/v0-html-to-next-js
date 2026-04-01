"use client";

import dynamic from "next/dynamic";
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navigation, MapPin, Phone, X, User, Clock, ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { useAvexStore } from "@/lib/store";
import type { Service } from "@/lib/types";
import { getGoogleMapsUrl, getCurrentMoment } from "@/lib/helpers";

const LeafletMap = dynamic(() => import("./leaflet-map"), { ssr: false });

function getStatusColor(status: string) {
  switch (status) {
    case "Pendiente":    return { bg: "bg-amber-500",  hex: "#f59e0b" };
    case "En camino":   return { bg: "bg-blue-500",   hex: "#3b82f6" };
    case "En el lugar": return { bg: "bg-green-500",  hex: "#22c55e" };
    case "Finalizado":  return { bg: "bg-slate-400",  hex: "#94a3b8" };
    default:            return { bg: "bg-slate-300",  hex: "#cbd5e1" };
  }
}

/** Suma días a una fecha en formato YYYY-MM-DD */
function shiftDate(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  const yy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

/** Convierte YYYY-MM-DD → DD/MM/YYYY para mostrar */
function toDisplay(dateStr: string): string {
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

export function MapTab() {
  const servicios   = useAvexStore((state) => state.servicios);
  const riderColors = useAvexStore((state) => state.riderColors);

  const todayStr = useMemo(() => getCurrentMoment().fechaInput, []);

  const [selectedDate,    setSelectedDate]    = useState<string>(todayStr);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedRider,   setSelectedRider]   = useState<string | null>(null);

  // ── 1. Filtrar por fecha ───────────────────────────────────────────────────
  const dayServices = useMemo(() =>
    Object.values(servicios)
      .filter(
        (s) =>
          s.estado !== "Cancelado" &&
          s.estado !== "Programado" &&
          s.fechaInput === selectedDate
      )
      .sort((a, b) => a.orden - b.orden),
    [servicios, selectedDate]
  );

  // ── 2. Solo los que tienen coordenadas ────────────────────────────────────
  const mappableServices = useMemo(() =>
    dayServices.filter((s) => s.lat && s.lng),
    [dayServices]
  );

  // ── 3. Riders únicos del día seleccionado ─────────────────────────────────
  const riders = useMemo(() => {
    const set = new Set(dayServices.map((s) => s.rider));
    return Array.from(set).sort();
  }, [dayServices]);

  // ── 4. Numeración por rider (dentro del día seleccionado) ─────────────────
  const serviceNumbers = useMemo(() => {
    const nums: Record<string, number> = {};
    const byRider: Record<string, Service[]> = {};
    for (const s of mappableServices) {
      if (!byRider[s.rider]) byRider[s.rider] = [];
      byRider[s.rider].push(s);
    }
    for (const rider of Object.keys(byRider)) {
      byRider[rider]
        .sort((a, b) => a.orden - b.orden)
        .forEach((s, i) => { nums[s.id] = i + 1; });
    }
    return nums;
  }, [mappableServices]);

  // ── 5. Filtro adicional por rider ─────────────────────────────────────────
  const filteredMappable = useMemo(() =>
    selectedRider
      ? mappableServices.filter((s) => s.rider === selectedRider)
      : mappableServices,
    [mappableServices, selectedRider]
  );

  const filteredSidebar = useMemo(() =>
    selectedRider
      ? dayServices.filter((s) => s.rider === selectedRider)
      : dayServices,
    [dayServices, selectedRider]
  );

  const isToday = selectedDate === todayStr;

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-200px)]">

      {/* ── Mapa ─────────────────────────────────────────────────────────── */}
      <Card className="flex-1 min-h-[400px] overflow-hidden flex flex-col">
        <CardHeader className="py-3 border-b space-y-2">

          {/* Fila 1: título + leyenda */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-lg">Mapa Operativo</CardTitle>
            <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Pendiente
              <span className="w-2 h-2 rounded-full bg-blue-500  inline-block ml-1" /> En camino
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block ml-1" /> En el lugar
              <span className="w-2 h-2 rounded-full bg-slate-400 inline-block ml-1" /> Finalizado
            </div>
          </div>

          {/* Fila 2: selector de fecha */}
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground shrink-0" />
            <Button
              variant="outline" size="icon"
              className="h-7 w-7"
              onClick={() => { setSelectedDate((d) => shiftDate(d, -1)); setSelectedService(null); }}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>

            <div className="relative flex items-center">
              <input
                type="date"
                value={selectedDate}
                max={todayStr}
                onChange={(e) => { setSelectedDate(e.target.value); setSelectedService(null); }}
                className="h-7 rounded-md border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
              />
            </div>

            <Button
              variant="outline" size="icon"
              className="h-7 w-7"
              disabled={isToday}
              onClick={() => { setSelectedDate((d) => shiftDate(d, +1)); setSelectedService(null); }}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>

            {!isToday && (
              <Button
                variant="ghost" size="sm"
                className="h-7 text-xs text-muted-foreground"
                onClick={() => { setSelectedDate(todayStr); setSelectedService(null); }}
              >
                Hoy
              </Button>
            )}

            <span className="text-xs text-muted-foreground ml-auto">
              {toDisplay(selectedDate)}
              {isToday && " · Hoy"}
            </span>
          </div>

          {/* Fila 3: filtros por rider */}
          <div className="flex flex-wrap gap-1.5">
            <Button
              size="sm"
              variant={selectedRider === null ? "default" : "outline"}
              className="h-7 text-xs"
              onClick={() => setSelectedRider(null)}
            >
              Mostrar Todos
            </Button>
            {riders.map((rider) => (
              <Button
                key={rider}
                size="sm"
                variant={selectedRider === rider ? "default" : "outline"}
                className="h-7 text-xs flex items-center gap-1.5"
                onClick={() => setSelectedRider(selectedRider === rider ? null : rider)}
              >
                <span
                  className="w-2 h-2 rounded-full inline-block shrink-0"
                  style={{ backgroundColor: riderColors[rider] || "#888" }}
                />
                {rider}
              </Button>
            ))}
          </div>
        </CardHeader>

        <CardContent className="p-0 flex-1 overflow-hidden">
          {filteredMappable.length === 0 ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 text-muted-foreground">
              <MapPin className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium text-sm">
                {dayServices.length === 0
                  ? "Sin servicios para esta fecha"
                  : "Sin servicios con ubicación"}
              </p>
              <p className="text-xs mt-1 text-center max-w-xs">
                {dayServices.length === 0
                  ? `No hay servicios registrados el ${toDisplay(selectedDate)}`
                  : "Los servicios aparecen cuando se geocodifica la dirección al crearlos"}
              </p>
            </div>
          ) : (
            <LeafletMap
              services={filteredMappable}
              riderColors={riderColors}
              serviceNumbers={serviceNumbers}
              onSelect={setSelectedService}
              selectedId={selectedService?.id}
            />
          )}
        </CardContent>
      </Card>

      {/* ── Panel lateral ────────────────────────────────────────────────── */}
      <Card className="w-full lg:w-80 overflow-hidden flex flex-col">
        <CardHeader className="py-3 border-b">
          <CardTitle className="text-lg flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            {selectedRider ? `Rider: ${selectedRider}` : "Servicios del día"}
            <Badge variant="secondary">{filteredSidebar.length}</Badge>
          </CardTitle>
          <p className="text-xs text-muted-foreground">{toDisplay(selectedDate)}</p>
        </CardHeader>

        <CardContent className="p-0 flex-1 overflow-auto">
          {filteredSidebar.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <MapPin className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">No hay servicios</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredSidebar.map((service) => {
                const sc         = getStatusColor(service.estado);
                const rColor     = riderColors[service.rider] || "#888";
                const isSelected = selectedService?.id === service.id;
                const num        = serviceNumbers[service.id];
                const isDone     = service.estado === "Finalizado";

                return (
                  <button
                    key={service.id}
                    onClick={() => setSelectedService(isSelected ? null : service)}
                    className={`w-full p-3 text-left transition-colors
                      ${isSelected ? "bg-yellow-50 border-l-4 border-l-yellow-400" : "hover:bg-slate-50"}
                      ${isDone ? "opacity-55" : ""}
                    `}
                  >
                    <div className="flex items-start gap-2">
                      {/* Círculo con color del rider + número */}
                      <div
                        className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-white text-[10px] font-bold mt-0.5"
                        style={{
                          backgroundColor: rColor,
                          boxShadow: `0 0 0 2px ${sc.hex}`,
                        }}
                      >
                        {num ?? "·"}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">{service.cliente}</p>
                        <p className="text-xs text-muted-foreground truncate">{service.direccion}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-muted-foreground">{service.rider}</span>
                          <Badge className={`${sc.bg} text-white text-[9px] px-1 py-0 ml-auto`}>
                            {service.estado}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Modal detalle ────────────────────────────────────────────────── */}
      {selectedService && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[9999]">
          <Card className="w-full max-w-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{selectedService.cliente}</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setSelectedService(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={`${getStatusColor(selectedService.estado).bg} text-white`}>
                  {selectedService.estado}
                </Badge>
                {selectedService.tipo && <Badge variant="outline">{selectedService.tipo}</Badge>}
                <span className="text-xs text-muted-foreground ml-auto">
                  ID: {selectedService.id}
                </span>
              </div>

              <div className="flex items-start gap-2">
                <User className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">{selectedService.cliente}</p>
                  <p className="text-xs text-muted-foreground">{selectedService.aseguradora}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <p>{selectedService.direccion}</p>
              </div>

              {selectedService.celular && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                  <p>{selectedService.celular}</p>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                <p>Creado: {selectedService.tiempos?.creado || "—"}</p>
              </div>

              {(selectedService.marca || selectedService.modelo) && (
                <p className="text-xs text-muted-foreground border-t pt-2">
                  {selectedService.marca} {selectedService.modelo}
                  {selectedService.patente && ` · ${selectedService.patente}`}
                </p>
              )}

              <div className="flex gap-2 pt-1">
                {selectedService.celular && (
                  <Button
                    variant="outline" size="sm" className="flex-1"
                    onClick={() => window.open(`tel:${selectedService.celular}`, "_self")}
                  >
                    <Phone className="h-3.5 w-3.5 mr-1" /> Llamar
                  </Button>
                )}
                <Button
                  size="sm" className="flex-1 btn-avex"
                  onClick={() => window.open(getGoogleMapsUrl(selectedService.direccion), "_blank")}
                >
                  <Navigation className="h-3.5 w-3.5 mr-1" /> Navegar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
