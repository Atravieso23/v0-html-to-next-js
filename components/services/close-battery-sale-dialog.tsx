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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAvexStore } from "@/lib/store";
import type { BatterySale } from "@/lib/types";
import { getCurrentMoment } from "@/lib/helpers";

interface CloseBatterySaleDialogProps {
  sale: BatterySale | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CloseBatterySaleDialog({ sale, open, onOpenChange }: CloseBatterySaleDialogProps) {
  const updateBatterySaleById = useAvexStore((state) => state.updateBatterySaleById);
  const [observations, setObservations] = useState("");
  const [isCanceling, setIsCanceling] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = async (cancel: boolean) => {
    if (!sale) return;
    setIsSubmitting(true);
    try {
      const momento = getCurrentMoment();
      updateBatterySaleById(sale.id, {
        estado: cancel ? "Cancelado" : "Finalizado",
        fechaFinInput: momento.fechaInput,
        tiempos: { ...sale.tiempos, fin: momento.completa },
        obs: observations || undefined,
      });
      toast.success(cancel ? "Entrega cancelada" : "Entrega finalizada correctamente");
      setObservations("");
      setIsCanceling(false);
      onOpenChange(false);
    } catch {
      toast.error("Error al cerrar la entrega");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!sale) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="avex-bg-dark text-white -mx-6 -mt-6 px-6 py-4 rounded-t-lg border-b-4 border-blue-400">
          <DialogTitle className="text-blue-400 font-bold">Finalizar Entrega de Batería</DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-3">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-700 space-y-1">
            <p><span className="font-bold">Modelo:</span> {sale.modeloBat}</p>
            <p><span className="font-bold">Cliente:</span> {sale.cliente}</p>
            <p><span className="font-bold">Total cobrado:</span> ${sale.total.toLocaleString("es-AR")} ({sale.metodoPago})</p>
          </div>

          <div>
            <Label className="font-bold">Observaciones (Opcional)</Label>
            <Textarea
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              rows={2}
              className="mt-1"
              placeholder="Ej: Cliente conforme, batería instalada sin inconvenientes"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            className="border-red-300 text-red-600 hover:bg-red-50"
            onClick={() => handleClose(true)}
            disabled={isSubmitting}
          >
            Cancelar entrega
          </Button>
          <Button
            onClick={() => handleClose(false)}
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-700 text-white font-bold px-8"
          >
            {isSubmitting ? "Cerrando..." : "CONFIRMAR ENTREGA"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
