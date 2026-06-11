"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import { 
  CheckSquare, 
  FolderKanban, 
  CalendarDays, 
  Clock, 
  ShieldCheck, 
  Menu, 
  X,
  LogOut,
  LayoutDashboard,
  BarChart,
  Archive
} from "lucide-react";

import { logoutAction } from "@/features/auth/actions";
import { Zap, Trophy } from "lucide-react";
import { ScratchpadSidebar } from "@/features/notes/components/scratchpad-sidebar";

import { WeekendToggle } from "./weekend-toggle";

type SidebarProps = {
  userRole?: string;
  profile?: any;
  scratchpadContent?: string;
};

export function Sidebar({ userRole, profile, scratchpadContent = "" }: SidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { href: "/", label: "Tareas", icon: CheckSquare },
    { href: "/board", label: "Kanban", icon: LayoutDashboard },
    { href: "/focus", label: "Focus 7 Días", icon: Zap },
    { href: "/stats", label: "Estadísticas", icon: BarChart },
    { href: "/milestones", label: "Metas Maestras", icon: Trophy },
    { href: "/projects", label: "Proyectos", icon: FolderKanban },
    { href: "/calendar", label: "Calendario", icon: CalendarDays },
    { href: "/schedule", label: "Horario", icon: Clock },
    { href: "/weekly-review", label: "Weekly Review", icon: ShieldCheck },
    { href: "/archive", label: "Archivo Histórico", icon: Archive },
  ];

  if (userRole === "admin") {
    links.push({ href: "/admin", label: "Admin", icon: ShieldCheck });
  }

  const toggle = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 border-b bg-background/80 backdrop-blur-md z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <button onClick={toggle} className="p-2 rounded-xl bg-card border hover:bg-accent transition-colors">
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 pointer-events-none">
          <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain drop-shadow-md" />
          <div className="font-extrabold tracking-tighter text-lg hidden sm:block">NINE Tasks</div>
        </div>
        <div className="flex items-center gap-2">
          <WeekendToggle />
          <ThemeToggle />
        </div>
      </div>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-64 border-r bg-card/50 backdrop-blur-xl flex flex-col transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        <div className="p-6 hidden md:flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain drop-shadow-md" />
              <div className="font-extrabold tracking-tighter text-xl">NINE Tasks</div>
            </div>
            <div className="flex gap-1">
              <WeekendToggle />
              <ThemeToggle />
            </div>
          </div>
          {profile && (
            <div className="bg-primary/5 border rounded-2xl p-4 mt-2">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-sm flex items-center gap-1">
                  <Trophy className="w-4 h-4 text-amber-500" /> Nivel {profile.level}
                </span>
                {profile.prestige > 0 && (
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    P {profile.prestige}
                  </span>
                )}
              </div>
              <div className="w-full bg-muted rounded-full h-2.5">
                <div 
                  className="bg-primary h-2.5 rounded-full transition-all" 
                  style={{ width: `${(profile.xp / (profile.level * 100)) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-muted-foreground mt-2 font-medium text-right">
                {profile.xp} / {profile.level * 100} XP
              </p>
            </div>
          )}
        </div>

        <div className="p-4 md:hidden flex flex-col gap-4 border-b bg-background">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain drop-shadow-md" />
              <div className="font-extrabold tracking-tighter text-xl">NINE Tasks</div>
            </div>
            <button onClick={toggle} className="p-2 rounded-xl bg-muted hover:bg-accent transition-colors"><X className="w-5 h-5" /></button>
          </div>
          {profile && (
            <div className="bg-primary/5 border rounded-2xl p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-sm flex items-center gap-1">
                  <Trophy className="w-4 h-4 text-amber-500" /> Nivel {profile.level}
                </span>
                {profile.prestige > 0 && (
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    P {profile.prestige}
                  </span>
                )}
              </div>
              <div className="w-full bg-muted rounded-full h-2.5">
                <div 
                  className="bg-primary h-2.5 rounded-full transition-all" 
                  style={{ width: `${(profile.xp / (profile.level * 100)) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.href} 
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-md font-medium" 
                    : "text-muted-foreground hover:bg-primary/10 hover:text-foreground"
                }`}
              >
                <Icon className="w-5 h-5" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <ScratchpadSidebar initialContent={scratchpadContent} />

        <div className="p-4 border-t border-border/50 mt-auto">
          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all"
            >
              <LogOut className="w-5 h-5" />
              Cerrar Sesión
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
