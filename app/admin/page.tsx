"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { LoadingScreen } from "@/components/layout/loading-screen";
import { ServicesTab } from "@/components/admin/services-tab";
import { MapTab } from "@/components/admin/map-tab";
import { PurchaseTab } from "@/components/admin/purchase-tab";
import { SalesTab } from "@/components/admin/sales-tab";
import { StockTab } from "@/components/admin/stock-tab";
import { DashboardTab } from "@/components/admin/dashboard-tab";
import { ServicesHistoryTab, BatteriesHistoryTab } from "@/components/admin/history-tabs";
import { CatalogTab } from "@/components/admin/catalog-tab";
import { GarantiasTab } from "@/components/admin/garantias-tab";
import { UsuariosTab } from "@/components/admin/usuarios-tab";
import { ConfigTab } from "@/components/admin/config-tab";
import { RiderView } from "@/components/rider/rider-view";
import { useAvexStore } from "@/lib/store";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import type { AdminTab } from "@/lib/types";
import { useRouter } from "next/navigation";

const TAB_TITLES: Record<AdminTab, { title: string; subtitle: string }> = {
  servicios:           { title: "Cargar Servicio",      subtitle: "Creá y asigná nuevos servicios de auxilio" },
  "mapa-operativo":    { title: "Mapa Operativo",       subtitle: "Visualizá la ubicación de los servicios activos" },
  "compras-avanzado":  { title: "Cargar Compra",        subtitle: "Registrá compras de baterías e inventario" },
  ventas:              { title: "Stock y Ventas",        subtitle: "Gestioná ventas y controlá el inventario" },
  resumen:             { title: "Dashboard General",    subtitle: "Métricas y estadísticas del negocio" },
  "historial-servicios": { title: "Historial Servicios", subtitle: "Registro completo de todos los servicios finalizados" },
  "historial-baterias":  { title: "Historial Baterías",  subtitle: "Registro de compras y ventas de baterías" },
  catalogo:            { title: "Catálogo y Precios",   subtitle: "Gestioná el catálogo de productos y precios" },
  garantias:           { title: "Generar Garantía",     subtitle: "Creá garantías para los servicios realizados" },
  usuarios:            { title: "Gestión de Usuarios",  subtitle: "Administrá accesos y roles del sistema" },
  configuracion:       { title: "Configuración",        subtitle: "Gestioná riders y aseguradoras del sistema" },
};

function renderTab(tab: AdminTab) {
  switch (tab) {
    case "servicios":          return <ServicesTab />;
    case "mapa-operativo":     return <MapTab />;
    case "compras-avanzado":   return <PurchaseTab />;
    case "ventas":             return <SalesTab />;
    case "resumen":            return <DashboardTab />;
    case "historial-servicios": return <ServicesHistoryTab />;
    case "historial-baterias":  return <BatteriesHistoryTab />;
    case "catalogo":           return <CatalogTab />;
    case "garantias":          return <GarantiasTab />;
    case "usuarios":           return <UsuariosTab />;
    case "configuracion":      return <ConfigTab />;
    default:                   return <ServicesTab />;
  }
}

export default function AdminPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const { initializeMockData, activeAdminTab, currentView, isAuthenticated, currentUser } = useAvexStore();

  useEffect(() => {
    if (!isAuthenticated || currentUser?.role !== "admin") {
      router.replace("/login");
      return;
    }
    initializeMockData();
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, [initializeMockData, isAuthenticated, currentUser, router]);

  if (!isAuthenticated || currentUser?.role !== "admin" || isLoading) return <LoadingScreen />;

  // Vista rider (cuando se toca "App Rider" en el header)
  if (currentView === "rider") {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-4xl mx-auto p-4 lg:p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">App Rider</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Vista de los riders — seguimiento de viajes asignados
            </p>
          </div>
          <RiderView mode="admin" />
        </main>
      </div>
    );
  }

  const tabInfo = TAB_TITLES[activeAdminTab] ?? TAB_TITLES["servicios"];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="flex">
        {/* Sidebar desktop */}
        <aside className="hidden lg:block w-64 border-r bg-card min-h-[calc(100vh-64px)] sticky top-16">
          <AdminSidebar />
        </aside>

        {/* Sidebar mobile */}
        <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
          <SheetContent side="left" className="w-64 p-0">
            <div className="pt-4">
              <AdminSidebar />
            </div>
          </SheetContent>
        </Sheet>

        {/* Contenido principal */}
        <main className="flex-1 p-4 lg:p-6">
          {/* Botón menú mobile */}
          <div className="lg:hidden mb-4">
            <Button variant="outline" size="sm" onClick={() => setIsMobileSidebarOpen(true)}>
              <Menu className="h-4 w-4 mr-2" />
              Menu
            </Button>
          </div>

          {/* Título de la sección */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold">{tabInfo.title}</h1>
            <p className="text-muted-foreground text-sm mt-1">{tabInfo.subtitle}</p>
          </div>

          {renderTab(activeAdminTab)}
        </main>
      </div>
    </div>
  );
}