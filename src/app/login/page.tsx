"use client";

import { useActionState } from "react";
import { loginAction } from "@/features/auth/actions";
import { ThemeToggle } from "@/components/theme-toggle";
import { Lock, ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-background">
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="relative z-10 w-full max-w-md p-8 md:p-12 rounded-3xl border border-border/50 bg-card/60 backdrop-blur-xl shadow-2xl animate-in fade-in zoom-in-95 duration-500">
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 text-primary">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
            Acceso Privado
          </h1>
          <p className="text-muted-foreground">
            Introduce la contraseña maestra para continuar
          </p>
        </div>

        <form action={formAction} className="space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                name="deviceName"
                placeholder="Nombre de Dispositivo (ej: Mi Móvil)"
                required
                className="w-full px-5 py-4 rounded-xl bg-background/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground placeholder:text-muted-foreground/60"
              />
            </div>
            <div className="relative">
              <input
                type="password"
                name="password"
                placeholder="Contraseña..."
                required
                className="w-full px-5 py-4 rounded-xl bg-background/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground placeholder:text-muted-foreground/60"
              />
            </div>
            {state?.error && (
              <p className="text-sm text-destructive animate-in slide-in-from-top-1 font-medium pl-1">
                {state.error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 focus:ring-4 focus:ring-primary/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed group"
          >
            {isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Entrar
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
