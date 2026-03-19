"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { LoadingScreen } from "@/components/layout/loading-screen";
import { ServicesTab } from "@/components/admin/services-tab";
import { MapTab } from "@/components/admin/map-tab";
import { PurchaseTab } from "@/components/admin/purchase-tab";
import { SalesTab } from "@/components/admin/sales-tab";
import { StockTab } from "@/components/admin/stock-tab";
import { DashboardTab } from "@/components/admin/dashboard-tab";
import { HistoryTabs } from "@/components/admin/history-tabs";
import { CatalogTab } from "@/components/admin/catalog-tab";
import { useAppStore } from "@/lib/store";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

type TabType =
  | "servicios"
  | "mapa"
  | "compras"
  | "ventas"
  | "stock"
  | "dashboard"
  | "historial"
  | "catalogo";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>("servicios");
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { initializeMockData } = useAppStore();

  useEffect(() => {
    // Initialize mock data and simulate loading
    initializeMockData();
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, [initializeMockData]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setIsMobileSidebarOpen(false);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case "servicios":
        return <ServicesTab />;
      case "mapa":
        return <MapTab />;
      case "compras":
        return <PurchaseTab />;
      case "ventas":
        return <SalesTab />;
      case "stock":
        return <StockTab />;
      case "dashboard":
        return <DashboardTab />;
      case "historial":
        return <HistoryTabs />;
      case "catalogo":
        return <CatalogTab />;
      default:
        return <ServicesTab />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 border-r bg-card min-h-[calc(100vh-64px)] sticky top-16">
          <AdminSidebar activeTab={activeTab} onTabChange={handleTabChange} />
        </aside>

        {/* Mobile Sidebar */}
        <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
          <SheetContent side="left" className="w-64 p-0">
            <div className="pt-4">
              <AdminSidebar activeTab={activeTab} onTabChange={handleTabChange} />
            </div>
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6">
          {/* Mobile Menu Button */}
          <div className="lg:hidden mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMobileSidebarOpen(true)}
            >
              <Menu className="h-4 w-4 mr-2" />
              Menu
            </Button>
          </div>

          {/* Tab Title */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold capitalize">{activeTab}</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {activeTab === "servicios" && "Gestiona los servicios de auxilio"}
              {activeTab === "mapa" && "Visualiza la ubicacion de los servicios"}
              {activeTab === "compras" && "Registra compras de baterias"}
              {activeTab === "ventas" && "Registra ventas de baterias"}
              {activeTab === "stock" && "Controla el inventario de baterias"}
              {activeTab === "dashboard" && "Metricas y estadisticas del negocio"}
              {activeTab === "historial" && "Consulta el historial de operaciones"}
              {activeTab === "catalogo" && "Gestiona el catalogo de productos"}
            </p>
          </div>

          {renderContent()}
        </main>
      </div>
    </div>
  );
}
