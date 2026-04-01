"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Service } from "@/lib/types";

// Fix default icon paths broken by webpack/next
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const STATUS_COLORS: Record<string, string> = {
  "Pendiente":    "#f59e0b",
  "En camino":    "#3b82f6",
  "En el lugar":  "#22c55e",
  "Finalizado":   "#94a3b8",
};

/**
 * Crea un icono circular con:
 *  - Fondo del color del rider
 *  - Borde del color del estado (indica estado de un vistazo)
 *  - Número del servicio dentro del círculo (numeración por rider)
 */
function createMarkerIcon(riderColor: string, statusColor: string, number: number) {
  const html = `
    <div style="
      background: ${riderColor};
      width: 34px;
      height: 34px;
      border-radius: 50%;
      border: 3px solid ${statusColor};
      box-shadow: 0 2px 8px rgba(0,0,0,0.35);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 14px;
      font-family: sans-serif;
      line-height: 1;
    ">${number}</div>
  `;
  return L.divIcon({
    html,
    className: "",
    iconSize:    [34, 34],
    iconAnchor:  [17, 17],
    popupAnchor: [0, -20],
  });
}

// Ajusta los bounds del mapa cuando cambian los marcadores
function MapBounds({ services }: { services: Service[] }) {
  const map = useMap();
  useEffect(() => {
    const pts = services
      .filter((s) => s.lat && s.lng)
      .map((s) => [s.lat!, s.lng!] as [number, number]);
    if (pts.length > 0) {
      map.fitBounds(pts, { padding: [50, 50], maxZoom: 15 });
    }
  }, [map, services]);
  return null;
}

interface Props {
  services:       Service[];
  riderColors:    Record<string, string>;
  serviceNumbers: Record<string, number>;
  onSelect:       (service: Service) => void;
  selectedId?:    string;
}

export default function LeafletMap({
  services,
  riderColors,
  serviceNumbers,
  onSelect,
  selectedId,
}: Props) {
  const center: [number, number] = [-34.6037, -58.3816];

  return (
    <MapContainer center={center} zoom={12} style={{ width: "100%", height: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      <MapBounds services={services} />

      {services.map((service) => {
        if (!service.lat || !service.lng) return null;

        const riderColor  = riderColors[service.rider] || "#6b7280";
        const statusColor = STATUS_COLORS[service.estado] || "#94a3b8";
        const num         = serviceNumbers[service.id] ?? 0;
        const icon        = createMarkerIcon(riderColor, statusColor, num);

        return (
          <Marker
            key={service.id}
            position={[service.lat, service.lng]}
            icon={icon}
            eventHandlers={{ click: () => onSelect(service) }}
          >
            <Popup>
              <div style={{ minWidth: "190px", fontFamily: "sans-serif", fontSize: "13px" }}>
                {/* Rider badge */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  marginBottom: "6px",
                }}>
                  <div style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "50%",
                    background: riderColor,
                    border: `2px solid ${statusColor}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "11px",
                    flexShrink: 0,
                  }}>{num}</div>
                  <span style={{ fontWeight: "bold" }}>{service.cliente}</span>
                </div>

                {/* ID */}
                <div style={{ color: "#6b7280", fontSize: "11px", marginBottom: "4px" }}>
                  ID: {service.id}
                </div>

                {/* Estado */}
                <div style={{ marginBottom: "4px" }}>
                  <span style={{
                    background: statusColor,
                    color: "white",
                    padding: "1px 6px",
                    borderRadius: "999px",
                    fontSize: "11px",
                    fontWeight: "600",
                  }}>{service.estado}</span>
                  <span style={{ marginLeft: "6px", color: "#6b7280", fontSize: "11px" }}>
                    {service.rider}
                  </span>
                </div>

                {/* Dirección */}
                <div style={{ color: "#374151", fontSize: "12px", marginBottom: "4px" }}>
                  {service.direccion}
                </div>

                {/* Hora de creación */}
                <div style={{ color: "#6b7280", fontSize: "11px" }}>
                  Creado: {service.tiempos?.creado || "—"}
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
