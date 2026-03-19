"use client";

import { useEffect, useRef, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useAvexStore } from "@/lib/store";
import type { Service, PaymentMethod } from "@/lib/types";
import { getCurrentMoment } from "@/lib/helpers";
import { Eraser } from "lucide-react";

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: "Efectivo", label: "Efectivo" },
  { value: "Mercado Pago", label: "Mercado Pago / QR" },
  { value: "Transferencia", label: "Transferencia Bancaria" },
  { value: "No pagó", label: "No pago / No resuelto" },
  { value: "Cancelado", label: "Cancelado (Falsa alarma)" },
];

interface CloseServiceDialogProps {
  service: Service | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CloseServiceDialog({ service, open, onOpenChange }: CloseServiceDialogProps) {
  const updateService = useAvexStore((state) => state.updateService);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Efectivo");
  const [observations, setObservations] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    if (open && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
      }
    }
  }, [open]);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    if ("touches" in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;
    
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx && canvas) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  const getSignatureData = (): string | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    // Check if canvas has any drawing
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const hasDrawing = imageData.data.some((pixel, index) => {
      // Check non-white pixels (skip alpha channel)
      return index % 4 !== 3 && pixel !== 255;
    });

    return hasDrawing ? canvas.toDataURL() : null;
  };

  const handleSubmit = async () => {
    if (!service) return;

    setIsSubmitting(true);

    try {
      const momento = getCurrentMoment();
      const signature = getSignatureData();
      const newStatus = paymentMethod === "Cancelado" ? "Cancelado" : "Finalizado";

      const updates: Partial<Service> = {
        estado: newStatus,
        cobro: paymentMethod,
        obs: observations,
        fechaFinInput: momento.fechaInput,
        tiempos: {
          ...service.tiempos,
          fin: momento.completa,
        },
      };

      if (signature && newStatus === "Finalizado") {
        updates.firma = signature;
      }

      updateService(service.id, updates);
      toast.success("Viaje cerrado correctamente");
      
      // Reset form
      setPaymentMethod("Efectivo");
      setObservations("");
      onOpenChange(false);
    } catch (error) {
      toast.error("Error al cerrar el viaje");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!service) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="avex-bg-dark text-white -mx-6 -mt-6 px-6 py-4 rounded-t-lg border-b-4 border-primary">
          <DialogTitle className="text-primary font-bold">Finalizar Servicio</DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div>
            <Label className="font-bold">Resolucion / Metodo de Pago</Label>
            <Select
              value={paymentMethod}
              onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
            >
              <SelectTrigger className="mt-1 border-foreground/20 font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="font-bold">Observaciones (Opcional)</Label>
            <Textarea
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              rows={2}
              className="mt-1"
            />
          </div>

          {/* Signature Pad */}
          <div className="p-3 bg-card rounded-lg border-2 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <Label className="font-bold text-blue-600">Firma del Cliente</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={clearSignature}
                className="text-destructive border-destructive/50"
              >
                <Eraser className="h-4 w-4 mr-1" />
                Borrar
              </Button>
            </div>
            <div
              className="border-2 border-dashed border-muted-foreground/30 rounded bg-white"
              style={{ touchAction: "none" }}
            >
              <canvas
                ref={canvasRef}
                width={400}
                height={150}
                className="w-full cursor-crosshair"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
            </div>
            <p className="text-xs text-muted-foreground text-center mt-1 font-bold">
              Firme con el dedo dentro del recuadro
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Atras
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-700 text-white font-bold text-lg px-8"
          >
            {isSubmitting ? "Cerrando..." : "CERRAR VIAJE"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
