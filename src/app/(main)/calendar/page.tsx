import { getTasksAction } from "@/features/tasks/actions/task.actions";
import { TaskItem } from "@/features/tasks/components/task-item";
import { CalendarDays } from "lucide-react";

export default async function CalendarPage() {
  const tasks = await getTasksAction();
  const tasksWithDueDates = tasks.filter(t => t.dueDate).sort((a,b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());

  return (
    <div className="max-w-4xl mx-auto w-full px-4 py-8 md:py-12">
      <header className="mb-10 border-b pb-8 border-border/40">
        <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
          Calendario
        </h1>
        <p className="text-lg text-muted-foreground mt-2 font-light">
          Próximas tareas ordenadas por fecha de vencimiento.
        </p>
      </header>
      
      <div className="space-y-4">
        {tasksWithDueDates.length === 0 ? (
          <div className="text-center py-16 px-6 border-2 border-dashed rounded-3xl bg-muted/20">
            <CalendarDays className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium text-muted-foreground">No hay tareas con fecha asignada.</p>
          </div>
        ) : (
          tasksWithDueDates.map(task => (
            <TaskItem key={task.id} task={task as any} />
          ))
        )}
      </div>
    </div>
  );
}
