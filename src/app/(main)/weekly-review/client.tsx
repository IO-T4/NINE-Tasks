/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useTransition } from "react";
import { archiveTasksAction } from "@/features/tasks/actions/task.actions";
import { ShieldCheck, CheckCircle2, Archive, ArrowRight, Loader2, Play } from "lucide-react";
import { useRouter } from "next/navigation";

export function WeeklyReviewClient({ initialTasks }: { initialTasks: any[] }) {
  const [step, setStep] = useState(0);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Find tasks that make sense for review
  const completedTasks = initialTasks.filter(t => t.isCompleted);
  const pendingOldTasks = initialTasks.filter(t => !t.isCompleted); // Let's just show all pending for simplicity or maybe > 7 days.
  
  const [selectedCompleted, setSelectedCompleted] = useState<Set<number>>(new Set(completedTasks.map(t => t.id)));
  const [selectedPending, setSelectedPending] = useState<Set<number>>(new Set());

  const toggleCompleted = (id: number) => {
    const next = new Set(selectedCompleted);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedCompleted(next);
  };

  const togglePending = (id: number) => {
    const next = new Set(selectedPending);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedPending(next);
  };

  const handleFinish = () => {
    const idsToArchive = [...Array.from(selectedCompleted), ...Array.from(selectedPending)];
    if (idsToArchive.length > 0) {
      startTransition(async () => {
        await archiveTasksAction(idsToArchive, true);
        setStep(3);
      });
    } else {
      setStep(3);
    }
  };

  return (
    <div className={`transition-all ${isPending ? 'opacity-50 pointer-events-none' : ''}`}>
      {step === 0 && (
        <div className="text-center py-20 bg-card border rounded-3xl shadow-sm px-6">
          <ShieldCheck className="w-20 h-20 text-primary mx-auto mb-6" />
          <h1 className="text-4xl font-extrabold tracking-tighter mb-4">Weekly Review</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Tómate 5 minutos para vaciar tu mente. Revisaremos las tareas completadas y las que llevan tiempo pendientes para limpiar tu vista principal.
          </p>
          <button 
            onClick={() => setStep(1)}
            className="bg-primary text-primary-foreground px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-all flex items-center gap-2 mx-auto"
          >
            <Play className="w-5 h-5" /> Iniciar Revisión
          </button>
        </div>
      )}

      {step === 1 && (
        <div className="bg-card border rounded-3xl shadow-sm p-8 animate-in fade-in slide-in-from-right-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">1</div>
            <div>
              <h2 className="text-2xl font-bold">Tareas Completadas</h2>
              <p className="text-muted-foreground">Selecciona cuáles quieres enviar al Archivo Histórico para limpiar el tablero.</p>
            </div>
          </div>

          <div className="space-y-3 mb-10 max-h-[50vh] overflow-y-auto pr-4">
            {completedTasks.length === 0 ? (
              <p className="text-muted-foreground py-4 text-center border rounded-xl border-dashed">No tienes tareas completadas recientes.</p>
            ) : (
              completedTasks.map(task => (
                <div key={task.id} className="flex items-center gap-4 p-4 border rounded-2xl cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => toggleCompleted(task.id)}>
                  <input type="checkbox" className="w-5 h-5 rounded border-border text-primary focus:ring-primary/50 cursor-pointer" checked={selectedCompleted.has(task.id)} readOnly />
                  <div className="flex-1">
                    <p className="font-semibold line-through text-muted-foreground">{task.title}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex justify-end border-t pt-6">
            <button 
              onClick={() => setStep(2)}
              className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold flex items-center gap-2"
            >
              Siguiente <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="bg-card border rounded-3xl shadow-sm p-8 animate-in fade-in slide-in-from-right-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">2</div>
            <div>
              <h2 className="text-2xl font-bold">Tareas Pendientes</h2>
              <p className="text-muted-foreground">¿Alguna de estas tareas ya no tiene sentido? Archívala y libera espacio mental.</p>
            </div>
          </div>

          <div className="space-y-3 mb-10 max-h-[50vh] overflow-y-auto pr-4">
            {pendingOldTasks.length === 0 ? (
              <p className="text-muted-foreground py-4 text-center border rounded-xl border-dashed">¡Qué bien! Tienes el buzón al día.</p>
            ) : (
              pendingOldTasks.map(task => (
                <div key={task.id} className="flex items-center gap-4 p-4 border rounded-2xl cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => togglePending(task.id)}>
                  <input type="checkbox" className="w-5 h-5 rounded border-border text-primary focus:ring-primary/50 cursor-pointer" checked={selectedPending.has(task.id)} readOnly />
                  <div className="flex-1">
                    <p className="font-semibold">{task.title}</p>
                    {task.categoryName && <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">{task.categoryName}</span>}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex justify-between border-t pt-6">
            <button onClick={() => setStep(1)} className="px-6 py-3 rounded-xl font-medium border hover:bg-muted transition-colors">Atrás</button>
            <button 
              onClick={handleFinish}
              disabled={isPending}
              className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold flex items-center gap-2"
            >
              {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Archive className="w-5 h-5" />} Archivar Seleccionadas y Terminar
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="text-center py-20 bg-card border rounded-3xl shadow-sm px-6 animate-in zoom-in-95">
          <CheckCircle2 className="w-24 h-24 text-green-500 mx-auto mb-6" />
          <h1 className="text-4xl font-extrabold tracking-tighter mb-4">¡Revisión Completada!</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Has limpiado tu lista de tareas. Disfruta del resto de la semana con la mente despejada.
          </p>
          <div className="flex justify-center gap-4">
            <button onClick={() => router.push('/archive')} className="px-6 py-3 rounded-xl font-medium border hover:bg-muted transition-colors">Ver Archivo</button>
            <button onClick={() => router.push('/')} className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold">Ir a Tareas</button>
          </div>
        </div>
      )}
    </div>
  );
}
