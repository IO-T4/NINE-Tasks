import { useState, useTransition } from "react";
import { Check, Trash2, AlertCircle, Battery, Timer, CornerDownRight, Plus, Loader2, Pin, Zap } from "lucide-react";
import { toggleTaskAction, deleteTaskAction, createTaskAction } from "../actions/task.actions";
import Link from "next/link";

type TaskProps = {
  task: {
    id: number;
    title: string;
    isCompleted: boolean;
    status: string;
    priority: string;
    createdAt: Date;
    categoryName?: string | null;
    categoryId?: number | null;
    timeSpentSeconds?: number;
    energyLevel?: string;
    isPinned?: boolean;
    isMicroTask?: boolean;
  };
  allTasks?: any[];
  level?: number;
};

export function TaskItem({ task, allTasks = [], level = 0 }: TaskProps) {
  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");

  const subTasks = allTasks.filter(t => t.parentId === task.id);

  const handleToggle = () => {
    startTransition(async () => {
      await toggleTaskAction(task.id, !task.isCompleted);
    });
  };

  const handleDelete = () => {
    setIsDeleting(true);
    startTransition(async () => {
      await deleteTaskAction(task.id);
    });
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;

    startTransition(async () => {
      await createTaskAction(
        newSubtaskTitle,
        "medium",
        "medium",
        task.categoryId || null,
        null,
        task.id
      );
      setNewSubtaskTitle("");
      setIsAddingSubtask(false);
    });
  };

  if (isDeleting) return null;

  const priorityColors: Record<string, string> = {
    low: "text-blue-500",
    medium: "text-amber-500",
    high: "text-orange-500",
    urgent: "text-destructive",
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  const energyIcons: Record<string, { color: string, level: string }> = {
    low: { color: "text-green-500", level: "Baja" },
    medium: { color: "text-amber-500", level: "Media" },
    high: { color: "text-red-500", level: "Alta" },
  };

  return (
    <div className="flex flex-col w-full">
      <div
        className={`group p-4 sm:p-5 rounded-2xl border bg-card text-card-foreground shadow-sm flex flex-col sm:flex-row sm:items-center gap-4 transition-all duration-300 hover:border-primary/30 hover:shadow-md animate-in fade-in slide-in-from-bottom-2 ${
          isPending ? "opacity-50 scale-[0.98]" : ""
        } ${level > 0 ? "border-l-4 border-l-primary/30" : ""}`}
      >
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <button
            onClick={handleToggle}
            disabled={isPending}
            className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
              task.isCompleted
                ? "bg-primary border-primary text-primary-foreground"
                : "border-muted-foreground/30 hover:border-primary/50 text-transparent"
            }`}
            aria-label={task.isCompleted ? "Marcar como pendiente" : "Marcar como completada"}
          >
            <Check className={`w-3.5 h-3.5 transition-transform ${task.isCompleted ? "scale-100" : "scale-0"}`} />
          </button>

          <div className="flex flex-col flex-1 min-w-0 py-1">
          <div className="flex items-center gap-2 flex-wrap">
            {task.isMicroTask && (
              <span className="text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider flex items-center gap-0.5" title="Micro-tarea (5 Min)">
                <Zap className="w-3 h-3" /> 5 MIN
              </span>
            )}
            <Link 
              href={`/focus/${task.id}`}
              className={`text-base font-semibold truncate hover:text-primary transition-colors hover:underline ${
                task.isCompleted ? "line-through text-muted-foreground" : "text-foreground"
              }`}
            >
              {task.title}
            </Link>
            {!task.isCompleted && (
              <>
                <span title={`Prioridad: ${task.priority}`}>
                   <AlertCircle className={`w-4 h-4 shrink-0 ${priorityColors[task.priority] || "text-muted-foreground"}`} />
                </span>
                {task.energyLevel && (
                  <span title={`Energía Requerida: ${energyIcons[task.energyLevel]?.level}`} className="flex items-center">
                    <Battery className={`w-4 h-4 shrink-0 ${energyIcons[task.energyLevel]?.color || "text-muted-foreground"}`} />
                  </span>
                )}
              </>
            )}
          </div>
        </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto mt-2 sm:mt-0 sm:ml-auto">
          {(task.timeSpentSeconds || 0) > 0 && (
            <span className="text-xs font-semibold text-primary/80 bg-primary/10 px-2 py-1 rounded-md shrink-0 border border-primary/20">
              {formatTime(task.timeSpentSeconds!)}
            </span>
          )}
          <span className="text-xs text-muted-foreground/70 font-mono shrink-0 hidden sm:inline mr-2">
            {task.createdAt.toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
          </span>

          <Link 
            href={`/focus/${task.id}`}
            className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 text-muted-foreground/40 hover:text-amber-500 hover:bg-amber-500/10 transition-all p-2 rounded-xl shrink-0 flex items-center gap-1"
            aria-label="Focus Mode"
            title="Modo Focus"
          >
            <Timer className="w-5 h-5" />
          </Link>

          <button
            onClick={() => setIsAddingSubtask(!isAddingSubtask)}
            className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 text-muted-foreground/40 hover:text-primary hover:bg-primary/10 transition-all p-2 rounded-xl focus:opacity-100 shrink-0"
            title="Añadir sub-tarea"
          >
            <Plus className="w-5 h-5" />
          </button>

          <button
            onClick={() => startTransition(async () => {
              const { toggleTaskPinAction } = await import("../actions/task.actions");
              await toggleTaskPinAction(task.id, !task.isPinned);
            })}
            disabled={isPending}
            className={`opacity-100 sm:group-hover:opacity-100 transition-all p-2 rounded-xl focus:opacity-100 shrink-0 ${
              task.isPinned 
                ? "text-primary bg-primary/10 opacity-100" 
                : "text-muted-foreground/40 hover:text-primary hover:bg-primary/10 sm:opacity-0"
            }`}
            title={task.isPinned ? "Desfijar tarea" : "Fijar arriba"}
          >
            <Pin className="w-5 h-5" />
          </button>

          <button
            onClick={handleDelete}
            disabled={isPending}
            className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-all p-2 rounded-xl focus:opacity-100 shrink-0"
            aria-label="Eliminar tarea"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {isAddingSubtask && (
        <form onSubmit={handleAddSubtask} className="ml-6 sm:ml-12 mt-2 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CornerDownRight className="w-4 h-4 text-muted-foreground shrink-0" />
          <input 
            type="text" 
            placeholder="Nueva sub-tarea..." 
            className="flex-1 text-sm bg-background border rounded-lg px-3 py-1.5 outline-none focus:border-primary transition-colors"
            value={newSubtaskTitle}
            onChange={e => setNewSubtaskTitle(e.target.value)}
            disabled={isPending}
            autoFocus
          />
          <button type="submit" disabled={isPending || !newSubtaskTitle.trim()} className="bg-primary text-primary-foreground p-1.5 rounded-lg disabled:opacity-50">
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          </button>
        </form>
      )}

      {subTasks.length > 0 && (
        <div className="ml-6 sm:ml-12 mt-2 space-y-2 relative before:absolute before:left-[-1.2rem] before:top-4 before:bottom-4 before:w-px before:bg-border">
          {subTasks.map(st => (
            <div key={st.id} className="relative">
              <CornerDownRight className="absolute -left-6 top-5 w-4 h-4 text-border" />
              <TaskItem task={st} allTasks={allTasks} level={level + 1} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
