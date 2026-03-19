"use client";

import { Card } from "@/components/ui/card";
import { useAvexStore } from "@/lib/store";
import type { AdminTab } from "@/lib/types";
import {
  Car,
  Map,
  Package,
  Battery,
  BarChart3,
  FolderOpen,
  History,
  Settings,
  FileText,
} from "lucide-react";

interface NavItem {
  id: AdminTab;
  label: string;
  icon: React.ReactNode;
}

const operationsNav: NavItem[] = [
  { id: "servicios", label: "Cargar Servicio", icon: <Car className="h-4 w-4" /> },
  { id: "mapa-operativo", label: "Mapa Operativo", icon: <Map className="h-4 w-4" /> },
  { id: "compras-avanzado", label: "Cargar Compra", icon: <Package className="h-4 w-4" /> },
  { id: "ventas", label: "Panel Stock y Ventas", icon: <Battery className="h-4 w-4" /> },
  { id: "resumen", label: "Dashboard General", icon: <BarChart3 className="h-4 w-4" /> },
];

const adminNav: NavItem[] = [
  { id: "historial-servicios", label: "Historial Servicios", icon: <FolderOpen className="h-4 w-4" /> },
  { id: "historial-baterias", label: "Historial Baterias", icon: <History className="h-4 w-4" /> },
  { id: "catalogo", label: "Catalogo y Precios", icon: <Settings className="h-4 w-4" /> },
  { id: "garantias", label: "Generar Garantia", icon: <FileText className="h-4 w-4" /> },
];

export function AdminSidebar() {
  const { activeAdminTab, setAdminTab } = useAvexStore();

  return (
    <nav className="flex flex-col gap-3">
      {/* Bloque Operativo */}
      <Card className="p-2 border-0 border-l-[5px] border-l-primary shadow-sm">
        <h6 className="text-muted-foreground text-xs font-bold uppercase tracking-wider ml-2 mt-1 mb-2">
          Operaciones
        </h6>
        {operationsNav.map((item) => (
          <button
            key={item.id}
            onClick={() => setAdminTab(item.id)}
            className={`nav-link-avex flex items-center gap-2 mb-1 ${
              activeAdminTab === item.id ? "active" : ""
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </Card>

      {/* Bloque Administrativo */}
      <Card className="p-2 border-0 border-l-[5px] border-l-muted-foreground/50 shadow-sm">
        <h6 className="text-muted-foreground text-xs font-bold uppercase tracking-wider ml-2 mt-1 mb-2">
          Administracion
        </h6>
        {adminNav.map((item) => (
          <button
            key={item.id}
            onClick={() => setAdminTab(item.id)}
            className={`nav-link-avex flex items-center gap-2 mb-1 ${
              activeAdminTab === item.id ? "active" : ""
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </Card>
    </nav>
  );
}
