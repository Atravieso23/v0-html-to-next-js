"use client";

import { useState } from "react";
import { useAvexStore } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import type { Service } from "@/lib/types";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Pause,
  Play,
  ArrowRightLeft,
  GripVertical,
  Car,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";

// ─── Badge de estado ───────────────────────────────────────────────────────────

const STATUS_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  Pendiente:    { bg: "bg-yellow-400",   text: "text-black",      label: "Pendiente" },
  "En camino":  { bg: "bg-blue-500",     text: "text-white",      label: "En camino" },
  "En el lugar":{ bg: "bg-green-500",    text: "text-white",      label: "En el lugar" },
  Pausado:      { bg: "bg-slate-300",    text: "text-slate-600",  label: "Pausado" },
};

function StatusBadge({ estado }: { estado: string }) {
  const cfg = STATUS_BADGE[estado] ?? { bg: "bg-slate-200", text: "text-slate-600", label: estado };
  return (
    <span className={`${cfg.bg} ${cfg.text} text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide`}>
      {cfg.label}
    </span>
  );
}

// ─── Popover de reasignación ───────────────────────────────────────────────────

function ReassignPopover({
  serviceId,
  currentRider,
  riders,
  onReassign,
  onClose,
}: {
  serviceId: string;
  currentRider: string;
  riders: { nombre: string; color: string }[];
  onReassign: (id: string, rider: string) => void;
  onClose: () => void;
}) {
  const available = riders.filter((r) => r.nombre !== currentRider);
  return (
    <div className="absolute right-0 top-8 z-50 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden min-w-[140px]">
      <div className="px-3 py-2 bg-slate-50 border-b border-slate-100">
        <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">Reasignar a</p>
      </div>
      {available.map((r) => (
        <button
          key={r.nombre}
          onClick={() => {
            onReassign(serviceId, r.nombre);
            onClose();
          }}
          className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 transition-colors text-left"
        >
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: r.color }}
          />
          <span className="text-sm font-bold text-slate-700">{r.nombre}</span>
        </button>
      ))}
      <button
        onClick={onClose}
        className="w-full px-3 py-1.5 text-[10px] text-slate-400 hover:bg-slate-50 border-t border-slate-100"
      >
        Cancelar
      </button>
    </div>
  );
}

// ─── Card sortable de viaje ────────────────────────────────────────────────────

function QueueServiceCard({
  service,
  index,
  riders,
  onPause,
  onResume,
  onReassign,
}: {
  service: Service;
  index: number;
  riders: { nombre: string; color: string }[];
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onReassign: (id: string, rider: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: service.id, disabled: service.estado === "Pausado" });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [showReassign, setShowReassign] = useState(false);
  const isPaused = service.estado === "Pausado";

  // dirección corta: primeras dos partes
  const shortAddress = service.direccion.split(",").slice(0, 2).join(",").trim();

  const ordinal = ["1°", "2°", "3°", "4°", "5°", "6°", "7°", "8°", "9°"][index] ?? `${index + 1}°`;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border rounded-xl px-3 py-3 mb-2 shadow-sm transition-all duration-150 ${
        isDragging
          ? "shadow-lg border-yellow-300 rotate-1 z-50"
          : isPaused
          ? "border-slate-200 opacity-50"
          : "border-slate-200 hover:border-slate-300"
      }`}
    >
      <div className="flex items-start gap-2">
        {/* Drag handle — solo para no-pausados */}
        {!isPaused ? (
          <button
            {...attributes}
            {...listeners}
            className="mt-0.5 text-slate-300 hover:text-slate-400 cursor-grab active:cursor-grabbing shrink-0 touch-none"
          >
            <GripVertical className="h-4 w-4" />
          </button>
        ) : (
          <div className="w-4 shrink-0" />
        )}

        {/* Número de orden */}
        <span className="text-[11px] font-black text-slate-400 shrink-0 mt-0.5 w-5 text-center">
          {isPaused ? "—" : ordinal}
        </span>

        {/* Contenido */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            <StatusBadge estado={service.estado} />
            <span className="text-[10px] text-slate-400 font-medium">{service.tipo}</span>
          </div>
          <p className="font-black text-sm text-slate-800 leading-tight truncate">{service.cliente}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
            <p className="text-[11px] text-slate-400 truncate">{shortAddress}</p>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-1 shrink-0 relative">
          {/* Pausar / Reactivar */}
          <button
            onClick={() => (isPaused ? onResume(service.id) : onPause(service.id))}
            title={isPaused ? "Reactivar" : "Pausar"}
            className={`p-1.5 rounded-lg transition-colors ${
              isPaused
                ? "bg-green-100 text-green-600 hover:bg-green-200"
                : "bg-slate-100 text-slate-500 hover:bg-yellow-100 hover:text-yellow-600"
            }`}
          >
            {isPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
          </button>

          {/* Reasignar */}
          <button
            onClick={() => setShowReassign((v) => !v)}
            title="Reasignar rider"
            className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:bg-blue-100 hover:text-blue-600 transition-colors"
          >
            <ArrowRightLeft className="h-3.5 w-3.5" />
          </button>

          {showReassign && (
            <ReassignPopover
              serviceId={service.id}
              currentRider={service.rider}
              riders={riders}
              onReassign={onReassign}
              onClose={() => setShowReassign(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Columna de un rider ───────────────────────────────────────────────────────

function RiderColumn({
  rider,
  color,
  services,
  riders,
  onPause,
  onResume,
  onReassign,
  onReorder,
}: {
  rider: string;
  color: string;
  services: Service[];
  riders: { nombre: string; color: string }[];
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onReassign: (id: string, rider: string) => void;
  onReorder: (rider: string, ids: string[]) => void;
}) {
  // activos primero (por orden), pausados al final
  const active = services
    .filter((s) => s.estado !== "Pausado")
    .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
  const paused = services.filter((s) => s.estado === "Pausado");

  const sortableIds = active.map((s) => s.id);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active: dragActive, over } = event;
    if (!over || dragActive.id === over.id) return;
    const oldIndex = sortableIds.indexOf(String(dragActive.id));
    const newIndex = sortableIds.indexOf(String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = arrayMove(sortableIds, oldIndex, newIndex);
    onReorder(rider, reordered);
  };

  return (
    <div className="flex flex-col min-w-0">
      {/* Header */}
      <div
        className="rounded-xl px-4 py-3 mb-3 flex items-center gap-2"
        style={{ backgroundColor: "#1C2333" }}
      >
        <span
          className="w-3 h-3 rounded-full shrink-0"
          style={{ backgroundColor: color }}
        />
        <p className="font-black text-white text-sm tracking-wide">{rider}</p>
        <span
          className="ml-auto text-[11px] font-black px-2 py-0.5 rounded-full"
          style={{ backgroundColor: color + "30", color }}
        >
          {active.length} activo{active.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Cards */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
          {active.map((s, i) => (
            <QueueServiceCard
              key={s.id}
              service={s}
              index={i}
              riders={riders}
              onPause={onPause}
              onResume={onResume}
              onReassign={onReassign}
            />
          ))}
        </SortableContext>
      </DndContext>

      {/* Pausados */}
      {paused.map((s) => (
        <QueueServiceCard
          key={s.id}
          service={s}
          index={-1}
          riders={riders}
          onPause={onPause}
          onResume={onResume}
          onReassign={onReassign}
        />
      ))}

      {/* Vacío */}
      {active.length === 0 && paused.length === 0 && (
        <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center">
          <Car className="h-6 w-6 text-slate-200 mx-auto mb-2" />
          <p className="text-xs font-bold text-slate-300">Sin viajes activos</p>
        </div>
      )}
    </div>
  );
}

// ─── QueueBoard principal ──────────────────────────────────────────────────────

export function QueueBoard() {
  const riders = useAvexStore((state) => state.riders);
  const riderColors = useAvexStore((state) => state.riderColors);
  const servicios = useAvexStore(
    useShallow((state) =>
      Object.values(state.servicios).filter(
        (s) =>
          s.estado === "Pendiente" ||
          s.estado === "En camino" ||
          s.estado === "En el lugar" ||
          s.estado === "Pausado"
      )
    )
  );
  const reorderRiderQueue = useAvexStore((state) => state.reorderRiderQueue);
  const pauseService = useAvexStore((state) => state.pauseService);
  const resumeService = useAvexStore((state) => state.resumeService);
  const reassignService = useAvexStore((state) => state.reassignService);

  const ridersData = riders.map((r) => ({
    nombre: r.nombre,
    color: r.color || riderColors[r.nombre] || "#888",
  }));

  const handlePause = (id: string) => {
    pauseService(id);
    toast.success("Viaje pausado");
  };

  const handleResume = (id: string) => {
    resumeService(id);
    toast.success("Viaje reactivado");
  };

  const handleReassign = (id: string, newRider: string) => {
    reassignService(id, newRider);
    toast.success(`Reasignado a ${newRider}`);
  };

  return (
    <div className="bg-slate-100 rounded-2xl p-4">
      <div
        className={`grid gap-4`}
        style={{ gridTemplateColumns: `repeat(${riders.length}, minmax(0, 1fr))` }}
      >
        {ridersData.map((r) => {
          const riderServices = servicios.filter((s) => s.rider === r.nombre);
          return (
            <RiderColumn
              key={r.nombre}
              rider={r.nombre}
              color={r.color}
              services={riderServices}
              riders={ridersData}
              onPause={handlePause}
              onResume={handleResume}
              onReassign={handleReassign}
              onReorder={reorderRiderQueue}
            />
          );
        })}
      </div>
    </div>
  );
}
