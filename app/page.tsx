"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Wrench,
  Smartphone,
  Battery,
  MapPin,
  BarChart3,
  Clock,
  Shield,
  Zap,
  ArrowRight,
} from "lucide-react";
import { LoadingScreen } from "@/components/layout/loading-screen";

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">AVEX</span>
          </div>
          <nav className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/rider">App Rider</Link>
            </Button>
            <Button asChild>
              <Link href="/admin">Panel Admin</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 lg:py-24 px-4">
        <div className="container mx-auto max-w-5xl text-center">
          <Badge variant="secondary" className="mb-4">
            Sistema de Gestion Integral
          </Badge>
          <h1 className="text-4xl lg:text-6xl font-bold tracking-tight mb-6 text-balance">
            Gestion completa de servicios de auxilio y baterias
          </h1>
          <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 text-pretty">
            Administra servicios de auxilio mecanico, controla tu inventario de baterias,
            gestiona compras y ventas, todo desde una sola plataforma.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/admin">
                Acceder al Panel
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/rider">
                <Smartphone className="mr-2 h-5 w-5" />
                Vista Rider
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Funcionalidades Principales</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Todo lo que necesitas para gestionar tu negocio de servicios de auxilio y venta de baterias
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="group hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                  <Wrench className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Gestion de Servicios</CardTitle>
                <CardDescription>
                  Crea, asigna y finaliza servicios de auxilio con todos los detalles necesarios
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Mapa Operativo</CardTitle>
                <CardDescription>
                  Visualiza todos los servicios activos en un mapa interactivo en tiempo real
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                  <Battery className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Control de Stock</CardTitle>
                <CardDescription>
                  Administra tu inventario de baterias con alertas de stock minimo
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Dashboard Analitico</CardTitle>
                <CardDescription>
                  Metricas y estadisticas detalladas de tu operacion diaria y mensual
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                  <Smartphone className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>App para Riders</CardTitle>
                <CardDescription>
                  Aplicacion movil optimizada para tecnicos en campo con firma digital
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Historial Completo</CardTitle>
                <CardDescription>
                  Registro detallado de todas las operaciones con busqueda avanzada
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Quick Access */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-card border-2 hover:border-primary transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center shrink-0">
                    <Shield className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">Panel de Administracion</h3>
                    <p className="text-muted-foreground mb-4">
                      Accede al panel completo para gestionar servicios, inventario, compras y ventas
                    </p>
                    <Button asChild>
                      <Link href="/admin">
                        Ir al Panel
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-2 hover:border-primary transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-foreground flex items-center justify-center shrink-0">
                    <Smartphone className="h-7 w-7 text-background" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">App Rider</h3>
                    <p className="text-muted-foreground mb-4">
                      Vista optimizada para tecnicos en campo con acceso a servicios asignados
                    </p>
                    <Button variant="outline" asChild>
                      <Link href="/rider">
                        Abrir App
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Zap className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold">AVEX</span>
              <span className="text-muted-foreground text-sm">
                - Sistema de Gestion Integral
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Desarrollado con Next.js y TypeScript
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
