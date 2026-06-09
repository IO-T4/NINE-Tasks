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
  LogOut
} from "lucide-react";

import { logoutAction } from "@/features/auth/actions";

type SidebarProps = {
  userRole?: string;
};

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { href: "/", label: "Tareas", icon: CheckSquare },
    { href: "/projects", label: "Proyectos", icon: FolderKanban },
    { href: "/calendar", label: "Calendario", icon: CalendarDays },
    { href: "/schedule", label: "Horario", icon: Clock },
  ];

  if (userRole === "admin") {
    links.push({ href: "/admin", label: "Admin", icon: ShieldCheck });
  }

  const toggle = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 border-b bg-background/80 backdrop-blur-md z-40 flex items-center justify-between px-4">
        <div className="font-extrabold tracking-tighter text-xl">NINE Tasks</div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button onClick={toggle} className="p-2 rounded-xl bg-card border">
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
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
        <div className="p-6 hidden md:flex items-center justify-between">
          <div className="font-extrabold tracking-tighter text-2xl">NINE Tasks</div>
          <ThemeToggle />
        </div>

        <div className="p-4 md:hidden border-b flex justify-between items-center bg-background">
          <div className="font-extrabold tracking-tighter text-xl">NINE Tasks</div>
          <button onClick={toggle} className="p-2 rounded-xl bg-muted"><X className="w-5 h-5" /></button>
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

        <div className="p-4 border-t border-border/50">
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
