"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAvexStore } from "@/lib/store";
import { Save, Pencil, Trash2, Plus, Check, X, Eye, EyeOff, KeyRound } from "lucide-react";

export function CatalogTab() {
  const config = useAvexStore((state) => state.config);
  const batteryModels = useAvexStore((state) => state.batteryModels);
  const updatePrices = useAvexStore((state) => state.updatePrices);
  const updateSurcharges = useAvexStore((state) => state.updateSurcharges);
  const updateConfig = useAvexStore((state) => state.updateConfig);
  const addBatteryModel = useAvexStore((state) => state.addBatteryModel);
  const updateBatteryModel = useAvexStore((state) => state.updateBatteryModel);
  const deleteBatteryModel = useAvexStore((state) => state.deleteBatteryModel);
  const riders = useAvexStore((state) => state.riders);
  const riderColors = useAvexStore((state) => state.riderColors);
  const addRider = useAvexStore((state) => state.addRider);
  const updateRider = useAvexStore((state) => state.updateRider);
  const deleteRider = useAvexStore((state) => state.deleteRider);

  const [prices, setPrices] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    batteryModels.forEach((model) => {
      initial[model] = (config.preciosBase[model] || 0).toString();
    });
    return initial;
  });

  const [surcharges, setSurcharges] = useState({
    tarjeta1: config.recargos.tarjeta1.toString(),
    tarjeta3: config.recargos.tarjeta3.toString(),
  });

  const [comision, setComision] = useState((config.comisionRider ?? 10000).toString());

  const handleSaveComision = () => {
    updateConfig({ comisionRider: parseFloat(comision) || 0 });
    toast.success("Comisión por rider actualizada");
  };

  // Contraseña
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPwd, setShowNewPwd] = useState(false);

  const handleSavePassword = () => {
    if (!newPassword) { toast.error("Ingresá una contraseña"); return; }
    if (newPassword !== confirmPassword) { toast.error("Las contraseñas no coinciden"); return; }
    if (newPassword.length < 4) { toast.error("Mínimo 4 caracteres"); return; }
    updateConfig({ adminPassword: newPassword });
    setNewPassword(""); setConfirmPassword("");
    toast.success("Contraseña actualizada correctamente");
  };

  // Riders
  const [showAddRider, setShowAddRider] = useState(false);
  const [newRiderName, setNewRiderName] = useState("");
  const [newRiderColor, setNewRiderColor] = useState("#facc15");
  const [editingRider, setEditingRider] = useState<string | null>(null);
  const [editingRiderName, setEditingRiderName] = useState("");
  const [editingRiderColor, setEditingRiderColor] = useState("");

  const handleAddRider = () => {
    const name = newRiderName.trim();
    if (!name) return;
    if (riders.some((r) => r.nombre === name)) { toast.error("Ya existe un rider con ese nombre"); return; }
    addRider({ nombre: name, telefono: "", color: newRiderColor });
    setNewRiderName(""); setNewRiderColor("#facc15"); setShowAddRider(false);
    toast.success(`Rider "${name}" agregado`);
  };

  const handleStartEditRider = (nombre: string, color: string) => {
    setEditingRider(nombre);
    setEditingRiderName(nombre);
    setEditingRiderColor(color || "#facc15");
  };

  const handleConfirmEditRider = () => {
    const newName = editingRiderName.trim();
    if (!newName || !editingRider) return;
    if (newName !== editingRider && riders.some((r) => r.nombre === newName)) { toast.error("Ya existe ese nombre"); return; }
    updateRider(editingRider, { nombre: newName, color: editingRiderColor });
    setEditingRider(null);
    toast.success("Rider actualizado");
  };

  // Agregar nueva batería
  const [newModelName, setNewModelName] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  // Editar batería
  const [editingModel, setEditingModel] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const handleSavePrices = () => {
    const numericPrices: Record<string, number> = {};
    Object.entries(prices).forEach(([model, price]) => {
      numericPrices[model] = parseFloat(price) || 0;
    });
    updatePrices(numericPrices);
    toast.success("Precios base actualizados correctamente");
  };

  const handleSaveSurcharges = () => {
    updateSurcharges({
      tarjeta1: parseFloat(surcharges.tarjeta1) || 0,
      tarjeta3: parseFloat(surcharges.tarjeta3) || 0,
    });
    toast.success("Recargos actualizados correctamente");
  };

  const handleAddModel = () => {
    const name = newModelName.trim();
    if (!name) return;
    if (batteryModels.includes(name)) {
      toast.error("Ya existe un modelo con ese nombre");
      return;
    }
    addBatteryModel(name);
    setPrices((p) => ({ ...p, [name]: "0" }));
    setNewModelName("");
    setShowAddForm(false);
    toast.success(`Batería "${name}" agregada al catálogo`);
  };

  const handleStartEdit = (model: string) => {
    setEditingModel(model);
    setEditingName(model);
  };

  const handleConfirmEdit = () => {
    const newName = editingName.trim();
    if (!newName || !editingModel) return;
    if (newName !== editingModel && batteryModels.includes(newName)) {
      toast.error("Ya existe un modelo con ese nombre");
      return;
    }
    updateBatteryModel(editingModel, newName);
    setPrices((p) => {
      const updated = { ...p };
      updated[newName] = updated[editingModel] ?? "0";
      delete updated[editingModel];
      return updated;
    });
    setEditingModel(null);
    toast.success("Nombre actualizado");
  };

  const handleDelete = (model: string) => {
    deleteBatteryModel(model);
    setPrices((p) => {
      const updated = { ...p };
      delete updated[model];
      return updated;
    });
    toast.success(`Batería "${model}" eliminada del catálogo`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Price Catalog */}
      <Card className="p-4 md:p-6 border-0 avex-border-yellow shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-bold text-xl">Precios Base (Efectivo)</h4>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddForm((v) => !v)}
              className="font-bold border-yellow-500 text-yellow-600 hover:bg-yellow-50"
            >
              <Plus className="h-4 w-4 mr-1" />
              Agregar
            </Button>
            <Button onClick={handleSavePrices} className="btn-avex font-bold">
              <Save className="h-4 w-4 mr-2" />
              Guardar Precios
            </Button>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Define el precio de venta al publico en efectivo para cada modelo de bateria.
        </p>

        {/* Formulario agregar */}
        {showAddForm && (
          <div className="flex gap-2 mb-4 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
            <Input
              placeholder="Ej: Varta VA55JD (12x55)"
              value={newModelName}
              onChange={(e) => setNewModelName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddModel()}
              className="font-bold"
              autoFocus
            />
            <Button size="sm" onClick={handleAddModel} className="btn-avex shrink-0">
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => { setShowAddForm(false); setNewModelName(""); }}
              className="shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="space-y-3 max-h-[500px] overflow-y-auto scrollbar-thin pr-2">
          {batteryModels.map((model) => (
            <div
              key={model}
              className="flex justify-between items-center border-b pb-2 gap-2"
            >
              {editingModel === model ? (
                <>
                  <Input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleConfirmEdit();
                      if (e.key === "Escape") setEditingModel(null);
                    }}
                    className="text-sm font-bold flex-1"
                    autoFocus
                  />
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600" onClick={handleConfirmEdit}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground" onClick={() => setEditingModel(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Label className="text-sm font-bold flex-1 leading-tight">{model}</Label>
                  <div className="flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-muted-foreground hover:text-blue-600"
                      onClick={() => handleStartEdit(model)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-muted-foreground hover:text-red-600"
                      onClick={() => handleDelete(model)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-1 w-1/3">
                    <span className="text-green-600 font-bold text-sm">$</span>
                    <Input
                      type="number"
                      value={prices[model] ?? "0"}
                      onChange={(e) =>
                        setPrices((p) => ({ ...p, [model]: e.target.value }))
                      }
                      className="text-right font-bold"
                    />
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Surcharges Config */}
      <div className="space-y-6">
        <Card className="p-4 md:p-6 border-0 border-l-4 border-l-blue-500 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-xl">Recargos por Tarjeta</h4>
            <Button onClick={handleSaveSurcharges} className="bg-blue-600 hover:bg-blue-700 font-bold">
              <Save className="h-4 w-4 mr-2" />
              Guardar
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            Estos porcentajes se aplican sobre el precio base cuando el cliente paga con tarjeta.
          </p>

          <div className="space-y-4">
            <div>
              <Label className="font-bold">Recargo 1 Pago Tarjeta (%)</Label>
              <Input
                type="number"
                value={surcharges.tarjeta1}
                onChange={(e) =>
                  setSurcharges((s) => ({ ...s, tarjeta1: e.target.value }))
                }
                className="mt-1 text-center font-bold text-lg"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Actualmente: {surcharges.tarjeta1}%
              </p>
            </div>

            <div>
              <Label className="font-bold">Recargo 3 Cuotas Tarjeta (%)</Label>
              <Input
                type="number"
                value={surcharges.tarjeta3}
                onChange={(e) =>
                  setSurcharges((s) => ({ ...s, tarjeta3: e.target.value }))
                }
                className="mt-1 text-center font-bold text-lg"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Actualmente: {surcharges.tarjeta3}%
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 md:p-6 border-0 border-l-4 border-l-green-500 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-xl">Comisión por Rider</h4>
            <Button onClick={handleSaveComision} className="bg-green-600 hover:bg-green-700 font-bold">
              <Save className="h-4 w-4 mr-2" />
              Guardar
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Monto fijo descontado de la ganancia por cada batería vendida para calcular la comisión del rider.
          </p>
          <div>
            <Label className="font-bold">Comisión por venta ($)</Label>
            <Input
              type="number"
              value={comision}
              onChange={(e) => setComision(e.target.value)}
              className="mt-1 text-center font-bold text-lg"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Actualmente: ${Number(comision).toLocaleString("es-AR")}
            </p>
          </div>
        </Card>

        <Card className="p-4 md:p-6 border-0 border-l-4 border-l-purple-500 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-xl">Riders</h4>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddRider((v) => !v)}
              className="font-bold border-purple-500 text-purple-600 hover:bg-purple-50"
            >
              <Plus className="h-4 w-4 mr-1" /> Agregar
            </Button>
          </div>

          {showAddRider && (
            <div className="flex gap-2 mb-4 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200">
              <Input
                placeholder="Nombre del rider"
                value={newRiderName}
                onChange={(e) => setNewRiderName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddRider()}
                className="font-bold flex-1"
                autoFocus
              />
              <input
                type="color"
                value={newRiderColor}
                onChange={(e) => setNewRiderColor(e.target.value)}
                className="w-10 h-9 rounded border cursor-pointer"
                title="Color del rider"
              />
              <Button size="sm" onClick={handleAddRider} className="bg-purple-600 hover:bg-purple-700 text-white shrink-0">
                <Check className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowAddRider(false)} className="shrink-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="space-y-2">
            {riders.map((rider) => (
              <div key={rider.nombre} className="flex items-center gap-2 border-b pb-2">
                {editingRider === rider.nombre ? (
                  <>
                    <input
                      type="color"
                      value={editingRiderColor}
                      onChange={(e) => setEditingRiderColor(e.target.value)}
                      className="w-8 h-8 rounded border cursor-pointer shrink-0"
                    />
                    <Input
                      value={editingRiderName}
                      onChange={(e) => setEditingRiderName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleConfirmEditRider();
                        if (e.key === "Escape") setEditingRider(null);
                      }}
                      className="text-sm font-bold flex-1"
                      autoFocus
                    />
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600" onClick={handleConfirmEditRider}>
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingRider(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: rider.color }} />
                    <span className="text-sm font-bold flex-1">{rider.nombre}</span>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-blue-600" onClick={() => handleStartEditRider(rider.nombre, rider.color)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-red-600" onClick={() => { deleteRider(rider.nombre); toast.success(`Rider "${rider.nombre}" eliminado`); }}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </>
                )}
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4 md:p-6 border-0 border-l-4 border-l-slate-500 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <KeyRound className="h-5 w-5 text-slate-500" />
            <h4 className="font-bold text-xl">Contraseña Admin</h4>
          </div>
          <div className="space-y-3">
            <div>
              <Label className="font-bold text-sm">Nueva contraseña</Label>
              <div className="relative mt-1">
                <Input
                  type={showNewPwd ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nueva contraseña"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNewPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <Label className="font-bold text-sm">Confirmar contraseña</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repetir contraseña"
                className="mt-1"
                onKeyDown={(e) => e.key === "Enter" && handleSavePassword()}
              />
            </div>
            <Button onClick={handleSavePassword} className="w-full font-bold" variant="outline">
              <Save className="h-4 w-4 mr-2" /> Cambiar contraseña
            </Button>
          </div>
        </Card>

        <Card className="p-4 md:p-6 border-0 shadow-sm bg-muted/50">
          <h5 className="font-bold mb-2">Como funcionan los precios</h5>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>El precio base es el valor de venta en efectivo</li>
            <li>Cuando el cliente paga con tarjeta, se suma el recargo correspondiente</li>
            <li>Ejemplo: Si una bateria cuesta $100.000 y el recargo de 1 pago es 10%, el total sera $110.000</li>
            <li>Los recargos de 3 cuotas suelen ser mas altos para cubrir los costos financieros</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
