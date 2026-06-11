import { getSchedulesAction, getExceptionsAction } from "@/features/schedule/actions";
import { ScheduleClient } from "./client";
import { getCategoriesAction } from "@/features/tasks/actions/task.actions";

export default async function SchedulePage() {
  const schedules = await getSchedulesAction();
  const exceptions = await getExceptionsAction();
  const categories = await getCategoriesAction();

  return (
    <div className="max-w-5xl mx-auto w-full px-4 py-4 md:py-12">
      <header className="mb-10 border-b pb-8 border-border/40">
        <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
          Horario <span className="text-muted-foreground font-light">Semanal</span>
        </h1>
        <p className="text-lg text-muted-foreground mt-2 font-light">
          Organiza tus rutinas repetitivas. Anula días concretos si surge un imprevisto.
        </p>
      </header>

      <ScheduleClient 
        initialSchedules={schedules} 
        initialExceptions={exceptions} 
        categories={categories} 
      />
    </div>
  );
}
