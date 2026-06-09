'use client';

import { useState, useTransition } from "react";
import { Check, Trash2, AlertCircle } from "lucide-react";
import { toggleTaskAction, deleteTaskAction } from "../actions/task.actions";

type TaskProps = {
  task: {
    id: number;
    title: string;
    isCompleted: boolean;
    status: string;
    priority: string;
    createdAt: Date;
    categoryName?: string | null;
  };
};

export function TaskItem({ task }: TaskProps) {
  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);

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

  if (isDeleting) return null;

  const priorityColors: Record<string, string> = {
    low: "text-blue-500",
    medium: "text-amber-500",
    high: "text-orange-500",
    urgent: "text-destructive",
  };

  return (
    <div
      className={`group p-4 sm:p-5 rounded-2xl border bg-card text-card-foreground shadow-sm flex flex-col sm:flex-row sm:items-center gap-4 transition-all duration-300 hover:border-primary/30 hover:shadow-md animate-in fade-in slide-in-from-bottom-2 ${
        isPending ? "opacity-50 scale-[0.98]" : ""
      }`}
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

        <div className="flex-1 min-w-0 flex items-center gap-2">
          <span
            className={`text-lg truncate transition-all duration-300 ${
              task.isCompleted
                ? "line-through text-muted-foreground/60 font-light"
                : "font-semibold text-foreground/90"
            }`}
          >
            {task.title}
          </span>
          {!task.isCompleted && (
            <span title={`Prioridad: ${task.priority}`}>
               <AlertCircle className={`w-4 h-4 shrink-0 ${priorityColors[task.priority] || "text-muted-foreground"}`} />
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto mt-2 sm:mt-0 sm:ml-auto">
        <span className="text-xs text-muted-foreground/70 font-mono shrink-0">
          Añadida: {task.createdAt.toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
        </span>

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
  );
}
