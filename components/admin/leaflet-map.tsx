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
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function createColoredIcon(color: string, status: string) {
  const statusColors: Record<string, string> = {
    "Pendiente": "#f59e0b",
    "En camino": "#3b82f6",
    "En el lugar": "#22c55e",
  };
  const bg = statusColors[status] || "#94a3b8";
  const html = `
    <div style="
      background: ${bg};
      width: 32px; height: 32px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.4);
      display: flex; align-items: center; justify-content: center;
    ">
      <div style="transform: rotate(45deg); width: 10px; height: 10px; background: white; border-radius: 50%;"></div>
    </div>
  `;
  return L.divIcon({
    html,
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -34],
  });
}

// Centra el mapa cuando cambian los marcadores
function MapBounds({ services }: { services: Service[] }) {
  const map = useMap();
  useEffect(() => {
    const pts = services.filter((s) => s.lat && s.lng).map((s) => [s.lat!, s.lng!] as [number, number]);
    if (pts.length > 0) {
      map.fitBounds(pts, { padding: [50, 50], maxZoom: 15 });
    }
  }, [map, services]);
  return null;
}

interface Props {
  services: Service[];
  riderColors: Record<string, string>;
  onSelect: (service: Service) => void;
  selectedId?: string;
}

export default function LeafletMap({ services, riderColors, onSelect, selectedId }: Props) {
  // Centro de Argentina como fallback
  const center: [number, number] = [-34.6037, -58.3816];

  return (
    <MapContainer
      center={center}
      zoom={12}
      style={{ width: "100%", height: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      <MapBounds services={services} />
      {services.map((service) => {
        if (!service.lat || !service.lng) return null;
        const icon = createColoredIcon(riderColors[service.rider] || "#888", service.estado);
        return (
          <Marker
            key={service.id}
            position={[service.lat, service.lng]}
            icon={icon}
            eventHandlers={{ click: () => onSelect(service) }}
          >
            <Popup>
              <div className="text-sm min-w-[160px]">
                <p className="font-bold">{service.cliente}</p>
                <p className="text-xs text-gray-500">{service.estado} · {service.rider}</p>
                <p className="text-xs mt-1">{service.direccion}</p>
                {service.tipo && <p className="text-xs text-gray-500 mt-0.5">{service.tipo}</p>}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
