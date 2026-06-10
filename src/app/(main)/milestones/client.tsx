"use client";

import { useState, useTransition } from "react";
import { createMilestoneAction, deleteMilestoneAction, toggleMilestoneAction } from "@/features/milestones/actions";
import { Plus, Trash2, Target, CheckCircle2 } from "lucide-react";

export function MilestonesClient({ initialMilestones, tasks }: { initialMilestones: any[], tasks: any[] }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    startTransition(async () => {
      await createMilestoneAction(title, description);
      setTitle("");
      setDescription("");
    });
  };

  const handleDelete = (id: number) => {
    startTransition(async () => {
      await deleteMilestoneAction(id);
    });
  };

  const handleToggle = (id: number, current: boolean) => {
    startTransition(async () => {
      await toggleMilestoneAction(id, !current);
    });
  };

  return (
    <div className="space-y-12">
      <form onSubmit={handleCreate} className="p-6 bg-card border rounded-3xl shadow-sm flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full space-y-2">
          <label className="text-sm font-medium">Meta / Objetivo</label>
          <input required value={title} onChange={e=>setTitle(e.target.value)} type="text" placeholder="Ej: Lanzar mi propio negocio" className="w-full px-4 py-3 rounded-xl bg-background border outline-none focus:border-primary" disabled={isPending} />
        </div>
        <div className="flex-1 w-full space-y-2">
          <label className="text-sm font-medium">Descripción (Opcional)</label>
          <input value={description} onChange={e=>setDescription(e.target.value)} type="text" placeholder="Detalles de la meta" className="w-full px-4 py-3 rounded-xl bg-background border outline-none focus:border-primary" disabled={isPending} />
        </div>
        <button disabled={isPending || !title} type="submit" className="w-full md:w-auto bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold hover:bg-primary/90 flex items-center justify-center gap-2 h-[50px]">
          <Plus className="w-5 h-5" /> Añadir Meta
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {initialMilestones.map((milestone) => {
          const milestoneTasks = tasks.filter(t => t.milestoneId === milestone.id);
          const completedTasks = milestoneTasks.filter(t => t.isCompleted).length;
          const totalTasks = milestoneTasks.length;
          const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

          return (
            <div key={milestone.id} className={`p-6 rounded-3xl border transition-all ${milestone.isCompleted ? 'bg-muted/50 opacity-80' : 'bg-card shadow-sm'}`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-start gap-3">
                  <button 
                    onClick={() => handleToggle(milestone.id, milestone.isCompleted)}
                    disabled={isPending}
                    className={`mt-1 rounded-full p-1 transition-colors ${milestone.isCompleted ? 'text-primary bg-primary/20' : 'text-muted-foreground hover:bg-muted'}`}
                  >
                    <CheckCircle2 className="w-6 h-6" />
                  </button>
                  <div>
                    <h3 className={`text-xl font-bold ${milestone.isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                      {milestone.title}
                    </h3>
                    {milestone.description && (
                      <p className="text-sm text-muted-foreground mt-1">{milestone.description}</p>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => handleDelete(milestone.id)} 
                  disabled={isPending} 
                  className="p-2 text-muted-foreground hover:text-destructive bg-muted hover:bg-destructive/10 rounded-xl transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-6 space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span className="flex items-center gap-1 text-muted-foreground"><Target className="w-4 h-4" /> Progreso de Tareas</span>
                  <span className={progress === 100 ? 'text-primary font-bold' : ''}>{progress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                  <div 
                    className={`h-3 rounded-full transition-all duration-500 ${progress === 100 ? 'bg-primary' : 'bg-blue-500'}`} 
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-right">{completedTasks} de {totalTasks} tareas completadas</p>
              </div>
            </div>
          );
        })}
      </div>
      
      {initialMilestones.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          <Target className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="text-xl font-semibold">No tienes metas a largo plazo</p>
          <p>Crea tu primera meta arriba y empieza a asignar tareas.</p>
        </div>
      )}
    </div>
  );
}
