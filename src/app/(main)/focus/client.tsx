"use client";

import { TaskItem } from "@/features/tasks/components/task-item";
import { format, isBefore, isAfter, addDays, startOfDay, endOfDay } from "date-fns";
import { es } from "date-fns/locale";

export function FocusClient({ tasks }: { tasks: any[] }) {
  const now = new Date();
  const todayStart = startOfDay(now);
  const nextWeekEnd = endOfDay(addDays(now, 7));

  const focusTasks = tasks.filter(t => {
    if (!t.dueDate || t.isCompleted) return false;
    const dueDate = new Date(t.dueDate);
    // Include tasks that are overdue or due within the next 7 days
    return isBefore(dueDate, nextWeekEnd);
  }).sort((a, b) => {
    const dateA = new Date(a.dueDate).getTime();
    const dateB = new Date(b.dueDate).getTime();
    if (dateA !== dateB) return dateA - dateB;
    
    // Sort by energy if dates are the same (low energy first, easiest)
    const energyScore = { low: 1, medium: 2, high: 3 };
    const eA = energyScore[a.energyLevel as keyof typeof energyScore] || 2;
    const eB = energyScore[b.energyLevel as keyof typeof energyScore] || 2;
    return eA - eB;
  });

  const overdueTasks = focusTasks.filter(t => isBefore(new Date(t.dueDate), todayStart));
  const upcomingTasks = focusTasks.filter(t => !isBefore(new Date(t.dueDate), todayStart));

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4">
      {overdueTasks.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-destructive flex items-center gap-2">
            ⚠️ Tareas Atrasadas
          </h2>
          <div className="space-y-3">
            {overdueTasks.map(t => <TaskItem key={t.id} task={t} />)}
          </div>
        </section>
      )}

      <section className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          📅 Próximos 7 Días
        </h2>
        {upcomingTasks.length === 0 ? (
          <div className="text-center py-12 border border-dashed rounded-3xl bg-card">
            <p className="text-xl text-muted-foreground font-medium mb-2">Todo bajo control</p>
            <p className="text-muted-foreground/70">No tienes tareas para los próximos 7 días.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingTasks.map(t => <TaskItem key={t.id} task={t} />)}
          </div>
        )}
      </section>
    </div>
  );
}
