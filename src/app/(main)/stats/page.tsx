import { getTasksAction } from "@/features/tasks/actions/task.actions";
import { getProfileAction } from "@/features/profile/actions";
import { StatsClient } from "./client";

export default async function StatsPage() {
  const tasks = await getTasksAction();
  const profile = await getProfileAction();
  
  return (
    <div className="mx-auto w-full px-4 py-8 md:py-12 flex flex-col min-h-screen">
      <header className="mb-6 flex-shrink-0">
        <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl flex items-center gap-3">
          📊 Estadísticas
        </h1>
        <p className="text-lg text-muted-foreground mt-2 font-light">
          Analiza tu rendimiento y progreso a lo largo del tiempo.
        </p>
      </header>
      
      <div className="flex-1">
        <StatsClient tasks={tasks} profile={profile} />
      </div>
    </div>
  );
}
