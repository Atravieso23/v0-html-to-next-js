"use client";

import dynamic from "next/dynamic";
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navigation, MapPin, Phone, X, User, Clock } from "lucide-react";
import { useAvexStore } from "@/lib/store";
import type { Service } from "@/lib/types";
import { getGoogleMapsUrl } from "@/lib/helpers";

// Leaflet sólo se carga en el cliente (no compatible con SSR)
const LeafletMap = dynamic(() => import("./leaflet-map"), { ssr: false });

function getStatusColor(status: string) {
  switch (status) {
    case "Pendiente": return { bg: "bg-amber-500", hex: "#f59e0b" };
    case "En camino": return { bg: "bg-blue-500", hex: "#3b82f6" };
    case "En el lugar": return { bg: "bg-green-500", hex: "#22c55e" };
    default: return { bg: "bg-slate-400", hex: "#94a3b8" };
  }
}

export function MapTab() {
  const servicios = useAvexStore((state) => state.servicios);
  const riderColors = useAvexStore((state) => state.riderColors);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const activeServices = useMemo(() =>
    Object.values(servicios).filter(
      (s) => s.estado !== "Finalizado" && s.estado !== "Cancelado" && s.estado !== "Programado"
    ),
    [servicios]
  );

  // Servicios con coordenadas para el mapa
  const mappableServices = useMemo(() =>
    activeServices.filter((s) => s.lat && s.lng),
    [activeServices]
  );

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-200px)]">
      {/* Mapa real con Leaflet */}
      <Card className="flex-1 min-h-[400px] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between py-3 border-b">
          <CardTitle className="text-lg">Mapa Operativo</CardTitle>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Pendiente
            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block ml-1" /> En camino
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block ml-1" /> En el lugar
          </div>
        </CardHeader>
        <CardContent className="p-0 h-[calc(100%-57px)]">
          {mappableServices.length === 0 ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 text-muted-foreground">
              <MapPin className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium text-sm">Sin servicios con ubicación</p>
              <p className="text-xs mt-1 text-center max-w-xs">
                Los servicios aparecen en el mapa cuando se geocodifica la dirección al crearlos
              </p>
            </div>
          ) : (
            <LeafletMap
              services={mappableServices}
              riderColors={riderColors}
              onSelect={setSelectedService}
              selectedId={selectedService?.id}
            />
          )}
        </CardContent>
      </Card>

      {/* Panel lateral */}
      <Card className="w-full lg:w-80 overflow-hidden flex flex-col">
        <CardHeader className="py-3 border-b">
          <CardTitle className="text-lg flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            Servicios Activos
            <Badge variant="secondary">{activeServices.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 flex-1 overflow-auto">
          {activeServices.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <MapPin className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">No hay servicios activos</p>
            </div>
          ) : (
            <div className="divide-y">
              {activeServices.map((service) => {
                const sc = getStatusColor(service.estado);
                const rColor = riderColors[service.rider] || "#888";
                const isSelected = selectedService?.id === service.id;
                return (
                  <button
                    key={service.id}
                    onClick={() => setSelectedService(isSelected ? null : service)}
                    className={`w-full p-3 text-left transition-colors ${isSelected ? "bg-yellow-50 border-l-4 border-l-yellow-400" : "hover:bg-slate-50"}`}
                  >
                    <div className="flex items-start gap-2">
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${sc.bg}`} />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">{service.cliente}</p>
                        <p className="text-xs text-muted-foreground truncate">{service.direccion}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: rColor }} />
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

      {/* Modal detalle */}
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
              <div className="flex items-center gap-2">
                <Badge className={`${getStatusColor(selectedService.estado).bg} text-white`}>
                  {selectedService.estado}
                </Badge>
                {selectedService.tipo && <Badge variant="outline">{selectedService.tipo}</Badge>}
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
                  <Button variant="outline" size="sm" className="flex-1"
                    onClick={() => window.open(`tel:${selectedService.celular}`, "_self")}>
                    <Phone className="h-3.5 w-3.5 mr-1" /> Llamar
                  </Button>
                )}
                <Button size="sm" className="flex-1 btn-avex"
                  onClick={() => window.open(getGoogleMapsUrl(selectedService.direccion), "_blank")}>
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
