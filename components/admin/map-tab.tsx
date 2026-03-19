"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Maximize2, MapPin, Navigation, Clock, Phone, User, X } from "lucide-react";
import { useAvexStore } from "@/lib/store";
import type { Service } from "@/lib/types";
import { getGoogleMapsUrl } from "@/lib/helpers";

export function MapTab() {
  const servicios = useAvexStore((state) => state.servicios);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const activeServices = useMemo(() => 
    Object.values(servicios).filter(
      (s) => s.estado !== "Finalizado" && s.estado !== "Cancelado" && s.estado !== "Programado"
    ),
    [servicios]
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pendiente":
        return "bg-amber-500";
      case "En camino":
        return "bg-blue-500";
      case "En lugar":
        return "bg-green-500";
      default:
        return "bg-muted-foreground";
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-200px)]">
      {/* Map Container */}
      <Card className="flex-1 min-h-[400px]">
        <CardHeader className="flex flex-row items-center justify-between py-3">
          <CardTitle className="text-lg">Mapa Operativo</CardTitle>
          <Button variant="outline" size="sm">
            <Maximize2 className="h-4 w-4 mr-2" />
            Pantalla Completa
          </Button>
        </CardHeader>
        <CardContent className="p-0 h-[calc(100%-60px)]">
          <div className="w-full h-full bg-muted/30 flex items-center justify-center relative">
            {/* Placeholder for map - In production, use Leaflet */}
            <div className="text-center text-muted-foreground">
              <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Mapa interactivo</p>
              <p className="text-xs mt-1">
                Integra Leaflet o Google Maps para visualizar servicios
              </p>
            </div>

            {/* Service markers overlay */}
            {activeServices.map((service, index) => (
              <button
                key={service.id}
                onClick={() => setSelectedService(service)}
                className={`absolute w-8 h-8 rounded-full ${getStatusColor(
                  service.estado
                )} text-white flex items-center justify-center text-xs font-bold shadow-lg hover:scale-110 transition-transform cursor-pointer`}
                style={{
                  top: `${20 + (index * 15) % 60}%`,
                  left: `${20 + (index * 20) % 60}%`,
                }}
                title={service.cliente}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Services Panel */}
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
            <div className="p-4 text-center text-muted-foreground">
              <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No hay servicios activos</p>
            </div>
          ) : (
            <div className="divide-y">
              {activeServices.map((service) => (
                <button
                  key={service.id}
                  onClick={() => setSelectedService(service)}
                  className={`w-full p-3 text-left hover:bg-muted/50 transition-colors ${
                    selectedService?.id === service.id ? "bg-muted" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          className={`${getStatusColor(service.estado)} text-white text-xs`}
                        >
                          {service.estado}
                        </Badge>
                        {service.rider && (
                          <span className="text-xs text-muted-foreground truncate">
                            {service.rider}
                          </span>
                        )}
                      </div>
                      <p className="font-medium text-sm truncate">
                        {service.cliente}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {service.direccion}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Service Detail */}
      {selectedService && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Detalle del Servicio</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedService(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className={`${getStatusColor(selectedService.estado)} text-white`}>
                  {selectedService.estado}
                </Badge>
                {selectedService.tipoServicio && (
                  <Badge variant="outline">{selectedService.tipoServicio}</Badge>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{selectedService.cliente}</p>
                    {selectedService.aseguradora && (
                      <p className="text-sm text-muted-foreground">
                        {selectedService.aseguradora}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <p>{selectedService.telefono}</p>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <p className="text-sm">{selectedService.direccion}</p>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <p className="text-sm">
                    Creado: {selectedService.tiempos?.creado || "-"}
                  </p>
                </div>
              </div>

              {(selectedService.marca || selectedService.modelo) && (
                <div className="pt-2 border-t">
                  <p className="text-sm font-medium mb-1">Vehiculo</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedService.marca} {selectedService.modelo}
                    {selectedService.patente && ` - ${selectedService.patente}`}
                  </p>
                </div>
              )}

              {selectedService.obs && (
                <div className="pt-2 border-t">
                  <p className="text-sm font-medium mb-1">Observaciones</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedService.obs}
                  </p>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  className="flex-1"
                  variant="outline"
                  onClick={() => window.open(`tel:${selectedService.telefono}`, "_self")}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Llamar
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => window.open(getGoogleMapsUrl(selectedService.direccion), "_blank")}
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  Navegar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
