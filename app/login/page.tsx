"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAvexStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Zap, Eye, EyeOff, Lock, Mail, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const login = useAvexStore((state) => state.login);
  const isAuthenticated = useAvexStore((state) => state.isAuthenticated);
  const currentUser = useAvexStore((state) => state.currentUser);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      if (currentUser.role === "admin") {
        router.replace("/admin");
      } else {
        router.replace("/rider");
      }
    }
  }, [isAuthenticated, currentUser, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    await new Promise((r) => setTimeout(r, 400));

    const ok = login(email, password);
    if (ok) {
      // redirect handled by useEffect above
    } else {
      setError("Email o contraseña incorrectos");
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setPassword("");
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#111827] flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="mb-10 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-12 h-12 rounded-xl bg-yellow-400 flex items-center justify-center">
            <Zap className="h-7 w-7 text-[#111827]" />
          </div>
          <span className="text-4xl font-black text-yellow-400 tracking-tight">AVEX</span>
        </div>
        <p className="text-slate-400 text-sm font-medium">Sistema de Gestión Integral</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm">
        <form
          onSubmit={handleLogin}
          className={`space-y-4 transition-all ${shake ? "animate-[wiggle_0.4s_ease-in-out]" : ""}`}
        >
          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              autoFocus
              className="pl-10 h-14 bg-[#1C2333] border-slate-600 text-white placeholder:text-slate-500 text-base rounded-xl focus:border-yellow-400 focus:ring-yellow-400/20"
            />
          </div>

          {/* Contraseña */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              className="pl-10 pr-12 h-14 bg-[#1C2333] border-slate-600 text-white placeholder:text-slate-500 text-base rounded-xl focus:border-yellow-400 focus:ring-yellow-400/20"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            disabled={!email || !password || isLoading}
            className="w-full h-14 bg-yellow-400 hover:bg-yellow-300 text-[#111827] font-black text-base rounded-xl disabled:opacity-50 transition-all active:scale-95"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-[#111827]/30 border-t-[#111827] rounded-full animate-spin" />
                Verificando...
              </div>
            ) : (
              "Ingresar"
            )}
          </Button>
        </form>
      </div>

      {/* Footer */}
      <p className="mt-12 text-slate-700 text-xs">AVEX © {new Date().getFullYear()}</p>
    </div>
  );
}
