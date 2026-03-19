"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface PasteTextDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPaste: (text: string) => void;
}

export function PasteTextDialog({ open, onOpenChange, onPaste }: PasteTextDialogProps) {
  const [text, setText] = useState("");

  const handleProcess = () => {
    if (text.trim()) {
      onPaste(text);
      setText("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary font-bold">
            Pegar Texto del Seguro
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-3">
            Pega el texto del email o mensaje del seguro. El sistema extraera automaticamente
            los datos del cliente, direccion, vehiculo y tipo de servicio.
          </p>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Pega aqui el texto completo..."
            rows={8}
            className="resize-none"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleProcess} disabled={!text.trim()} className="btn-avex">
            Procesar Texto
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
