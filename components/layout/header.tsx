"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Zap, Monitor, Smartphone, LogOut } from "lucide-react";
import { useAvexStore } from "@/lib/store";
import { useRouter } from "next/navigation";

export function Header() {
  const { currentView, setView, isDarkMode, toggleDarkMode, logout } = useAvexStore();
  const router = useRouter();
  const [clock, setClock] = useState("00:00:00");

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");
      setClock(`${hours}:${minutes}:${seconds}`);
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  return (
    <header className="sticky top-0 z-50 avex-bg-dark border-b-[3px] border-primary shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-baseline gap-3">
          <span className="flex items-center gap-1 text-xl font-bold avex-text-yellow">
            <Zap className="h-5 w-5" />
            AVEX
          </span>
          <span className="hidden md:inline text-muted-foreground text-sm font-bold">
            {clock}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleDarkMode}
            className="border-muted-foreground/30 text-white hover:bg-white/10 hover:text-white font-bold"
          >
            {isDarkMode ? (
              <>
                <Sun className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Claro</span>
              </>
            ) : (
              <>
                <Moon className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Oscuro</span>
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setView("admin")}
            className="bg-black text-yellow-400 border-black hover:bg-black/80 hover:text-yellow-300 font-bold"
          >
            <Monitor className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Panel Base</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setView("rider")}
            className="bg-black text-yellow-400 border-black hover:bg-black/80 hover:text-yellow-300 font-bold"
          >
            <Smartphone className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">App Rider</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => { logout(); router.push("/login"); }}
            className="text-slate-400 hover:text-white hover:bg-white/10 font-bold"
            title="Cerrar sesión"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
