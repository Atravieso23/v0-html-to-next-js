"use client";

import { useState } from "react";
import { useAvexStore } from "@/lib/store";
import type { Rider } from "@/lib/types";
import { Plus, Pencil, Trash2, Check, X, Settings2, User, Building2 } from "lucide-react";
import { toast } from "sonner";

const EMPTY_RIDER: Rider = { nombre: "", telefono: "", color: "#6366f1" };

const inputClass =
  "h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-colors";

// ── Formulario inline de rider ────────────────────────────────────────────────
function RiderForm({
  value,
  onChange,
  onSave,
  onCancel,
}: {
  value: Rider;
  onChange: (r: Rider) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="flex gap-2 p-3 bg-slate-50 border border-yellow-200 rounded-xl">
      <input
        type="color"
        value={value.color}
        onChange={(e) => onChange({ ...value, color: e.target.value })}
        className="h-9 w-9 rounded-lg border border-slate-200 cursor-pointer shrink-0 p-0.5 bg-white"
        title="Color del rider"
      />
      <input
        value={value.nombre}
        onChange={(e) => onChange({ ...value, nombre: e.target.value })}
        onKeyDown={(e) => e.key === "Enter" && onSave()}
        placeholder="Nombre"
        className={inputClass}
        autoFocus
      />
      <input
        value={value.telefono}
        onChange={(e) => onChange({ ...value, telefono: e.target.value })}
        onKeyDown={(e) => e.key === "Enter" && onSave()}
        placeholder="Teléfono"
        className={inputClass}
      />
      <button
        onClick={onSave}
        className="h-9 w-9 bg-yellow-400 hover:bg-yellow-300 text-black rounded-lg flex items-center justify-center shrink-0 transition-colors"
        title="Guardar"
      >
        <Check className="h-4 w-4" />
      </button>
      <button
        onClick={onCancel}
        className="h-9 w-9 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg flex items-center justify-center shrink-0 transition-colors"
        title="Cancelar"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export function ConfigTab() {
  const riders             = useAvexStore((s) => s.riders);
  const addRider           = useAvexStore((s) => s.addRider);
  const updateRider        = useAvexStore((s) => s.updateRider);
  const deleteRider        = useAvexStore((s) => s.deleteRider);
  const insuranceProviders = useAvexStore((s) => s.insuranceProviders);
  const addInsuranceProvider    = useAvexStore((s) => s.addInsuranceProvider);
  const deleteInsuranceProvider = useAvexStore((s) => s.deleteInsuranceProvider);

  // Riders UI state
  const [editingRider, setEditingRider] = useState<string | null>(null);
  const [editForm,     setEditForm]     = useState<Rider>(EMPTY_RIDER);
  const [addingRider,  setAddingRider]  = useState(false);
  const [addForm,      setAddForm]      = useState<Rider>(EMPTY_RIDER);

  // Aseguradoras UI state
  const [addingProvider, setAddingProvider] = useState(false);
  const [newProvider,    setNewProvider]    = useState("");

  // ── Riders handlers ──────────────────────────────────────────────────────
  const handleStartEdit = (rider: Rider) => {
    setEditingRider(rider.nombre);
    setEditForm({ ...rider });
    setAddingRider(false);
  };

  const handleSaveEdit = () => {
    if (!editForm.nombre.trim()) { toast.error("El nombre es requerido"); return; }
    updateRider(editingRider!, editForm);
    setEditingRider(null);
    toast.success("Rider actualizado");
  };

  const handleCancelEdit = () => setEditingRider(null);

  const handleStartAdd = () => {
    setAddingRider(true);
    setAddForm(EMPTY_RIDER);
    setEditingRider(null);
  };

  const handleAddRider = () => {
    if (!addForm.nombre.trim()) { toast.error("El nombre es requerido"); return; }
    if (riders.some((r) => r.nombre.toLowerCase() === addForm.nombre.trim().toLowerCase())) {
      toast.error("Ya existe un rider con ese nombre"); return;
    }
    addRider({ ...addForm, nombre: addForm.nombre.trim() });
    setAddForm(EMPTY_RIDER);
    setAddingRider(false);
    toast.success(`Rider "${addForm.nombre.trim()}" agregado`);
  };

  const handleDeleteRider = (nombre: string) => {
    if (riders.length <= 1) return;
    deleteRider(nombre);
    toast.success("Rider eliminado");
  };

  // ── Aseguradoras handlers ────────────────────────────────────────────────
  const handleAddProvider = () => {
    const trimmed = newProvider.trim();
    if (!trimmed) { toast.error("El nombre es requerido"); return; }
    if (insuranceProviders.some((p) => p.toLowerCase() === trimmed.toLowerCase())) {
      toast.error("Ya existe esa aseguradora"); return;
    }
    addInsuranceProvider(trimmed);
    setNewProvider("");
    setAddingProvider(false);
    toast.success(`Aseguradora "${trimmed}" agregada`);
  };

  const handleDeleteProvider = (nombre: string) => {
    deleteInsuranceProvider(nombre);
    toast.success("Aseguradora eliminada");
  };

  return (
    <div className="max-w-2xl space-y-6">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="bg-[#1C2333] rounded-2xl px-5 py-4 flex items-center gap-3">
        <div className="w-9 h-9 bg-yellow-400 rounded-xl flex items-center justify-center shrink-0">
          <Settings2 className="h-5 w-5 text-black" />
        </div>
        <div>
          <p className="text-white font-black text-sm tracking-tight leading-none">CONFIGURACIÓN</p>
          <p className="text-slate-400 text-[10px] font-medium mt-0.5">
            Gestioná riders y aseguradoras del sistema
          </p>
        </div>
      </div>

      {/* ── Sección Riders ──────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-5 pt-4 pb-3">

          {/* Título + botón agregar */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-slate-700">
              <User className="h-4 w-4 text-slate-400" />
              <h3 className="font-bold text-sm">Riders</h3>
              <span className="text-xs text-slate-400 font-normal">({riders.length})</span>
            </div>
            <button
              onClick={handleStartAdd}
              className="flex items-center gap-1.5 bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
            >
              <Plus className="h-3 w-3" />
              Agregar rider
            </button>
          </div>

          {/* Lista */}
          <div className="space-y-1">
            {riders.map((rider) =>
              editingRider === rider.nombre ? (
                <RiderForm
                  key={rider.nombre}
                  value={editForm}
                  onChange={setEditForm}
                  onSave={handleSaveEdit}
                  onCancel={handleCancelEdit}
                />
              ) : (
                <div
                  key={rider.nombre}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 group transition-colors"
                >
                  {/* Color circle */}
                  <div
                    className="w-9 h-9 rounded-full shrink-0 border-2 border-white shadow"
                    style={{ backgroundColor: rider.color }}
                  />
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-slate-800">{rider.nombre}</p>
                    <p className="text-xs text-slate-400">
                      {rider.telefono || <span className="italic">Sin teléfono</span>}
                    </p>
                  </div>
                  {/* Acciones (visibles al hover) */}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleStartEdit(rider)}
                      className="h-7 w-7 rounded-lg bg-slate-100 hover:bg-yellow-100 hover:text-yellow-700 text-slate-500 flex items-center justify-center transition-colors"
                      title="Editar"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteRider(rider.nombre)}
                      disabled={riders.length <= 1}
                      className="h-7 w-7 rounded-lg bg-slate-100 hover:bg-red-100 hover:text-red-600 text-slate-500 flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      title={riders.length <= 1 ? "Debe haber al menos 1 rider" : "Eliminar"}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )
            )}

            {/* Formulario de agregar */}
            {addingRider && (
              <div className="mt-2">
                <RiderForm
                  value={addForm}
                  onChange={setAddForm}
                  onSave={handleAddRider}
                  onCancel={() => setAddingRider(false)}
                />
              </div>
            )}
          </div>
        </div>

        <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-100">
          <p className="text-[10px] text-slate-400">
            El color de cada rider se usa en el Mapa Operativo y el formulario de servicios.
            No podés eliminar el último rider.
          </p>
        </div>
      </div>

      {/* ── Sección Aseguradoras ─────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-5 pt-4 pb-3">

          {/* Título + botón agregar */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-slate-700">
              <Building2 className="h-4 w-4 text-slate-400" />
              <h3 className="font-bold text-sm">Aseguradoras</h3>
              <span className="text-xs text-slate-400 font-normal">({insuranceProviders.length})</span>
            </div>
            <button
              onClick={() => setAddingProvider(true)}
              className="flex items-center gap-1.5 bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
            >
              <Plus className="h-3 w-3" />
              Agregar
            </button>
          </div>

          {/* Lista */}
          <div className="space-y-1">
            {insuranceProviders.map((provider) => (
              <div
                key={provider}
                className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 group transition-colors"
              >
                <p className="flex-1 text-sm font-medium text-slate-800">
                  {provider === "Avex" ? "⚡ Avex" : provider}
                </p>
                <button
                  onClick={() => handleDeleteProvider(provider)}
                  disabled={provider === "Avex"}
                  className="h-7 w-7 rounded-lg bg-slate-100 hover:bg-red-100 hover:text-red-600 text-slate-500 flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed opacity-0 group-hover:opacity-100"
                  title={provider === "Avex" ? '"Avex" no puede eliminarse' : "Eliminar"}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}

            {/* Formulario agregar aseguradora */}
            {addingProvider && (
              <div className="flex gap-2 p-3 bg-slate-50 border border-yellow-200 rounded-xl mt-2">
                <input
                  value={newProvider}
                  onChange={(e) => setNewProvider(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddProvider()}
                  placeholder="Nombre de la aseguradora"
                  className={inputClass}
                  autoFocus
                />
                <button
                  onClick={handleAddProvider}
                  className="h-9 w-9 bg-yellow-400 hover:bg-yellow-300 text-black rounded-lg flex items-center justify-center shrink-0 transition-colors"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  onClick={() => { setAddingProvider(false); setNewProvider(""); }}
                  className="h-9 w-9 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg flex items-center justify-center shrink-0 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-100">
          <p className="text-[10px] text-slate-400">
            "Avex" no puede eliminarse. Las aseguradoras aparecen en el formulario de nuevo servicio.
          </p>
        </div>
      </div>

    </div>
  );
}
