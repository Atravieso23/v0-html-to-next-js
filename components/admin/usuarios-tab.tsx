"use client";

import { useState } from "react";
import { useAvexStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import type { AppUser, UserRole } from "@/lib/types";
import { UserPlus, Pencil, Trash2, Check, X, ShieldCheck, Smartphone } from "lucide-react";
import { toast } from "sonner";

function generateId() {
  return "user-" + Math.random().toString(36).slice(2, 9);
}

const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Admin",
  rider: "Rider",
};

export function UsuariosTab() {
  const { users, addUser, updateUser, deleteUser, currentUser, riders } = useAvexStore();

  // ── Formulario nuevo usuario ──
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<UserRole>("rider");
  const [newRiderName, setNewRiderName] = useState("__none__");
  const [formError, setFormError] = useState("");

  // ── Edición inline ──
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editRole, setEditRole] = useState<UserRole>("rider");
  const [editRiderName, setEditRiderName] = useState("__none__");

  // ── Eliminación ──
  const [deleteTarget, setDeleteTarget] = useState<AppUser | null>(null);

  const startEdit = (user: AppUser) => {
    setEditingId(user.id);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditPassword(user.password);
    setEditRole(user.role);
    setEditRiderName(user.riderName ?? "__none__");
  };

  const cancelEdit = () => setEditingId(null);

  const saveEdit = () => {
    if (!editName.trim() || !editEmail.trim() || !editPassword.trim()) {
      toast.error("Completá todos los campos obligatorios");
      return;
    }
    const duplicate = users.find(
      (u) => u.id !== editingId && u.email.toLowerCase() === editEmail.toLowerCase()
    );
    if (duplicate) {
      toast.error("Ya existe un usuario con ese email");
      return;
    }
    updateUser(editingId!, {
      name: editName.trim(),
      email: editEmail.trim(),
      password: editPassword.trim(),
      role: editRole,
      riderName: editRole === "rider" && editRiderName !== "__none__" ? editRiderName : undefined,
    });
    setEditingId(null);
    toast.success("Usuario actualizado");
  };

  const handleAdd = () => {
    setFormError("");
    if (!newName.trim() || !newEmail.trim() || !newPassword.trim()) {
      setFormError("Completá todos los campos obligatorios");
      return;
    }
    const duplicate = users.find(
      (u) => u.email.toLowerCase() === newEmail.toLowerCase()
    );
    if (duplicate) {
      setFormError("Ya existe un usuario con ese email");
      return;
    }
    const user: AppUser = {
      id: generateId(),
      name: newName.trim(),
      email: newEmail.trim(),
      password: newPassword.trim(),
      role: newRole,
      riderName: newRole === "rider" ? newRiderName || undefined : undefined,
    };
    addUser(user);
    setNewName("");
    setNewEmail("");
    setNewPassword("");
    setNewRole("rider");
    setNewRiderName("__none__");
    setShowForm(false);
    toast.success("Usuario creado");
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.id === currentUser?.id) {
      toast.error("No podés eliminar tu propio usuario");
      setDeleteTarget(null);
      return;
    }
    deleteUser(deleteTarget.id);
    setDeleteTarget(null);
    toast.success("Usuario eliminado");
  };

  return (
    <div className="space-y-6 max-w-3xl">

      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {users.length} usuario{users.length !== 1 ? "s" : ""} registrado{users.length !== 1 ? "s" : ""}
        </p>
        <Button size="sm" onClick={() => setShowForm((v) => !v)} className="btn-avex gap-2">
          <UserPlus className="h-4 w-4" />
          Agregar usuario
        </Button>
      </div>

      {/* Formulario nuevo usuario */}
      {showForm && (
        <div className="border rounded-xl p-4 space-y-4 bg-card">
          <p className="font-bold text-sm">Nuevo usuario</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Nombre *</label>
              <Input
                placeholder="Ej: Andrés"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Email *</label>
              <Input
                type="email"
                placeholder="Ej: andres@avex.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Contraseña *</label>
              <Input
                type="text"
                placeholder="Contraseña"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Rol *</label>
              <Select value={newRole} onValueChange={(v) => setNewRole(v as UserRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="rider">Rider</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {newRole === "rider" && (
              <div className="sm:col-span-2">
                <label className="text-xs text-muted-foreground mb-1 block">
                  Rider vinculado (opcional)
                </label>
                <Select value={newRiderName} onValueChange={setNewRiderName}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sin rider vinculado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Sin rider vinculado</SelectItem>
                    {riders.map((r) => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Si vinculás un rider, este usuario verá directamente su vista sin elegir nombre.
                </p>
              </div>
            )}
          </div>
          {formError && (
            <p className="text-sm text-red-500">{formError}</p>
          )}
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAdd} className="btn-avex gap-1">
              <Check className="h-4 w-4" />
              Guardar
            </Button>
            <Button size="sm" variant="outline" onClick={() => { setShowForm(false); setFormError(""); }}>
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Lista de usuarios */}
      <div className="space-y-2">
        {users.map((user) => {
          const isEditing = editingId === user.id;
          const isMe = user.id === currentUser?.id;

          if (isEditing) {
            return (
              <div key={user.id} className="border rounded-xl p-4 space-y-3 bg-card border-primary">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Nombre</label>
                    <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Email</label>
                    <Input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Contraseña</label>
                    <Input type="text" value={editPassword} onChange={(e) => setEditPassword(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Rol</label>
                    <Select value={editRole} onValueChange={(v) => setEditRole(v as UserRole)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="rider">Rider</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {editRole === "rider" && (
                    <div className="sm:col-span-2">
                      <label className="text-xs text-muted-foreground mb-1 block">Rider vinculado</label>
                      <Select value={editRiderName} onValueChange={setEditRiderName}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sin rider vinculado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">Sin rider vinculado</SelectItem>
                          {riders.map((r) => (
                            <SelectItem key={r} value={r}>{r}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={saveEdit} className="btn-avex gap-1">
                    <Check className="h-4 w-4" />
                    Guardar
                  </Button>
                  <Button size="sm" variant="outline" onClick={cancelEdit}>
                    <X className="h-4 w-4 mr-1" />
                    Cancelar
                  </Button>
                </div>
              </div>
            );
          }

          return (
            <div
              key={user.id}
              className="border rounded-xl px-4 py-3 flex items-center gap-3 bg-card"
            >
              {/* Avatar */}
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                {user.role === "admin" ? (
                  <ShieldCheck className="h-5 w-5 text-primary" />
                ) : (
                  <Smartphone className="h-5 w-5 text-muted-foreground" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm">{user.name}</span>
                  {isMe && (
                    <Badge variant="outline" className="text-xs">Vos</Badge>
                  )}
                  <Badge
                    className={`text-xs ${
                      user.role === "admin"
                        ? "bg-yellow-400/10 text-yellow-600 border-yellow-400/30"
                        : "bg-blue-400/10 text-blue-600 border-blue-400/30"
                    }`}
                    variant="outline"
                  >
                    {ROLE_LABELS[user.role]}
                  </Badge>
                  {user.riderName && (
                    <span className="text-xs text-muted-foreground">→ {user.riderName}</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-1 shrink-0">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={() => startEdit(user)}
                  title="Editar"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => setDeleteTarget(user)}
                  title="Eliminar"
                  disabled={isMe}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* AlertDialog eliminar */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará el usuario <strong>{deleteTarget?.name}</strong> ({deleteTarget?.email}).
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
