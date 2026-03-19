"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAvexStore, selectRiderServices } from "@/lib/store";
import { RIDERS, RIDER_COLORS, type RiderName, type Service } from "@/lib/types";
import { getCurrentMoment, getGoogleMapsUrl, getWhatsAppUrl } from "@/lib/helpers";
import {
  Navigation,
  MapPin,
  Phone,
  MessageCircle,
  CheckCircle,
  Clock,
  Car,
  Battery,
} from "lucide-react";
import { toast } from "sonner";
import { CloseServiceDialog } from "@/components/services/close-service-dialog";

function RiderServiceCard({
  service,
  onStatusChange,
  onClose,
}: {
  service: Service;
  onStatusChange: (status: Service["estado"]) => void;
  onClose: () => void;
}) {
  const autoText = [service.marca, service.modelo].filter(Boolean).join(" ") || "Auto sin registrar";
  const isNew = service.estado === "Pendiente";
  const isOnWay = service.estado === "En camino";
  const isOnSite = service.estado === "En el lugar";

  return (
    <Card className={`p-4 border-0 shadow-lg mb-4 overflow-hidden ${isNew ? "ring-2 ring-primary animate-pulse" : ""}`}>
      {/* Status Bar */}
      <div className={`-mx-4 -mt-4 px-4 py-2 mb-3 ${
        isNew ? "bg-primary text-primary-foreground" :
        isOnWay ? "bg-blue-500 text-white" :
        isOnSite ? "bg-green-500 text-white" : "bg-muted"
      }`}>
        <div className="flex justify-between items-center">
          <span className="font-bold text-sm uppercase tracking-wide">
            {isNew ? "NUEVO VIAJE" : isOnWay ? "EN CAMINO" : isOnSite ? "EN EL LUGAR" : service.estado}
          </span>
          <Badge variant="outline" className="bg-white/20 text-inherit border-white/30">
            {service.tipo}
          </Badge>
        </div>
      </div>

      {/* Client Info */}
      <div className="mb-4">
        <h3 className="font-bold text-xl mb-1">{service.cliente || "Sin nombre"}</h3>
        <p className="text-muted-foreground text-sm flex items-center gap-1">
          <Car className="h-4 w-4" />
          {autoText}
          {service.patente && (
            <span className="ml-2 bg-muted px-2 py-0.5 rounded font-mono text-xs">
              {service.patente}
            </span>
          )}
        </p>
      </div>

      {/* Address */}
      <div className="bg-muted/50 p-3 rounded-lg mb-4">
        <p className="font-medium text-sm flex items-start gap-2">
          <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-destructive" />
          <span>{service.direccion}</span>
        </p>
      </div>

      {/* Amount */}
      <div className="flex justify-between items-center mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
        <span className="font-bold">A cobrar:</span>
        <span className="text-2xl font-bold text-green-600">${service.monto}</span>
      </div>

      {/* Notes */}
      {service.notas && (
        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-l-4 border-l-yellow-500">
          <p className="text-sm">
            <strong>Notas:</strong> {service.notas}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-2">
        {/* Navigation */}
        <Button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 text-lg"
          onClick={() => window.open(getGoogleMapsUrl(service.direccion), "_blank")}
        >
          <Navigation className="h-5 w-5 mr-2" />
          ABRIR EN MAPS
        </Button>

        {/* Contact Buttons */}
        {service.celular && (
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              className="font-bold py-5"
              onClick={() => window.open(`tel:${service.celular}`, "_blank")}
            >
              <Phone className="h-4 w-4 mr-2" />
              Llamar
            </Button>
            <Button
              variant="outline"
              className="font-bold py-5 bg-green-50 hover:bg-green-100 border-green-300 text-green-700"
              onClick={() =>
                window.open(
                  getWhatsAppUrl(
                    service.celular!,
                    `Hola ${service.cliente}, soy de AVEX. Estoy en camino para el servicio de ${service.tipo}.`
                  ),
                  "_blank"
                )
              }
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              WhatsApp
            </Button>
          </div>
        )}

        {/* Status Change Buttons */}
        <div className="pt-2 border-t">
          {isNew && (
            <Button
              className="w-full btn-avex font-bold py-6 text-lg"
              onClick={() => onStatusChange("En camino")}
            >
              <Navigation className="h-5 w-5 mr-2" />
              SALIR EN CAMINO
            </Button>
          )}

          {isOnWay && (
            <Button
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-6 text-lg"
              onClick={() => onStatusChange("En el lugar")}
            >
              <MapPin className="h-5 w-5 mr-2" />
              LLEGUE AL LUGAR
            </Button>
          )}

          {isOnSite && (
            <Button
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-6 text-lg"
              onClick={onClose}
            >
              <CheckCircle className="h-5 w-5 mr-2" />
              FINALIZAR Y COBRAR
            </Button>
          )}
        </div>
      </div>

      {/* Timestamps */}
      <div className="mt-4 pt-3 border-t text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Asignado: {service.tiempos?.creado?.split(" - ")[1] || ""}
        </div>
      </div>
    </Card>
  );
}

function CompletedServiceCard({ service }: { service: Service }) {
  const autoText = [service.marca, service.modelo].filter(Boolean).join(" ") || "Auto sin registrar";
  const isCanceled = service.estado === "Cancelado" || service.cobro === "Cancelado";
  const didntPay = service.cobro === "No pagó";

  return (
    <Card className={`p-3 mb-3 border-0 shadow-sm ${
      isCanceled ? "border-l-4 border-l-muted-foreground bg-muted/30" :
      didntPay ? "border-l-4 border-l-destructive" :
      "border-l-4 border-l-green-500"
    }`}>
      <div className="flex justify-between items-start">
        <div>
          <Badge variant={isCanceled ? "secondary" : didntPay ? "destructive" : "default"} className="mb-1">
            {isCanceled ? "Cancelado" : service.cobro}
          </Badge>
          <p className="font-bold">{autoText}</p>
          <p className="text-xs text-muted-foreground truncate">{service.direccion}</p>
        </div>
        <span className={`font-bold ${didntPay ? "text-destructive" : "text-green-600"}`}>
          ${service.monto}
        </span>
      </div>
    </Card>
  );
}

function BatterySaleCard({ sale }: { sale: { modeloBat: string; autoTexto: string; metodoPago: string } }) {
  return (
    <Card className="p-3 mb-3 border-0 shadow-sm border-l-4 border-l-cyan-500 bg-cyan-50/50 dark:bg-cyan-900/20">
      <div className="flex justify-between items-start">
        <div>
          <Badge className="mb-1 bg-cyan-500">{sale.modeloBat}</Badge>
          <p className="font-bold text-sm">{sale.autoTexto}</p>
        </div>
        <Badge variant="outline">{sale.metodoPago}</Badge>
      </div>
    </Card>
  );
}

function RiderPanel({ rider }: { rider: RiderName }) {
  const services = useAvexStore((state) => selectRiderServices(state, rider));
  const updateService = useAvexStore((state) => state.updateService);
  const historiales = useAvexStore((state) => state.historiales);
  
  const [closingService, setClosingService] = useState<Service | null>(null);
  const riderColor = RIDER_COLORS[rider];
  const today = getCurrentMoment().fechaInput;

  // Filter services
  const activeServices = services.filter(
    (s) => s.estado !== "Finalizado" && s.estado !== "Cancelado" && s.estado !== "Programado"
  );
  const completedToday = services.filter(
    (s) => (s.estado === "Finalizado" || s.estado === "Cancelado") && s.fechaFinInput === today
  );
  const batteriesToday = historiales.ventas.filter(
    (v) => v.rider === rider && v.fechaInput === today
  );

  const handleStatusChange = (service: Service, newStatus: Service["estado"]) => {
    const momento = getCurrentMoment();
    const updates: Partial<Service> = { estado: newStatus };

    if (newStatus === "En camino") {
      updates.tiempos = { ...service.tiempos, camino: momento.completa };
    } else if (newStatus === "En el lugar") {
      updates.tiempos = { ...service.tiempos, llegada: momento.completa };
    }

    updateService(service.id, updates);
    toast.success(`Estado actualizado a: ${newStatus}`);
  };

  return (
    <div className="pb-8">
      {/* Rider Header */}
      <div
        className="sticky top-0 z-10 -mx-4 px-4 py-3 mb-4 shadow-md"
        style={{ backgroundColor: riderColor }}
      >
        <h2 className="text-white font-bold text-xl text-center">{rider}</h2>
      </div>

      {/* Active Services */}
      <div className="mb-6">
        <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
          <Car className="h-5 w-5" />
          Viajes Activos
          {activeServices.length > 0 && (
            <Badge variant="destructive" className="animate-pulse">
              {activeServices.length}
            </Badge>
          )}
        </h3>

        {activeServices.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground border-dashed">
            <p className="text-lg">Sin viajes pendientes</p>
            <p className="text-sm mt-1">Los nuevos viajes apareceran aqui</p>
          </Card>
        ) : (
          activeServices.map((service) => (
            <RiderServiceCard
              key={service.id}
              service={service}
              onStatusChange={(status) => handleStatusChange(service, status)}
              onClose={() => setClosingService(service)}
            />
          ))
        )}
      </div>

      {/* Today's Completed */}
      <div className="mb-6">
        <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          Finalizados Hoy
          <Badge variant="secondary">{completedToday.length}</Badge>
        </h3>

        {completedToday.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">Ninguno finalizado hoy</p>
        ) : (
          completedToday.map((service) => (
            <CompletedServiceCard key={service.id} service={service} />
          ))
        )}
      </div>

      {/* Today's Batteries */}
      <div>
        <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
          <Battery className="h-5 w-5 text-cyan-500" />
          Baterias Instaladas Hoy
          <Badge variant="secondary">{batteriesToday.length}</Badge>
        </h3>

        {batteriesToday.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">Ninguna bateria instalada hoy</p>
        ) : (
          batteriesToday.map((sale, idx) => <BatterySaleCard key={idx} sale={sale} />)
        )}
      </div>

      <CloseServiceDialog
        service={closingService}
        open={!!closingService}
        onOpenChange={(open) => !open && setClosingService(null)}
      />
    </div>
  );
}

export function RiderView() {
  const [activeRider, setActiveRider] = useState<RiderName>(RIDERS[0]);

  return (
    <div className="max-w-lg mx-auto px-4">
      {/* Rider Selector */}
      <Tabs value={activeRider} onValueChange={(v) => setActiveRider(v as RiderName)} className="w-full">
        <TabsList className="w-full grid grid-cols-3 mb-4 sticky top-[60px] z-20 bg-background shadow-sm">
          {RIDERS.map((rider) => (
            <TabsTrigger
              key={rider}
              value={rider}
              className="font-bold data-[state=active]:text-white"
              style={{
                backgroundColor: activeRider === rider ? RIDER_COLORS[rider] : undefined,
              }}
            >
              {rider}
            </TabsTrigger>
          ))}
        </TabsList>

        {RIDERS.map((rider) => (
          <TabsContent key={rider} value={rider} className="mt-0">
            <RiderPanel rider={rider} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
