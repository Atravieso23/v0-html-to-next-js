"use client";

import { Loader2 } from "lucide-react";

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-background/95 z-[9999] flex flex-col justify-center items-center">
      <Loader2 className="h-14 w-14 animate-spin text-primary" />
      <h5 className="mt-4 font-bold text-foreground text-lg">
        Conectando con la base operativa...
      </h5>
    </div>
  );
}
