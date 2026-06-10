import { getTasksAction } from "@/features/tasks/actions/task.actions";
import { getSchedulesAction, getExceptionsAction } from "@/features/schedule/actions";
import { CalendarClient } from "@/features/tasks/components/calendar-client";

export default async function CalendarPage() {
  const tasks = await getTasksAction();
  const schedules = await getSchedulesAction();
  const exceptions = await getExceptionsAction();

  return (
    <div className="max-w-4xl mx-auto w-full px-4 py-8 md:py-12">
      <header className="mb-10 border-b pb-8 border-border/40">
        <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
          Calendario
        </h1>
        <p className="text-lg text-muted-foreground mt-2 font-light">
          Próximas tareas y horarios recurrentes.
        </p>
      </header>
      
      <CalendarClient tasks={tasks} schedules={schedules} exceptions={exceptions} />
    </div>
  );
}
