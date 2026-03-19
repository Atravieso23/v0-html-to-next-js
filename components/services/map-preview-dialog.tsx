"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getGoogleMapsUrl } from "@/lib/helpers";

interface MapPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  address: string;
}

export function MapPreviewDialog({ open, onOpenChange, address }: MapPreviewDialogProps) {
  const embedUrl = getGoogleMapsUrl(address, true);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden">
        <DialogHeader className="avex-bg-dark text-white p-3 border-b-4 border-primary">
          <DialogTitle className="text-primary font-bold">Verificando Direccion</DialogTitle>
        </DialogHeader>

        <div className="bg-muted p-0">
          <iframe
            src={embedUrl}
            width="100%"
            height="400"
            style={{ border: 0, display: "block" }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Vista previa del mapa"
          />
        </div>

        <DialogFooter className="bg-muted p-2">
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
            className="w-full font-bold"
          >
            Cerrar Mapa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
