"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAvexStore } from "@/lib/store";
import type { Warranty, WarrantyStatus } from "@/lib/types";
import { getCurrentMoment } from "@/lib/helpers";
import {
  ShieldCheck, ShieldAlert, ShieldOff,
  Search, Car, Battery, Calendar,
  User, Phone, X, Trash2, AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getStatusColor(estado: WarrantyStatus) {
  if (estado === "Vigente") return { bg: "bg-green-100 text-green-700", dot: "bg-green-500", border: "border-l-green-500" };
  if (estado === "Reclamada") return { bg: "bg-orange-100 text-orange-700", dot: "bg-orange-500", border: "border-l-orange-500" };
  return { bg: "bg-slate-100 text-slate-500", dot: "bg-slate-400", border: "border-l-slate-400" };
}

function computeStatus(g: Warranty): WarrantyStatus {
  if (g.estado === "Reclamada") return "Reclamada";
  const hoy = getCurrentMoment().fechaInput;
  return g.fechaVencimiento >= hoy ? "Vigente" : "Vencida";
}

function formatDate(fechaInput: string) {
  const [y, m, d] = fechaInput.split("-");
  return `${d}/${m}/${y}`;
}

// ─── Modal de detalle/reclamo ─────────────────────────────────────────────────

function WarrantyDetailModal({
  warranty,
  open,
  onClose,
  onClaim,
  onDelete,
}: {
  warranty: Warranty | null;
  open: boolean;
  onClose: () => void;
  onClaim: (nota: string) => void;
  onDelete: () => void;
}) {
  const [claimNote, setClaimNote] = useState("");
  const [showClaimForm, setShowClaimForm] = useState(false);

  if (!warranty) return null;

  const estado = computeStatus(warranty);
  const style = getStatusColor(estado);

  const handleClaim = () => {
    onClaim(claimNote);
    setClaimNote("");
    setShowClaimForm(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl">
        {/* Header */}
        <div className="bg-[#1C2333] px-5 py-4">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${style.bg}`}>
                {estado}
              </span>
              <span className="text-[10px] text-slate-400">{warranty.mesesGarantia} meses</span>
            </div>
            <DialogTitle className="text-white font-black text-lg text-left leading-tight">
              {warranty.cliente}
            </DialogTitle>
            <p className="text-slate-400 text-xs text-left">{warranty.autoTexto}</p>
          </DialogHeader>
        </div>

        <div className="p-5 space-y-4">
          {/* Batería + fechas */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Datos de la garantía</p>
            <div className="flex items-center gap-2">
              <Battery className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="text-sm font-medium text-slate-700">{warranty.modeloBat}</span>
            </div>
            {warranty.patente && (
              <div className="flex items-center gap-2">
                <Car className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span className="font-mono font-bold text-sm text-slate-700 uppercase">{warranty.patente}</span>
              </div>
            )}
            {warranty.celular && (
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span className="text-sm text-slate-700">{warranty.celular}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-green-500 shrink-0" />
              <span className="text-xs text-slate-500">Vendida el</span>
              <span className="text-sm font-bold text-slate-700">{warranty.fechaVentaVisual}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className={`h-3.5 w-3.5 shrink-0 ${estado === "Vencida" ? "text-red-400" : "text-blue-400"}`} />
              <span className="text-xs text-slate-500">Vence el</span>
              <span className={`text-sm font-bold ${estado === "Vencida" ? "text-red-500" : "text-blue-600"}`}>
                {warranty.fechaVencimientoVisual}
              </span>
            </div>
          </div>

          {/* Nota de reclamo si existe */}
          {warranty.notaReclamo && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-orange-400 mb-2">Nota de reclamo</p>
              <p className="text-sm text-orange-800">{warranty.notaReclamo}</p>
            </div>
          )}

          {/* Form de reclamo */}
          {showClaimForm && estado !== "Reclamada" && (
            <div className="border border-orange-200 rounded-xl p-4 space-y-3">
              <p className="text-sm font-bold text-orange-700">Registrar reclamo</p>
              <Textarea
                placeholder="Descripción del problema / motivo del reclamo..."
                value={claimNote}
                onChange={(e) => setClaimNote(e.target.value)}
                className="text-sm"
                rows={3}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleClaim} className="bg-orange-500 hover:bg-orange-600 text-white font-bold">
                  Confirmar reclamo
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setShowClaimForm(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="px-5 py-4 border-t border-slate-100 flex gap-2 justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            className="text-red-500 border-red-200 hover:bg-red-50"
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" /> Eliminar
          </Button>
          {estado !== "Reclamada" && !showClaimForm && (
            <Button
              size="sm"
              onClick={() => setShowClaimForm(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold"
            >
              <AlertTriangle className="h-3.5 w-3.5 mr-1" /> Registrar reclamo
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function GarantiasTab() {
  const garantias = useAvexStore((state) => state.garantias);
  const updateWarranty = useAvexStore((state) => state.updateWarranty);
  const deleteWarranty = useAvexStore((state) => state.deleteWarranty);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<WarrantyStatus | "">("");
  const [selected, setSelected] = useState<Warranty | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Actualizar estado dinámico (vigente/vencida) al mostrar
  const enriched = useMemo(() =>
    garantias.map((g) => ({ ...g, estado: computeStatus(g) })),
    [garantias]
  );

  const filtered = useMemo(() => {
    return enriched
      .filter((g) => {
        if (filterStatus && g.estado !== filterStatus) return false;
        if (search) {
          const q = search.toLowerCase();
          return [g.cliente, g.patente, g.modeloBat, g.autoTexto].join(" ").toLowerCase().includes(q);
        }
        return true;
      })
      .sort((a, b) => b.fechaVenta.localeCompare(a.fechaVenta));
  }, [enriched, filterStatus, search]);

  const counts = useMemo(() => ({
    vigente: enriched.filter((g) => g.estado === "Vigente").length,
    vencida: enriched.filter((g) => g.estado === "Vencida").length,
    reclamada: enriched.filter((g) => g.estado === "Reclamada").length,
  }), [enriched]);

  const handleClaim = (id: string, nota: string) => {
    updateWarranty(id, { estado: "Reclamada", notaReclamo: nota });
    setSelected(null);
    toast.success("Reclamo registrado");
  };

  const handleDelete = () => {
    if (deletingId) {
      deleteWarranty(deletingId);
      setDeletingId(null);
      setSelected(null);
      toast.success("Garantía eliminada");
    }
  };

  return (
    <>
      <div className="space-y-4">

        {/* Header con stats */}
        <div className="bg-[#1C2333] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-white font-black text-lg leading-none">Garantías</h4>
              <p className="text-slate-400 text-xs mt-0.5">
                {garantias.length === 0
                  ? "Las garantías se generan automáticamente al vender una batería"
                  : `${garantias.length} garantías registradas`}
              </p>
            </div>
            <ShieldCheck className="h-8 w-8 text-yellow-400 opacity-60" />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setFilterStatus(filterStatus === "Vigente" ? "" : "Vigente")}
              className={`rounded-xl p-3 text-center transition-all ${filterStatus === "Vigente" ? "ring-2 ring-green-400" : ""} bg-white/10`}
            >
              <ShieldCheck className="h-4 w-4 text-green-400 mx-auto mb-1" />
              <p className="text-xl font-black text-green-400">{counts.vigente}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">Vigentes</p>
            </button>
            <button
              onClick={() => setFilterStatus(filterStatus === "Vencida" ? "" : "Vencida")}
              className={`rounded-xl p-3 text-center transition-all ${filterStatus === "Vencida" ? "ring-2 ring-slate-400" : ""} bg-white/10`}
            >
              <ShieldOff className="h-4 w-4 text-slate-400 mx-auto mb-1" />
              <p className="text-xl font-black text-slate-300">{counts.vencida}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">Vencidas</p>
            </button>
            <button
              onClick={() => setFilterStatus(filterStatus === "Reclamada" ? "" : "Reclamada")}
              className={`rounded-xl p-3 text-center transition-all ${filterStatus === "Reclamada" ? "ring-2 ring-orange-400" : ""} bg-white/10`}
            >
              <ShieldAlert className="h-4 w-4 text-orange-400 mx-auto mb-1" />
              <p className="text-xl font-black text-orange-400">{counts.reclamada}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">Reclamadas</p>
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar cliente, patente, batería..."
              className="pl-8 h-9 text-sm"
            />
          </div>
          {(search || filterStatus) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setSearch(""); setFilterStatus(""); }}
            >
              <X className="h-3.5 w-3.5 mr-1" /> Limpiar
            </Button>
          )}
        </div>

        {/* Lista */}
        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
          {filtered.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center">
              <ShieldCheck className="h-10 w-10 text-slate-200 mx-auto mb-3" />
              <p className="font-bold text-slate-400">
                {garantias.length === 0
                  ? "Aún no hay garantías registradas"
                  : "Sin resultados para los filtros aplicados"}
              </p>
              {garantias.length === 0 && (
                <p className="text-xs text-slate-300 mt-1">
                  Al vender una batería en "Stock y Ventas", se genera la garantía automáticamente
                </p>
              )}
            </div>
          ) : (
            filtered.map((g) => {
              const style = getStatusColor(g.estado);
              return (
                <button
                  key={g.id}
                  onClick={() => setSelected(g)}
                  className={`w-full bg-white border border-slate-200 border-l-4 ${style.border} rounded-xl px-4 py-3 flex items-center gap-3 hover:shadow-md transition-all text-left group`}
                >
                  <div className={`w-2 h-2 rounded-full shrink-0 ${style.dot}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-black text-sm text-slate-900 truncate">{g.cliente}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${style.bg}`}>
                        {g.estado}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate">{g.modeloBat}</p>
                    <div className="flex items-center gap-3 mt-1">
                      {g.patente && (
                        <span className="font-mono text-[10px] text-slate-400">{g.patente}</span>
                      )}
                      <span className="text-[10px] text-slate-400">Vende: {g.fechaVentaVisual}</span>
                      <span className={`text-[10px] font-bold ${g.estado === "Vencida" ? "text-red-400" : "text-blue-500"}`}>
                        Vence: {g.fechaVencimientoVisual}
                      </span>
                    </div>
                  </div>
                  <Battery className="h-4 w-4 text-slate-300 group-hover:text-yellow-400 transition-colors shrink-0" />
                </button>
              );
            })
          )}
        </div>
      </div>

      <WarrantyDetailModal
        warranty={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
        onClaim={(nota) => selected && handleClaim(selected.id, nota)}
        onDelete={() => selected && setDeletingId(selected.id)}
      />

      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar garantía</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará la garantía permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 text-white hover:bg-red-600">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
