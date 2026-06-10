"use client";

import { useState, useEffect, useTransition } from "react";
import { Play, Pause, Square, CheckCircle2, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { updateTaskTimeAction, toggleTaskAction } from "@/features/tasks/actions/task.actions";

export function FocusSessionClient({ task }: { task: any }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(task.timeSpentSeconds || 0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((s: number) => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const handleSaveAndExit = () => {
    setIsActive(false);
    startTransition(async () => {
      await updateTaskTimeAction(task.id, seconds);
      router.back();
    });
  };



  const formatTime = (totalSecs: number) => {
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    if (h > 0) return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-3xl flex flex-col items-center justify-center p-4">
      <button 
        onClick={handleSaveAndExit}
        disabled={isPending}
        className="absolute top-8 left-8 p-3 bg-card border rounded-2xl hover:bg-muted transition-colors flex items-center gap-2"
      >
        <ChevronLeft className="w-5 h-5" /> Salir y Guardar
      </button>

      <div className="max-w-2xl w-full text-center space-y-12">
        <div className="space-y-4">
          <span className="text-primary font-bold tracking-widest uppercase bg-primary/10 px-4 py-1.5 rounded-full text-sm">
            Focus Mode
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter balance-text">
            {task.title}
          </h1>
          {task.description && (
            <p className="text-xl text-muted-foreground mt-4">{task.description}</p>
          )}
        </div>

        <div className="text-8xl md:text-9xl font-black font-mono tracking-tighter tabular-nums bg-gradient-to-b from-foreground to-foreground/50 bg-clip-text text-transparent">
          {formatTime(seconds)}
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={() => setIsActive(!isActive)}
            disabled={isPending}
            className={`w-24 h-24 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105 active:scale-95 ${
              isActive 
                ? 'bg-amber-500 hover:bg-amber-600 text-white' 
                : 'bg-primary hover:bg-primary/90 text-primary-foreground'
            }`}
          >
            {isActive ? <Pause className="w-10 h-10" /> : <Play className="w-10 h-10 ml-2" />}
          </button>
        </div>
        
        <p className="text-muted-foreground font-medium">
          {isActive ? "Modo enfoque activo. ¡A por ello!" : "Pausado. Presiona play para continuar."}
        </p>
      </div>
    </div>
  );
}
