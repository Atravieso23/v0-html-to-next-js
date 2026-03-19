"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Maximize2, MapPin, Navigation, Clock, Phone, User } from "lucide-react";
import { useAppStore } from "@/lib/store";
import type { Service } from "@/lib/types";

export function MapTab() {
  const { pendingServices, inProgressServices } = useAppStore();
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const allServices = [...pendingServices, ...inProgressServices];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-500";
      case "assigned":
        return "bg-blue-500";
      case "in_progress":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendiente";
      case "assigned":
        return "Asignado";
      case "in_progress":
        return "En Progreso";
      default:
        return status;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-180px)]">
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
          <div
            ref={mapContainerRef}
            className="w-full h-full bg-muted/30 flex items-center justify-center relative"
          >
            {/* Placeholder for map - In production, use Leaflet or similar */}
            <div className="text-center text-muted-foreground">
              <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Mapa interactivo</p>
              <p className="text-xs mt-1">
                Integra Leaflet o Google Maps para visualizar servicios
              </p>
            </div>

            {/* Service markers overlay */}
            {allServices.map((service, index) => (
              <button
                key={service.id}
                onClick={() => setSelectedService(service)}
                className={`absolute w-8 h-8 rounded-full ${getStatusColor(
                  service.status
                )} text-white flex items-center justify-center text-xs font-bold shadow-lg hover:scale-110 transition-transform cursor-pointer`}
                style={{
                  top: `${20 + (index * 15) % 60}%`,
                  left: `${20 + (index * 20) % 60}%`,
                }}
                title={service.clientName}
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
            <Badge variant="secondary">{allServices.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 flex-1 overflow-auto">
          {allServices.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No hay servicios activos</p>
            </div>
          ) : (
            <div className="divide-y">
              {allServices.map((service) => (
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
                          className={`${getStatusColor(service.status)} text-white text-xs`}
                        >
                          {getStatusLabel(service.status)}
                        </Badge>
                        {service.rider && (
                          <span className="text-xs text-muted-foreground truncate">
                            {service.rider}
                          </span>
                        )}
                      </div>
                      <p className="font-medium text-sm truncate">
                        {service.clientName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {service.address}
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
                  size="sm"
                  onClick={() => setSelectedService(null)}
                >
                  Cerrar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className={`${getStatusColor(selectedService.status)} text-white`}>
                  {getStatusLabel(selectedService.status)}
                </Badge>
                {selectedService.serviceType && (
                  <Badge variant="outline">{selectedService.serviceType}</Badge>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{selectedService.clientName}</p>
                    {selectedService.company && (
                      <p className="text-sm text-muted-foreground">
                        {selectedService.company}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <p>{selectedService.phone}</p>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <p className="text-sm">{selectedService.address}</p>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <p className="text-sm">
                    {new Date(selectedService.createdAt).toLocaleString("es-AR")}
                  </p>
                </div>
              </div>

              {selectedService.vehicleInfo && (
                <div className="pt-2 border-t">
                  <p className="text-sm font-medium mb-1">Vehículo</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedService.vehicleInfo.brand} {selectedService.vehicleInfo.model}
                    {selectedService.vehicleInfo.plate && ` - ${selectedService.vehicleInfo.plate}`}
                  </p>
                </div>
              )}

              {selectedService.observations && (
                <div className="pt-2 border-t">
                  <p className="text-sm font-medium mb-1">Observaciones</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedService.observations}
                  </p>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button className="flex-1" variant="outline">
                  <Phone className="h-4 w-4 mr-2" />
                  Llamar
                </Button>
                <Button className="flex-1">
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
